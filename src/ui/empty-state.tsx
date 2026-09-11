import { ButtonLink } from "./button";

/** Estado vacío: una frase humana y, si existe, la acción útil. */
export function EmptyState({ title, body, cta }: { title: string; body?: string; cta?: { href: string; label: string } }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-surface hairline px-6 py-10 text-center">
      <p className="font-serif text-[20px] text-text">{title}</p>
      {body ? <p className="mt-2 text-sm text-text-2 max-w-sm mx-auto">{body}</p> : null}
      {cta ? (
        <div className="mt-5">
          <ButtonLink href={cta.href} variant="secondary" size="sm">
            {cta.label}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}
