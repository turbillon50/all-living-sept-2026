/** Distribución de inventario hacia PMS / canales (Airbnb, Booking, Expedia, directo). */
export type InventoryListing = {
  inventoryId: string;
  propertyName: string;
  destination: string;
  checkIn: string;
  checkOut: string;
  nightlyRateEstimate: number | null;
  currency: string;
  minNights: number;
};

export interface ChannelManagerProvider {
  readonly name: string;
  readonly isLocal: boolean;
  /** Publica o actualiza el inventario. El local solo lo registra: no existe conexión real. */
  publish(listing: InventoryListing): Promise<{ externalRef: string | null; published: boolean }>;
  withdraw(inventoryId: string): Promise<{ ok: boolean }>;
}
