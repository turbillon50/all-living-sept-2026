import Link from "next/link";
import { Mark } from "./mark";
export function Logo() { return <Link href="/eventos" className="site-logo" aria-label="ALL LIVING Eventos, inicio"><Mark size={34} /><span><strong>All Living</strong><small>EVENTOS · QUINTANA ROO</small></span></Link>; }
export function SiteFooter() {
  return <footer className="site-footer"><div className="footer-row"><Logo /><nav aria-label="Información legal"><Link href="/privacidad">Aviso de Privacidad</Link><Link href="/terminos">Términos de Uso</Link><Link href="/responsable">Datos del responsable</Link></nav></div><p>Servicio independiente de descubrimiento. Los boletos, pagos y condiciones de compra se gestionan directamente en Ticketmaster. Los precios y la disponibilidad pueden cambiar.</p><div className="footer-contact"><span>Colectivo Mass S.A. de C.V. · <a href="mailto:luisdelator@vmomentums.info">luisdelator@vmomentums.info</a></span><span>ALL LIVING Eventos © 2026</span></div></footer>;
}
export function LegalShell({ children }: { children: React.ReactNode }) { return <><header className="legal-header"><Logo /><Link href="/eventos">Volver a la cartelera ↗</Link></header><main className="legal-main">{children}</main><SiteFooter /></>; }
