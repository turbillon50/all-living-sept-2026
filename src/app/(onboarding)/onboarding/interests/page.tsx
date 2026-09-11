import { Page } from "@/ui/page";
import { Button } from "@/ui/button";
import { Steps } from "@/domains/identity/onboarding-steps";
import { saveInterests } from "@/domains/identity/onboarding-actions";
import { INTERESTS } from "@/domains/identity/onboarding-constants";

/** Pantalla 06: cuéntanos más de ti. Chips, varios a la vez, sin obligación. */
export default function InterestsStep() {
  return (
    <Page>
      <div className="pt-10 pb-6 fade-up">
        <Steps current={2} />
        <h1 className="mt-6 text-[32px] leading-[1.08]">Cuéntanos más de ti</h1>
        <p className="mt-2 text-text-2">Elige lo que te gusta vivir. Con esto afinamos lo que te proponemos.</p>
      </div>
      <form action={saveInterests} className="flex flex-col gap-10">
        <div className="grid grid-cols-2 gap-2.5">
          {INTERESTS.map((it) => (
            <label key={it} className="cursor-pointer">
              <input type="checkbox" name="interest" value={it} className="peer sr-only" />
              <span className="press flex min-h-12 items-center justify-center rounded-[var(--radius-pill)] bg-surface hairline px-4 text-[15px] font-medium text-text-2 transition-colors peer-checked:bg-green-950 peer-checked:text-ivory peer-checked:border-green-950 peer-focus-visible:outline-2 peer-focus-visible:outline-focus">{it}</span>
            </label>
          ))}
        </div>
        <Button type="submit" size="lg">Continuar</Button>
      </form>
    </Page>
  );
}
