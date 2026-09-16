import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell } from "@/ui/site-chrome";
export const metadata: Metadata = { title: "Datos del responsable", alternates: { canonical: "/responsable" } };
export default function ResponsiblePage() {
  return <LegalShell><p className="legal-eyebrow">ESTAMOS PARA ESCUCHARTE</p><h1>Datos del responsable</h1><p className="legal-date">ALL LIVING Eventos · events.alliving.live</p>
    <h2>Razón social</h2><p>Colectivo Mass S.A. de C.V.</p>
    <h2>Domicilio fiscal</h2><p>Avenida Paseo de la Reforma 389, piso 19, colonia Juárez, alcaldía Cuauhtémoc, C.P. 06600, Ciudad de México, México.</p>
    <h2>Contacto</h2><p><a href="mailto:luisdelator@vmomentums.info">luisdelator@vmomentums.info</a></p><p>Este correo atiende consultas sobre el funcionamiento del sitio, privacidad, derechos sobre datos personales y reportes de contenido.</p>
    <div className="legal-notice">Para dudas sobre una compra, la entrega de boletos, cargos o reembolsos, consulta directamente a Ticketmaster. ALL LIVING Eventos no tiene acceso a tus pedidos ni datos de pago.</div>
    <h2>Información del servicio</h2><p>Servicio independiente de descubrimiento de eventos en Cancún, Playa del Carmen y Tulum mediante Ticketmaster Discovery API.</p><p>Consulta nuestro <Link href="/privacidad">Aviso de Privacidad</Link> y los <Link href="/terminos">Términos de Uso y Aviso Legal</Link>.</p>
  </LegalShell>;
}
