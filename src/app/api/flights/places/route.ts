import { NextResponse } from "next/server";
import { flightsReady,suggestPlaces } from "@/integrations/flights/duffel-provider";
export async function GET(req:Request){if(!flightsReady())return NextResponse.json({data:[],ready:false});const q=new URL(req.url).searchParams.get("q")??"";try{return NextResponse.json({data:await suggestPlaces(q),ready:true})}catch{return NextResponse.json({data:[],ready:true},{status:502})}}
