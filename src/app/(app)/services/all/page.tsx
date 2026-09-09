import { SERVICE_CATEGORIES } from "@/domains/services/categories";
import { Page, PageHeader } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { PhotoTile } from "@/ui/primitives";

/** Todas las categorías. */
export default function AllCategories() {
  return (
    <Page wide>
      <TopBar back="/services" title="Todas las categorías" />
      <PageHeader title="Todo lo que necesites" />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">{SERVICE_CATEGORIES.map((c) => <li key={c.slug}><PhotoTile href={`/services/${c.slug}`} src={c.photo} alt="" title={c.label} ratio="4/3" /></li>)}</ul>
    </Page>
  );
}
