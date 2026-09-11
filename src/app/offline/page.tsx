import { ButtonLink } from "@/ui/button";

export const metadata = { title: "Sin conexión" };

export default function Offline() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] tracking-[0.28em] uppercase text-muted">Sin conexión</p>
      <h1 className="mt-3 text-[30px]">Estás fuera de línea.</h1>
      <p className="mt-2 text-text-2 max-w-sm">Tu itinerario y los datos de tu estancia confirmada siguen aquí. Lo demás vuelve cuando regrese la red.</p>
      <div className="mt-8">
        <ButtonLink href="/home" variant="secondary">Reintentar</ButtonLink>
      </div>
    </main>
  );
}
