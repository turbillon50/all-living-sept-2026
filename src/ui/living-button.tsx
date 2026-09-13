"use client";
import Link from "next/link";
import { Mark } from "./mark";
export function LivingButton(){return <Link href="/support" aria-label="All Living · Asistente" className="living-button md:bottom-7 md:right-7"><Mark size={46} interactive/><span className="sr-only">Abrir asistente All Living</span></Link>}
