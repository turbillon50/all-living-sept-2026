"use client";
import { createContext, useContext, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { INITIAL_STATE, restoreDemoState, type DemoState } from "./demo-model";
import type { ExperienceEvent } from "./catalog";
import { useEventsAccount } from "./account-context";

const STORAGE_KEY = "all-living-events-demo-v1";
type ExperienceContext = { state: DemoState; setState: Dispatch<SetStateAction<DemoState>>; ready: boolean; notify: (message: string) => void; toast: string; activity: string[]; liveEvents: ExperienceEvent[]; setLiveEvents: Dispatch<SetStateAction<ExperienceEvent[]>>; reset: () => void };
const Context = createContext<ExperienceContext | null>(null);
export function ExperienceProvider({ children }: { children: React.ReactNode }) {
  const account = useEventsAccount();
  const storageKey = account.userId ? `${STORAGE_KEY}:${account.userId}` : STORAGE_KEY;
  return <ExperienceState key={storageKey} storageKey={storageKey}>{children}</ExperienceState>;
}
function ExperienceState({ children, storageKey }: { children: React.ReactNode; storageKey: string }) {
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const [ready, setReady] = useState(false); const [toast, setToast] = useState("");
  const [activity, setActivity] = useState<string[]>([]); const [liveEvents, setLiveEvents] = useState<ExperienceEvent[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    try { const stored = localStorage.getItem(storageKey); if (stored) setState(restoreDemoState(stored)); } catch { setToast("Esta demo se mantendrá sólo durante esta sesión."); }
    setReady(true);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [storageKey]);
  useEffect(() => { if (ready) { try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch { /* Remain usable in memory when browser storage is unavailable. */ } } }, [state, ready, storageKey]);
  function notify(message: string) { setToast(message); if (state.settings.activity) setActivity(items => [message, ...items].slice(0, 12)); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(() => setToast(""), 3500); }
  function reset() { setState(INITIAL_STATE); setActivity([]); try { localStorage.removeItem(storageKey); } catch { /* No persistent data to remove. */ } }
  return <Context.Provider value={{ state, setState, ready, notify, toast, activity, liveEvents, setLiveEvents, reset }}>{children}</Context.Provider>;
}
export function useExperience() { const context = useContext(Context); if (!context) throw new Error("ExperienceProvider required"); return context; }
