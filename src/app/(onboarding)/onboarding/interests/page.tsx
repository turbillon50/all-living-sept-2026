import { Page } from "@/ui/page";
import { Button } from "@/ui/button";
import { Steps } from "@/domains/identity/onboarding-steps";
import { saveInterests } from "@/domains/identity/onboarding-actions";
import { INTERESTS } from "@/domains/identity/onboarding-constants";

/** Pantalla 06: intereses. Chips, varios a la vez, sin obligación. */
export default function InterestsStep() {
  return (
    <Page>
      <div className="pt-10 pb-6 fade-up">
        <Steps current={2} />
        <h1 className="mt-6 text-[32px] leading-[1.08]">¿Qué te gusta vivir?</h1>
        <p className="mt-2 text-text-2">Con esto afinamos lo que te proponemos. Elige los que quieras.</p>
      </div>
      <form action={saveInterests} className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-2.5">
          {INTERESTS.map((it) => (
            <label key={it} className="cursor-pointer">
              <input type="checkbox" name="interest" value={it} className="peer sr-only" />
              <span className="press inline-flex min-h-11 items-center rounded-[var(--radius-pill)] bg-surface hairline px-4 text-[15px] transition-colors peer-checked:bg-accent peer-checked:text-on-accent peer-checked:border-accent peer-focus-visible:outline-2 peer-focus-visible:outline-focus">
                {it}
              </span>
            </label>
          ))}
        </div>
        <Button type="submit" size="lg">Continuar</Button>
      </form>
    </Page>
  );
}
