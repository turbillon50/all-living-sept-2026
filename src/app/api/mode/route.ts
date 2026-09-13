import { NextResponse } from "next/server";
import { isRole, SELF_SERVICE_ROLES } from "@/core/roles";
import { grantSelfServiceRole, requireUser, switchContext } from "@/domains/identity/current-user";
export async function POST(req:Request){const user=await requireUser();const {mode}=await req.json().catch(()=>({}));if(!isRole(mode)||mode==="admin")return NextResponse.json({error:"Modo inválido"},{status:400});if(!user.roles.includes(mode)){if(!SELF_SERVICE_ROLES.includes(mode))return NextResponse.json({error:"No disponible"},{status:403});await grantSelfServiceRole(user.id,mode)}const roles=user.roles.includes(mode)?user.roles:[...user.roles,mode];await switchContext(user.id,roles,mode);return NextResponse.json({ok:true,mode})}
