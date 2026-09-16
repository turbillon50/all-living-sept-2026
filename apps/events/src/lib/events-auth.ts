/** Only the dedicated Events instance is allowed to authenticate this module. */
export function eventsAuthReady(publishableKey: string | undefined, secretKey: string | undefined, production: boolean) {
  if (!publishableKey || !secretKey) return false;
  const mode = publishableKey.startsWith("pk_live_") ? "live" : publishableKey.startsWith("pk_test_") ? "test" : null;
  if (!mode || !secretKey.startsWith(`sk_${mode}_`) || (production && mode !== "live")) return false;
  try {
    const host = Buffer.from(publishableKey.split("_").slice(2).join("_"), "base64").toString("utf8");
    return host === (mode === "live" ? "clerk.events.alliving.live$" : "credible-foxhound-920.clerk.accounts.dev$");
  } catch { return false; }
}
