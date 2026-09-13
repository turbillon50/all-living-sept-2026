import { getSessionUser } from "@/domains/identity/current-user";
import { homeFor } from "@/core/roles";
import { Splash } from "./splash";

export const dynamic = "force-dynamic";

/** Entrada de marca. Con sesión va al contexto; sin sesión al brand moment. */
export default async function Root() {
  const user = await getSessionUser();
  const target = user ? homeFor(user.activeContext) : "/welcome";
  return <Splash target={target} />;
}
