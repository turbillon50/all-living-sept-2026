import { NextResponse } from "next/server";
import { z } from "zod";
import { flightsReady,searchFlights } from "@/integrations/flights/duffel-provider";
const S=z.object({origin:z.string().regex(/^[A-Z]{3}$/),destination:z.string().regex(/^[A-Z]{3}$/),depart:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),returnDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),adults:z.number().int().min(1).max(9),cabin:z.enum(["economy","premium_economy","business","first"]).optional()});
export async function POST(req:Request){if(!flightsReady())return NextResponse.json({ready:false,error:"Vuelos aún no conectados"},{status:503});const p=S.safeParse(await req.json().catch(()=>null));if(!p.success)return NextResponse.json({error:"Búsqueda inválida"},{status:400});try{const d=await searchFlights(p.data);return NextResponse.json({ready:true,...d})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"No pudimos buscar vuelos"},{status:502})}}
