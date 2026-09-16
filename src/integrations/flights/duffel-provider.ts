import "server-only";
import { env } from "@/core/env";
import { matchesAirports, publicOffer } from "./offer-utils";
import type { FlightOffer, Place } from "./types";
export type { FlightOffer, Place } from "./types";

const BASE="https://api.duffel.com";
function token(){const t=env().DUFFEL_ACCESS_TOKEN;if(!t)throw new Error("DUFFEL_ACCESS_TOKEN no configurado");return t}
async function request<T>(path:string,init?:RequestInit):Promise<T>{const r=await fetch(`${BASE}${path}`,{...init,headers:{Accept:"application/json","Duffel-Version":"v2",Authorization:`Bearer ${token()}`,...(init?.body?{"Content-Type":"application/json"}:{}),...(init?.headers??{})},cache:"no-store",signal:AbortSignal.timeout(25000)});if(!r.ok)throw new Error("No pudimos consultar las aerolíneas. Intenta de nuevo en un momento.");return r.json() as Promise<T>}
export async function suggestPlaces(query:string){if(query.trim().length<2)return[];const r=await request<{data:Place[]}>(`/places/suggestions?query=${encodeURIComponent(query.trim())}`);return r.data.slice(0,8)}
export async function searchFlights(input:{origin:string;destination:string;originType?:"airport"|"city";destinationType?:"airport"|"city";depart:string;returnDate?:string;adults:number;cabin?:"economy"|"premium_economy"|"business"|"first"}){const slices=[{origin:input.origin,destination:input.destination,departure_date:input.depart},...(input.returnDate?[{origin:input.destination,destination:input.origin,departure_date:input.returnDate}]:[])];const r=await request<{data:{id:string;live_mode:boolean;offers:FlightOffer[]}}>(`/air/offer_requests?return_offers=true&supplier_timeout=10000`,{method:"POST",body:JSON.stringify({data:{slices,passengers:Array.from({length:input.adults},()=>({type:"adult"})),cabin_class:input.cabin??"economy"}})});return {id:r.data.id,live_mode:r.data.live_mode,offers:r.data.offers.filter(offer=>offer.slices.length===slices.length&&matchesAirports(offer,input)&&offer.slices.every(slice=>slice.segments.length>0)&&Number.isFinite(Number(offer.total_amount))&&Number(offer.total_amount)>0&&/^[A-Z]{3}$/.test(offer.total_currency)).map(publicOffer)}}
export function flightsReady(){return Boolean(env().DUFFEL_ACCESS_TOKEN)}
