import { cn } from "./cn";

export function Field({
  label,
  error,
  hint,
  className,
  ...input
}: { label: string; error?: string; hint?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = input.id ?? input.name;
  return (
    <label htmlFor={id} className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">{label}</span>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        className={cn(
          "min-h-12 rounded-[var(--radius-ctl)] bg-surface px-4 text-[15px] hairline placeholder:text-muted transition-colors focus:border-focus",
          error && "border-danger",
        )}
        {...input}
      />
      {error ? (
        <span id={`${id}-err`} role="alert" className="text-[13px] text-danger">
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
