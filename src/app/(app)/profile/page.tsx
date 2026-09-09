import Image from "next/image";
import Link from "next/link";
import { Settings, Home, CalendarDays, Sparkles, Users, Wallet, Gift, LifeBuoy, Bell, ShieldCheck, Repeat, SlidersHorizontal, IdCard } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { requireUser } from "@/domains/identity/current-user";
import { ROLE_LABEL } from "@/core/roles";
import { Page } from "@/ui/page";
import { BrandPanel, ListRow, RowGroup } from "@/ui/primitives";

const GROUPS = [
  { title: "Mi mundo", items: [{ href: "/properties", label: "Mis propiedades", Icon: Home }, { href: "/stays", label: "Mis estancias", Icon: CalendarDays }, { href: "/bookings", label: "Mis servicios", Icon: Sparkles }, { href: "/stays", label: "Mis invitados", Icon: Users }, { href: "/pass", label: "Living Pass", Icon: IdCard }] },
  { title: "Dinero y beneficios", items: [{ href: "/income", label: "Mis pagos e ingresos", Icon: Wallet }, { href: "/profile/benefits", label: "Beneficios All Living", Icon: Gift }] },
  { title: "Cuenta", items: [{ href: "/support", label: "Soporte", Icon: LifeBuoy }, { href: "/notifications", label: "Notificaciones", Icon: Bell }, { href: "/profile/preferences", label: "Preferencias", Icon: SlidersHorizontal }, { href: "/profile/security", label: "Seguridad", Icon: ShieldCheck }, { href: "/profile/mode", label: "Cambiar de rol", Icon: Repeat }] },
];

/** Pantalla 46: perfil. Cabecera en panel verde, listas agrupadas con icono y chevron. */
export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <Page>
      <BrandPanel className="pb-8 md:mt-6">
        <div className="flex justify-end pt-4"><Link href="/profile/preferences" aria-label="Ajustes" className="press flex size-11 items-center justify-center rounded-full text-ivory/80 hover:bg-ivory/10"><Settings size={20} strokeWidth={1.7} /></Link></div>
        <div className="flex flex-col items-center text-center">
          <span className="relative size-24 overflow-hidden rounded-full bg-ivory/10 ring-2 ring-ivory/30">{user.avatarUrl ? <Image src={user.avatarUrl} alt="" fill sizes="96px" className="object-cover" /> : null}</span>
          <h1 className="mt-4 text-[26px] leading-tight text-ivory">{user.name}</h1>
          <p className="mt-1 text-[13px] text-ivory/70">{ROLE_LABEL[user.activeContext]} · All Living Member{user.isDemo ? " · demo" : ""}</p>
        </div>
      </BrandPanel>
      <div className="mt-6 flex flex-col gap-6">
        {GROUPS.map((g) => <RowGroup key={g.title} title={g.title}>{g.items.map((it) => <ListRow key={it.href + it.label} href={it.href} Icon={it.Icon} title={it.label} />)}</RowGroup>)}
      </div>
      <div className="mt-10 text-center">
        <SignOutButton redirectUrl="/welcome"><button className="press min-h-11 px-4 text-sm text-text-2 underline-offset-4 hover:underline">Cerrar sesión</button></SignOutButton>
      </div>
    </Page>
  );
}
