import { eq } from "drizzle-orm";
import { db, schema } from "@/db/client";
import { requireUser } from "@/domains/identity/current-user";
import { updatePreferences } from "@/domains/identity/profile-actions";
import { Page } from "@/ui/page";
import { TopBar } from "@/ui/top-bar";
import { Button } from "@/ui/button";

export default async function PreferencesPage() {
  const user = await requireUser();
  const profile = await db().query.userProfiles.findFirst({ where: eq(schema.userProfiles.userId, user.id) });
  const langs = profile?.languages ?? [];
  return (
    <Page>
      <TopBar back="/profile" title="Preferencias" />
      <form action={updatePreferences} className="mt-6 flex flex-col gap-6">
        <fieldset className="rounded-[var(--radius-card)] bg-surface hairline p-4">
          <legend className="px-1 text-sm font-medium">Idioma de la app</legend>
          <select name="locale" defaultValue={user.locale} className="mt-2 min-h-12 w-full rounded-[var(--radius-ctl)] bg-bg hairline px-4">
            <option value="es-MX">Español (México)</option>
            <option value="en-US">English</option>
          </select>
        </fieldset>
        <fieldset className="rounded-[var(--radius-card)] bg-surface hairline p-4">
          <legend className="px-1 text-sm font-medium">Idiomas que hablas</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {["es", "en", "fr", "pt", "it", "de"].map((l) => (
              <label key={l} className="cursor-pointer">
                <input type="checkbox" name="language" value={l} defaultChecked={langs.includes(l)} className="peer sr-only" />
                <span className="inline-flex min-h-10 items-center rounded-[var(--radius-pill)] bg-bg hairline px-3.5 text-sm uppercase peer-checked:bg-accent peer-checked:text-on-accent">{l}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="rounded-[var(--radius-card)] bg-surface hairline p-4 flex flex-col gap-3">
          <legend className="px-1 text-sm font-medium">Avisos</legend>
          <label className="flex items-center justify-between min-h-11"><span>Notificaciones de estancia y servicios</span><input type="checkbox" name="notifications" defaultChecked={profile?.notificationsOptIn} className="size-5 accent-[var(--color-accent)]" /></label>
          <label className="flex items-center justify-between min-h-11"><span>Ubicación cuando una función la pida</span><input type="checkbox" name="location" defaultChecked={profile?.locationOptIn} className="size-5 accent-[var(--color-accent)]" /></label>
        </fieldset>
        <Button type="submit" size="lg">Guardar</Button>
      </form>
    </Page>
  );
}
