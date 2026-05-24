import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { User } from "@ems-portal/types";

export interface Session {
  accessToken: string;
  user: User;
}

// Persists in localStorage under "ems.session". Single source of truth for
// who's logged in; swap implementation here if we move to cookies later.
export const sessionAtom = atomWithStorage<Session | null>("ems.session", null);

export const tokenAtom = atom((get) => get(sessionAtom)?.accessToken ?? null);

export const currentUserAtom = atom((get) => get(sessionAtom)?.user ?? null);

export const isAuthenticatedAtom = atom((get) => get(sessionAtom) !== null);
