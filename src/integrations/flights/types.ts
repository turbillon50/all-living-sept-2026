export type Place = { id: string; iata_code: string; name: string; city_name: string | null; iata_country_code: string; type: "airport" | "city" };
export type Airport = { iata_code: string; name?: string; city_name?: string | null };
export type Carrier = { name: string; iata_code: string | null; logo_symbol_url?: string | null; logo_lockup_url?: string | null };
export type FlightSegment = {
  id: string; departing_at: string; arriving_at: string; duration: string;
  origin: Airport; destination: Airport; origin_terminal?: string | null; destination_terminal?: string | null;
  marketing_carrier: Carrier; operating_carrier: Carrier; marketing_carrier_flight_number?: string;
  stops?: Array<{ airport: Airport; duration: string }>;
  passengers?: Array<{ cabin_class?: string; cabin_class_marketing_name?: string; baggages?: Array<{ type: string; quantity: number }> }>;
};
export type FlightSlice = { duration: string; origin: Airport; destination: Airport; segments: FlightSegment[]; fare_brand_name?: string | null };
export type FlightOffer = { id: string; total_amount: string; total_currency: string; expires_at: string; owner: Carrier; slices: FlightSlice[] };
