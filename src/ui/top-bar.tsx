"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "./cn";

/** Barra superior de pantallas internas: volver + título. Fina, sin peso. */
export function TopBar({ title, back, action, className }: { title?: string; back?: string; action?: React.ReactNode; className?: string }) {
  const router = useRouter();
  return (
    <div className={cn("sticky top-0 z-30 -mx-5 md:-mx-8 px-3 md:px-6 pt-safe bg-[color-mix(in_oklab,var(--color-bg)_86%,transparent)] backdrop-blur-xl", className)}>
      <div className="flex h-14 items-center justify-between">
        {back !== undefined ? (
          back ? (
            <Link href={back} aria-label="Volver" className="press flex size-11 items-center justify-center rounded-full text-text hover:bg-surface-2">
              <ChevronLeft size={22} />
            </Link>
          ) : (
            <button type="button" onClick={() => router.back()} aria-label="Volver" className="press flex size-11 items-center justify-center rounded-full text-text hover:bg-surface-2">
              <ChevronLeft size={22} />
            </button>
          )
        ) : (
          <span className="size-11" />
        )}
        {title ? <span className="text-[15px] font-medium truncate">{title}</span> : <span />}
        <div className="flex size-11 items-center justify-end">{action}</div>
      </div>
    </div>
  );
}
