"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, CalendarDays, Compass, Sparkles, UserRound, Wallet, Briefcase, ListChecks, Building2 } from "@/ui/icons";
import { Menu, Close } from "@/ui/icons";
import { Mark } from "./mark";
import type { NavItem } from "./nav";
import { cn } from "./cn";

const ICONS = { home: Home, stays: CalendarDays, explore: Compass, services: Sparkles, profile: UserRound, earnings: Wallet, jobs: Briefcase, tasks: ListChecks, properties: Building2 } as const;

function isActive(pathname: string, href: string) {
  if (href === "/home" || href === "/pro" || href === "/ops" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Menú de móvil: barra superior con el símbolo y la hamburguesa; el panel entra
 * desde la derecha. Sustituye a la tabbar: cinco destinos fijos abajo limitaban
 * la navegación y comían pantalla sobre la fotografía.
 */
export function MobileMenu({ items, name, contextLabel }: { items: NavItem[]; name: string; contextLabel: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Al navegar, el panel se cierra solo.
  useEffect(() => setOpen(false), [pathname]);

  // Con el panel abierto, el fondo no se desplaza.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] px-4 py-2.5 backdrop-blur-xl md:hidden"
        style={{ paddingTop: "calc(10px + var(--safe-t))" }}
      >
        <Link href={items[0]?.href ?? "/home"} className="inline-flex items-center gap-2.5">
          <Mark size={24} />
          <span className="font-serif text-[13px] uppercase tracking-[0.28em]">All Living</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={open}
          className="tapable-icon -mr-1.5 inline-flex size-11 items-center justify-center rounded-[var(--radius-pill)] text-text"
        >
          <Menu size={26} aria-hidden />
        </button>
      </header>

      {/* Velo */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px] transition-opacity duration-[var(--duration-nav)] md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Panel */}
      <nav
        aria-label="Principal"
        aria-hidden={!open}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[82%] max-w-sm flex-col bg-surface shadow-[var(--shadow-float)] md:hidden",
          "transition-transform duration-[var(--duration-nav)] ease-[var(--ease-firm)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
        style={{ paddingTop: "var(--safe-t)", paddingBottom: "var(--safe-b)" }}
      >
        <div className="flex items-center justify-between px-5 py-4">
          <span className="inline-flex items-center gap-2.5">
            <Mark size={22} />
            <span className="font-serif text-[13px] uppercase tracking-[0.28em]">All Living</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar menú"
            className="tapable-icon -mr-1.5 inline-flex size-11 items-center justify-center rounded-[var(--radius-pill)] text-text"
          >
            <Close size={24} aria-hidden />
          </button>
        </div>

        <ul className="mt-2 flex flex-col gap-1 px-3">
          {items.map((it) => {
            const Icon = ICONS[it.icon];
            const active = isActive(pathname, it.href);
            return (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "tapable-row flex min-h-14 items-center gap-3.5 rounded-[var(--radius-ctl)] px-3 text-[16px]",
                    active ? "bg-accent-soft font-medium text-green-900" : "text-text-2",
                  )}
                >
                  <Icon size={22} aria-hidden />
                  {it.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-auto border-t border-line px-5 py-5">
          <p className="truncate text-[15px] font-medium">{name}</p>
          <Link href="/profile/mode" className="text-[13px] text-muted">
            {contextLabel} · cambiar modo
          </Link>
        </div>
      </nav>
    </>
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
                <Icon size={19} aria-hidden />
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
