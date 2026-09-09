import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { requireUser } from "@/domains/identity/current-user";
import { ROLE_LABEL } from "@/core/roles";
import { Page } from "@/ui/page";
import { Chip } from "@/ui/chip";

const GROUPS: Array<{ title: string; items: Array<{ href: string; label: string }> }> = [
  { title: "Mi mundo", items: [{ href: "/properties", label: "Mis propiedades" }, { href: "/weeks", label: "Mis semanas" }, { href: "/stays", label: "Mis estancias" }, { href: "/pass", label: "Living Pass" }] },
  { title: "Servicios y dinero", items: [{ href: "/bookings", label: "Mis servicios" }, { href: "/income", label: "Ingresos" }, { href: "/profile/payments", label: "Métodos de pago" }] },
  { title: "Cuenta", items: [{ href: "/profile/preferences", label: "Preferencias" }, { href: "/notifications", label: "Notificaciones" }, { href: "/profile/security", label: "Seguridad y privacidad" }, { href: "/profile/mode", label: "Cambiar modo" }] },
];

/** Pantalla 46: perfil agrupado, no lista interminable. */
export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <Page>
      <header className="flex items-center gap-4 pt-10 md:pt-14 fade-up">
        <div className="relative size-16 overflow-hidden rounded-full bg-sand-200">
          {user.avatarUrl ? <Image src={user.avatarUrl} alt="" fill sizes="64px" className="object-cover" /> : null}
        </div>
        <div className="min-w-0">
          <h1 className="text-[26px] leading-tight truncate">{user.name}</h1>
          <p className="text-sm text-text-2">Member {user.memberId}</p>
          <div className="mt-1.5 flex gap-1.5">
            <Chip tone="accent">{ROLE_LABEL[user.activeContext]}</Chip>
            {user.isDemo ? <Chip>Demo</Chip> : null}
          </div>
        </div>
      </header>

      {GROUPS.map((g) => (
        <section key={g.title} className="mt-8">
          <h2 className="mb-2 text-[12px] tracking-[0.24em] uppercase text-muted font-sans font-medium">{g.title}</h2>
          <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface hairline">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="press flex min-h-13 items-center justify-between px-4 text-[15px] hover:bg-surface-2">
                  {it.label}
                  <ChevronRight size={18} className="text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="mt-10 text-center">
        <SignOutButton redirectUrl="/welcome">
          <button className="press text-sm text-text-2 underline-offset-4 hover:underline min-h-11 px-4">Cerrar sesión</button>
        </SignOutButton>
      </div>
    </Page>
  );
}
