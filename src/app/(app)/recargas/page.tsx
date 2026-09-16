import { redirect } from "next/navigation";
/** Keep existing recharge links working while cards become the main product. */
export default async function RechargeRedirect({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const params = new URLSearchParams({ kind: "topups" });
  for (const key of ["kind", "country", "page"]) if (typeof query[key] === "string") params.set(key, query[key]);
  redirect(`/tarjetas?${params}`);
}
