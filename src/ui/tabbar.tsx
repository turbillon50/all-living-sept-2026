"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Compass, Sparkles, UserRound, Wallet, Briefcase, ListChecks, Building2 } from "lucide-react";
import type { NavItem } from "./nav";
import { cn } from "./cn";

const ICONS = { home: Home, stays: CalendarDays, explore: Compass, services: Sparkles, profile: UserRound, earnings: Wallet, jobs: Briefcase, tasks: ListChecks, properties: Building2 } as const;

function isActive(pathname: string, href: string) {
  if (href === "/home" || href === "/pro" || href === "/ops" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/** Tabbar fija en móvil: respeta safe-area, nunca tapa contenido (las páginas usan .pb-tabbar). */
export function TabBar({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] backdrop-blur-xl border-t border-line"
      style={{ paddingBottom: "var(--safe-b)" }}
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)`, height: "var(--tabbar-h)" }}>
        {items.map((it) => {
          const Icon = ICONS[it.icon];
          const active = isActive(pathname, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press flex h-full flex-col items-center justify-center gap-1 text-[11px] font-medium tracking-wide transition-colors",
                  active ? "text-accent" : "text-muted",
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.1 : 1.7} aria-hidden />
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Sidebar de escritorio. */
export function Sidebar({ items, name, contextLabel }: { items: NavItem[]; name: string; contextLabel: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col border-r border-line bg-surface/60 px-5 py-8 sticky top-0 h-dvh">
      <Link href={items[0]?.href ?? "/home"} className="px-2">
        <span className="font-serif text-[18px] tracking-[0.3em] uppercase">All Living</span>
      </Link>
      <p className="px-2 mt-1 text-[10px] tracking-[0.3em] uppercase text-muted">Stay · Enjoy · Belong</p>
      <ul className="mt-10 flex flex-col gap-1">
        {items.map((it) => {
          const Icon = ICONS[it.icon];
          const active = isActive(pathname, it.href);
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press flex items-center gap-3 rounded-[var(--radius-ctl)] px-3 py-2.5 text-[15px] transition-colors",
                  active ? "bg-accent-soft text-green-900 font-medium" : "text-text-2 hover:bg-surface-2",
                )}
              >
                <Icon size={19} strokeWidth={1.8} aria-hidden />
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto px-2">
        <p className="text-sm font-medium truncate">{name}</p>
        <Link href="/profile/mode" className="text-[12px] text-muted hover:text-text">
          {contextLabel} · cambiar modo
        </Link>
      </div>
    </aside>
  );
}
