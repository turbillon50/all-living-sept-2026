import type { ChannelManagerProvider, InventoryListing } from "./channel-manager-provider";

export type { ChannelManagerProvider, InventoryListing };

/** ADAPTADOR LOCAL: no publica en ningún canal. Airbnb/Booking/Expedia requieren API autorizada (INTEGRATIONS.md). */
class LocalChannelManager implements ChannelManagerProvider {
  readonly name = "local";
  readonly isLocal = true;
  async publish(): Promise<{ externalRef: string | null; published: boolean }> {
    return { externalRef: null, published: false };
  }
  async withdraw() {
    return { ok: true };
  }
}

export function channelManager(): ChannelManagerProvider {
  return new LocalChannelManager();
}
