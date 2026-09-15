import Image from "next/image";
import Link from "next/link";
import { Settings, Home, CalendarDays, Sparkles, Users, Wallet, Gift, LifeBuoy, Bell, ShieldCheck, Repeat, SlidersHorizontal, IdCard, BadgeCheck } from "@/ui/icons";
import { SignOutButton } from "@clerk/nextjs";
import { requireUser } from "@/domains/identity/current-user";
import { ROLE_LABEL } from "@/core/roles";
import { Page } from "@/ui/page";
import { ListRow, RowGroup } from "@/ui/primitives";

const GROUPS = [
  { title: "Mi mundo", items: [{ href: "/properties", label: "Mis propiedades", Icon: Home }, { href: "/stays", label: "Mis estancias", Icon: CalendarDays }, { href: "/bookings", label: "Mis servicios", Icon: Sparkles }, { href: "/stays", label: "Mis invitados", Icon: Users }, { href: "/pass", label: "Living Pass", Icon: IdCard }] },
  { title: "Dinero y beneficios", items: [{ href: "/income", label: "Mis pagos e ingresos", Icon: Wallet }, { href: "/profile/benefits", label: "Beneficios All Living", Icon: Gift }] },
  { title: "Cuenta", items: [{ href: "/confianza", label: "Centro de confianza", Icon: BadgeCheck }, { href: "/support", label: "Soporte", Icon: LifeBuoy }, { href: "/notifications", label: "Notificaciones", Icon: Bell }, { href: "/profile/preferences", label: "Preferencias", Icon: SlidersHorizontal }, { href: "/profile/security", label: "Seguridad", Icon: ShieldCheck }, { href: "/profile/mode", label: "Cambiar modo", Icon: Repeat }] },
];

/** Pantalla 46: perfil. Cabecera en panel verde, listas agrupadas con icono y chevron. */
export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <Page>
      <section className="profile-living-hero md:mt-6">
        <div className="profile-living-orb" aria-hidden />
        <div className="relative z-10 flex justify-end pt-4"><Link href="/profile/preferences" aria-label="Ajustes" className="press flex size-11 items-center justify-center rounded-full bg-white/55 text-[#17414c] backdrop-blur-xl hover:bg-white/75"><Settings size={20} /></Link></div>
        <div className="relative z-10 flex flex-col items-center pb-8 text-center">
          <span className="relative size-24 overflow-hidden rounded-full bg-white/55 ring-1 ring-white/90 shadow-[0_14px_36px_rgb(4_104_130_/_0.16)]">{user.avatarUrl ? <Image src={user.avatarUrl} alt="" fill sizes="96px" className="object-cover" /> : null}</span>
          <p className="mt-5 text-[9px] tracking-[.3em] text-[#08758d]">ALL LIVING MEMBER</p>
          <h1 className="mt-2 text-[30px] leading-tight text-[#102e37]">{user.name}</h1>
          <p className="mt-1 text-[13px] text-[#52727a]">{ROLE_LABEL[user.activeContext]} · cambia de modo cuando quieras</p>
        </div>
      </section>
      <div className="mt-6 flex flex-col gap-6">
        {[...GROUPS, ...(user.roles.includes("operator") || user.roles.includes("admin") ? [{ title: "Equipo All Living", items: [
          ...(user.roles.includes("operator") ? [{ href: "/ops", label: "Operación", Icon: Settings }] : []),
          ...(user.roles.includes("admin") ? [{ href: "/admin", label: "Administración", Icon: ShieldCheck }] : []),
        ] }] : [])].map((g) => <RowGroup key={g.title} title={g.title}>{g.items.map((it) => <ListRow key={it.href + it.label} href={it.href} Icon={it.Icon} title={it.label} />)}</RowGroup>)}
      </div>
      <div className="mt-10 text-center">
        <SignOutButton redirectUrl="/welcome"><button className="press min-h-11 px-4 text-sm text-text-2 underline-offset-4 hover:underline">Cerrar sesión</button></SignOutButton>
      </div>
    </Page>
  );
}
