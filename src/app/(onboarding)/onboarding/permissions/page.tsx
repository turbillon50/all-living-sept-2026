import { Bell, MapPin } from "@/ui/icons";
import { Page } from "@/ui/page";
import { Button } from "@/ui/button";
import { Steps } from "@/domains/identity/onboarding-steps";
import { savePermissions } from "@/domains/identity/onboarding-actions";

/** Pantalla 07: permisos progresivos. Aquí solo se registra la preferencia; el permiso del sistema se pide cuando haya motivo. */
export default function PermissionsStep() {
  return (
    <Page>
      <div className="pt-10 pb-6 fade-up">
        <Steps current={3} />
        <h1 className="mt-6 text-[32px] leading-[1.08]">Solo cuando haga falta</h1>
        <p className="mt-2 text-text-2">No pedimos todo al inicio. Te avisaremos cuando exista un motivo real.</p>
      </div>
      <form action={savePermissions} className="flex flex-col gap-3">
        <Toggle name="notifications" Icon={Bell} title="Avisos de tu estancia" body="Confirmaciones, tu chofer en camino, tu semana reservada." defaultChecked />
        <Toggle name="location" Icon={MapPin} title="Ubicación" body="Solo cuando una función la necesite, como llegar a tu villa." />
        <Button type="submit" size="lg" className="mt-5">Continuar</Button>
      </form>
    </Page>
  );
}

function Toggle({ name, Icon, title, body, defaultChecked }: { name: string; Icon: typeof Bell; title: string; body: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-4 rounded-[var(--radius-card)] bg-surface hairline p-4">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-soft text-green-900">
        <Icon size={20} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{title}</span>
        <span className="block text-sm text-text-2">{body}</span>
      </span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-sand-300 transition-colors peer-checked:bg-accent after:absolute after:top-0.5 after:left-0.5 after:size-6 after:rounded-full after:bg-ivory after:shadow after:transition-transform peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-focus" />
    </label>
  );
}
