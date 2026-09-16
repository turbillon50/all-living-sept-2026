import Link from "next/link";
import Image from "next/image";
import { Page } from "@/ui/page";
import { TravelTabs } from "@/ui/travel-tabs";
import "./tarjetas.css";
import { ArrowRight, Gift, Phone } from "@/ui/icons";
import { Segmented } from "@/ui/primitives";
import { catalogInput, countryName, type CatalogItem } from "@/integrations/reloadly/catalog";
import { getCatalog, getCountries, reloadlyReady } from "@/integrations/reloadly/provider";

export const dynamic = "force-dynamic";

function values(item: CatalogItem): string | null {
  if (!item.currency) return null;
  const format = (n: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 2 }).format(n);
  if (item.denominations.length) return item.denominations.map(format).join(" · ") + " " + item.currency;
  if (item.minimum && item.maximum) return `${format(item.minimum)} – ${format(item.maximum)} ${item.currency}`;
  return null;
}

export default async function GiftCardsPage({ searchParams }: { searchParams: Promise<Record<string,string | string[] | undefined>> }) {
  const query = await searchParams;
  const parsed = catalogInput.safeParse({ kind: "giftcards", ...query });
  const input = parsed.success ? parsed.data : catalogInput.parse({ kind: "giftcards" });
  const href = (kind = input.kind, page = 1) => `/tarjetas?${new URLSearchParams({ kind, country: input.country, page: String(page) })}`;
  let countries: Awaited<ReturnType<typeof getCountries>> = [];
  let catalog: Awaited<ReturnType<typeof getCatalog>> | null = null;
  let error = false;
  if (reloadlyReady()) {
    const result = await Promise.allSettled([getCountries(), getCatalog(input)]);
    if (result[0].status === "fulfilled") countries = result[0].value;
    if (result[1].status === "fulfilled") catalog = result[1].value;
    else error = true;
  }
  if (!countries.some(c => c.code === input.country)) countries = [{ code: input.country, name: countryName(input.country) }, ...countries];
  const priority = (item: CatalogItem) => /airbnb/i.test(item.name) ? 0 : /hotels|global hotel|airalo/i.test(item.name) ? 1 : /amazon/i.test(item.name) ? 2 : /google play/i.test(item.name) ? 3 : 10;
  const items = [...(catalog?.items ?? [])].sort((a, b) => priority(a) - priority(b) || Number(b.country === input.country) - Number(a.country === input.country));
  const brands = [/airbnb/i, /amazon/i, /google play/i].flatMap(name => { const item = items.find(item => item.logo && name.test(item.name)); return item ? [item] : []; });
  return <Page wide className="md:pb-28">
    <TravelTabs current="gifts" />
    <header className="gift-hero"><div><p className="gift-eyebrow">ALL LIVING · TARJETAS Y REGALOS</p><h1>{input.kind === "giftcards" ? <>Un regalo.<br />Mil formas de vivirlo.</> : <>Tiempo aire,<br />a donde vayas.</>}</h1><p>{input.kind === "giftcards" ? "Viajes, compras y entretenimiento. Descubre tarjetas de tus marcas favoritas para ti o para regalar." : "Encuentra tu operador y explora las opciones de tiempo aire y datos."}</p></div>
      {input.kind === "giftcards" && brands.length ? <div className="gift-brand-fan" aria-label="Marcas en el catálogo">{brands.map(item => <a href={`#gift-${item.id}`} key={item.id}><Image src={item.logo!} alt={item.name} width={190} height={110} unoptimized /><span>{item.name}</span></a>)}</div> : <Gift className="gift-hero-icon" size={94} aria-hidden />}
    </header>
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
        <form action="/tarjetas" className="space-y-3">
          <input type="hidden" name="kind" value={input.kind} />
          <label className="block text-sm font-medium" htmlFor="country">País de uso</label>
          <select id="country" name="country" defaultValue={input.country} className="min-h-12 w-full rounded-2xl bg-surface px-3 hairline">
            {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
          <button className="tapable flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-sm text-ivory">Ver catálogo<ArrowRight size={16} /></button>
        </form>
        <p className="text-[13px] leading-relaxed text-text-2">Explora marcas, valores y condiciones de uso. La compra y entrega de tarjetas estará disponible próximamente.</p>
        {catalog?.mode === "sandbox" ? <p className="text-sm font-medium">Catálogo de pruebas</p> : null}
      </aside>
      <section className="min-w-0">
        <Segmented current={input.kind} items={[{key:"giftcards",label:"Tarjetas de regalo",href:href("giftcards")},{key:"topups",label:"Tiempo aire",href:href("topups")}]} />
        {catalog ? <p className="my-5 text-[13px] text-text-2">{catalog.total} {input.kind === "topups" ? "operadores" : "productos"} en el catálogo para {countryName(input.country)}</p> : null}
        {!catalog ? <div role="status" className="mt-6 rounded-2xl bg-surface p-6 hairline">
          <h2 className="text-lg">{error ? "No pudimos cargar el catálogo." : "El catálogo estará disponible pronto."}</h2>
          {error ? <Link href={href()} className="mt-3 inline-block text-sm underline">Volver a consultar</Link> : null}
        </div> : catalog.items.length === 0 ? <p className="py-10 text-text-2">No encontramos productos para esta selección. Prueba con otro país.</p> :
          <ul className="grid items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map(item => <li key={item.id} id={`gift-${item.id}`} className="gift-catalog-item">
              <details className="group overflow-hidden rounded-2xl bg-surface hairline open:shadow-sm">
                <summary className="tapable flex min-h-28 cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
                  <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2">
                    {item.logo ? <Image src={item.logo} alt="" width={56} height={56} unoptimized className="max-h-12 object-contain" /> : input.kind === "topups" ? <Phone size={28} /> : <Gift size={28} />}
                  </span>
                  <span className="min-w-0 flex-1"><span className="block text-[15px] font-medium leading-snug">{item.name}</span><span className="mt-1 block text-xs text-text-2">{item.category}</span><span className="mt-2 block text-xs text-muted">Ver detalles</span></span>
                  <ArrowRight size={16} className="shrink-0 transition-transform group-open:rotate-90" />
                </summary>
                <div className="space-y-3 border-t border-line px-4 py-4 text-[13px] leading-relaxed">
                  <p><strong>País del producto:</strong> {countryName(item.country)}{item.global ? " · Producto de alcance global; revisa sus condiciones" : ""}</p>
                  {values(item) ? <p><strong>{input.kind === "giftcards" ? "Valor de la tarjeta:" : "Montos locales:"}</strong> {values(item)}</p> : <p>Los planes y montos se confirmarán al cotizar.</p>}
                  {item.instructions ? <p className="break-words text-text-2">{item.instructions}</p> : null}
                  {input.kind === "giftcards" ? <p className="text-xs text-muted">Revisa el país y las condiciones de la marca. El valor nominal de la tarjeta se muestra en su moneda de uso.</p> : null}
                </div>
              </details>
            </li>)}
          </ul>}
        {catalog && catalog.pages > 1 ? <nav aria-label="Páginas del catálogo" className="mt-6 flex items-center justify-center gap-4 text-sm">
          {input.page > 1 ? <Link href={href(input.kind,input.page-1)} className="inline-flex min-h-11 min-w-20 items-center justify-center rounded-full bg-surface underline">Anterior</Link> : <span className="min-w-20" />}
          <span>Página {input.page} de {catalog.pages}</span>
          {input.page < catalog.pages ? <Link href={href(input.kind,input.page+1)} className="inline-flex min-h-11 min-w-20 items-center justify-center rounded-full bg-surface underline">Siguiente</Link> : <span className="min-w-20" />}
        </nav> : null}
      </section>
    </div>
  </Page>;
}
