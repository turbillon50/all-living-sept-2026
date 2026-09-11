import { createHash } from "node:crypto";
import Image from "next/image";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { getSessionUser } from "@/domains/identity/current-user";
import { acceptInvite } from "@/domains/stays/actions";
import { formatRange } from "@/core/format";
import { Button, ButtonLink } from "@/ui/button";
import { Wordmark } from "@/ui/wordmark";

export const dynamic = "force-dynamic";

/** Deep link de invitación. Sin cuenta → crearla y volver aquí. Con cuenta → aceptar. */
export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const hash = createHash("sha256").update(token).digest("hex");
  const at = await db().query.accessTokens.findFirst({ where: eq(schema.accessTokens.tokenHash, hash) });
  const valid = at && at.kind === "guest_invite" && at.stayId && !at.revokedAt && at.expiresAt > new Date();
  const stay = valid && at.stayId ? await db().query.stays.findFirst({ where: eq(schema.stays.id, at.stayId) }) : null;
  const property = stay ? await db().query.properties.findFirst({ where: eq(schema.properties.id, stay.propertyId) }) : null;
  const host = stay ? await db().query.users.findFirst({ where: eq(schema.users.id, stay.hostUserId) }) : null;
  const user = await getSessionUser();
  const accept = acceptInvite.bind(null, token);

  return (
    <main className="relative min-h-dvh bg-green-950 text-ivory">
      <Image src="/demo/villa-interior.webp" alt="" fill sizes="100vw" className="object-cover opacity-70" priority />
      <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-950/50 to-transparent" />
      <div className="relative flex min-h-dvh flex-col justify-end px-6 pb-12 pt-safe md:items-center md:justify-center md:text-center fade-up">
        <Wordmark className="items-start md:items-center text-ivory [&_span]:text-ivory" />
        {!valid || !stay || !property ? (
          <>
            <h1 className="mt-8 text-[34px] leading-[1.06]">Esta invitación ya no está disponible.</h1>
            <p className="mt-3 text-ivory/80">Pídele a quien te invitó que te mande una nueva.</p>
            <div className="mt-8 w-full max-w-sm"><ButtonLink href="/welcome" size="lg" variant="light">Conocer All Living</ButtonLink></div>
          </>
        ) : (
          <>
            <p className="mt-8 text-[11px] tracking-[0.34em] uppercase text-ivory/70">{host?.name ?? "Alguien"} te invita</p>
            <h1 className="mt-3 text-[36px] leading-[1.04]">{property.name} · {property.destination}</h1>
            <p className="mt-3 text-[17px] text-ivory/85">{formatRange(stay.startDate, stay.endDate)}</p>
            <div className="mt-8 w-full max-w-sm">
              {user ? (
                <form action={accept}><Button type="submit" size="lg" variant="light">Aceptar invitación</Button></form>
              ) : (
                <ButtonLink href={`/sign-up?redirect_url=${encodeURIComponent(`/i/${token}`)}`} size="lg" variant="light">Crear mi cuenta y entrar</ButtonLink>
              )}
              {!user ? <ButtonLink href={`/sign-in?redirect_url=${encodeURIComponent(`/i/${token}`)}`} size="lg" variant="ghost-light" className="mt-2">Ya tengo cuenta</ButtonLink> : null}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
