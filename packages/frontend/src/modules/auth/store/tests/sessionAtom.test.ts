import { describe, it, expect } from "vitest";
import { createStore } from "jotai";
import {
  currentUserAtom,
  isAuthenticatedAtom,
  sessionAtom,
  tokenAtom,
} from "../sessionAtom";
import { fakeSession, fakeUser } from "../../test/fixtures";

describe("sessionAtom + derived atoms", () => {
  it("starts unauthenticated when no session", () => {
    const store = createStore();
    expect(store.get(sessionAtom)).toBeNull();
    expect(store.get(tokenAtom)).toBeNull();
    expect(store.get(currentUserAtom)).toBeNull();
    expect(store.get(isAuthenticatedAtom)).toBe(false);
  });

  it("derived atoms reflect the session once set", () => {
    const store = createStore();
    const user = fakeUser({ name: "Alice" });
    const session = fakeSession({ user, accessToken: "abc" });

    store.set(sessionAtom, session);

    expect(store.get(tokenAtom)).toBe("abc");
    expect(store.get(currentUserAtom)).toEqual(user);
    expect(store.get(isAuthenticatedAtom)).toBe(true);
  });

  it("clearing the session resets derived atoms", () => {
    const store = createStore();
    store.set(sessionAtom, fakeSession());
    store.set(sessionAtom, null);

    expect(store.get(tokenAtom)).toBeNull();
    expect(store.get(currentUserAtom)).toBeNull();
    expect(store.get(isAuthenticatedAtom)).toBe(false);
  });
});
