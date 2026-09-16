"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

type EventsAccount = {
  available: boolean;
  loaded: boolean;
  signedIn: boolean;
  userId: string | null;
  name: string;
  email: string;
  initials: string;
  signOut: () => Promise<void>;
};
const visitor: EventsAccount = { available: false, loaded: true, signedIn: false, userId: null, name: "", email: "", initials: "", signOut: async () => {} };
const AccountContext = createContext<EventsAccount>(visitor);

function ClerkAccount({ children }: { children: ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const name = user?.fullName || user?.firstName || user?.username || "Tu cuenta";
  return <AccountContext.Provider value={{ available: true, loaded: isLoaded, signedIn: Boolean(isSignedIn), userId: user?.id ?? null, name, email: user?.primaryEmailAddress?.emailAddress ?? "", initials: name.split(/\s+/).map(word => word[0]).slice(0, 2).join("").toUpperCase(), signOut: () => signOut({ redirectUrl: "/acceso" }) }}>{children}</AccountContext.Provider>;
}

export function EventsAccountProvider({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  return enabled ? <ClerkAccount>{children}</ClerkAccount> : <AccountContext.Provider value={visitor}>{children}</AccountContext.Provider>;
}
export function useEventsAccount() { return useContext(AccountContext); }
