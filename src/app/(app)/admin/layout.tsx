import { requireRole } from "@/domains/identity/current-user";

export const dynamic = "force-dynamic";

/** Zona admin aislada: nunca en la tabbar pública. Solo rol admin otorgado. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("admin");
  return <>{children}</>;
}
