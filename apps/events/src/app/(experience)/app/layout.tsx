import type { Metadata } from "next";
import { AppShell } from "@/features/experience/shell";
export const metadata: Metadata = { title: "Tu próxima gran noche", robots: { index: false, follow: true } };
export default function InteriorLayout({ children }: { children: React.ReactNode }) { return <AppShell>{children}</AppShell>; }
