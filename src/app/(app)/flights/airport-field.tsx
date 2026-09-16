"use client";
import { useEffect, useId, useState } from "react";
import { Building2, Plane } from "@/ui/icons";
import type { Place } from "@/integrations/flights/types";
export type AirportChoice = { code: string; label: string };

export function AirportField({ label, value, onChange, disabled }: { label: string; value: AirportChoice; onChange: (value: AirportChoice) => void; disabled: boolean }) {
  const id = useId();
  const [open, setOpen] = useState(false), [options, setOptions] = useState<Place[]>([]), [busy, setBusy] = useState(false), [failed, setFailed] = useState(false), [active, setActive] = useState(-1);
  useEffect(() => {
    if (!open || value.label.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setBusy(true); setFailed(false);
      try {
        const response = await fetch(`/api/flights/places?q=${encodeURIComponent(value.code || value.label.trim())}`, { signal: controller.signal });
        if (!response.ok) throw new Error("places");
        const data = await response.json();
        if (!controller.signal.aborted) { setOptions(data.data ?? []); setActive(-1); }
      } catch { if (!controller.signal.aborted) { setFailed(true); setOptions([]); } }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }, 280);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [open, value.label, value.code]);
  function choose(place: Place) {
    onChange({ code: place.iata_code, label: `${place.city_name || place.name} · ${place.iata_code}` });
    setOpen(false); setOptions([]); setActive(-1); setBusy(false);
  }
  const expanded = open && value.label.trim().length >= 2;
  return <div className="journey-airport" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <label htmlFor={id}>{label}</label>
    <input id={id} role="combobox" aria-autocomplete="list" aria-controls={`${id}-options`} aria-expanded={expanded} aria-activedescendant={active >= 0 && options[active] ? `${id}-${active}` : undefined}
      autoComplete="off" spellCheck={false} placeholder="Ciudad o aeropuerto" value={value.label} disabled={disabled} required maxLength={120}
      onFocus={() => setOpen(true)}
      onChange={event => { const text = event.target.value; onChange({ label: text, code: /^[a-z]{3}$/i.test(text.trim()) ? text.trim().toUpperCase() : "" }); setOpen(true); setOptions([]); setActive(-1); setFailed(false); setBusy(text.trim().length >= 2); }}
      onKeyDown={event => {
        if (event.key === "Escape") { setOpen(false); return; }
        if (event.key === "ArrowDown" && options.length) { event.preventDefault(); setOpen(true); setActive(index => (index + 1) % options.length); }
        if (event.key === "ArrowUp" && options.length) { event.preventDefault(); setActive(index => index <= 0 ? options.length - 1 : index - 1); }
        if (event.key === "Enter" && expanded && options.length) { event.preventDefault(); choose(options[Math.max(0, active)]!); }
      }} />
    {expanded ? <div className="journey-place-menu"><ul id={`${id}-options`} role="listbox" aria-label={`Aeropuertos de ${label.toLowerCase()}`}>
      {options.map((place, index) => <li id={`${id}-${index}`} key={place.id} role="option" aria-selected={active === index} onMouseDown={event => event.preventDefault()} onClick={() => choose(place)}>
        {place.type === "city" ? <Building2 size={20} aria-hidden /> : <Plane size={20} aria-hidden />}<span><strong>{place.city_name || place.name}</strong><small>{place.type === "city" ? "Todos los aeropuertos" : place.name}</small></span><b>{place.iata_code}</b>
      </li>)}
    </ul>{busy ? <p role="status">Buscando aeropuertos…</p> : options.length === 0 ? <p role="status">{failed ? "No pudimos cargar las sugerencias. Intenta de nuevo o escribe el código del aeropuerto." : "Prueba con otra ciudad o con el código del aeropuerto."}</p> : null}</div> : null}
  </div>;
}
