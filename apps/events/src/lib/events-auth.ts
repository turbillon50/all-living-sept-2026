/** Only the dedicated Events instance is allowed to authenticate this module. */
export function eventsAuthReady(publishableKey: string | undefined, secretKey: string | undefined) {
  if (!publishableKey?.startsWith("pk_live_") || !secretKey?.startsWith("sk_live_")) return false;
  try {
    const host = Buffer.from(publishableKey.split("_").slice(2).join("_"), "base64").toString("utf8");
    return host === "clerk.events.alliving.live$";
  } catch { return false; }
}
