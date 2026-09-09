import { env } from "@/core/env";

/** Mapas. Sin token: solo coordenadas y enlaces a apps nativas. Con MAPBOX_TOKEN: tiles estáticos. */
export interface MapsProvider {
  readonly name: string;
  readonly isLocal: boolean;
  staticMapUrl(lat: number, lng: number, opts?: { width?: number; height?: number; zoom?: number }): string | null;
  directionsUrl(lat: number, lng: number): string;
}

class StaticMapsProvider implements MapsProvider {
  readonly name = "static";
  readonly isLocal = true;
  staticMapUrl(lat: number, lng: number, opts?: { width?: number; height?: number; zoom?: number }) {
    const token = env().MAPBOX_TOKEN;
    if (!token) return null;
    const w = opts?.width ?? 640;
    const h = opts?.height ?? 360;
    const z = opts?.zoom ?? 13;
    return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s+0f3d3a(${lng},${lat})/${lng},${lat},${z},0/${w}x${h}@2x?access_token=${token}`;
  }
  directionsUrl(lat: number, lng: number) {
    return `https://maps.apple.com/?daddr=${lat},${lng}`;
  }
}

export function maps(): MapsProvider {
  return new StaticMapsProvider();
}
