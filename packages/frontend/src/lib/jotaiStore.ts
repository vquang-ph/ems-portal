import { createStore } from "jotai";

// Single shared Jotai store so non-React consumers (axios interceptors,
// router beforeLoad guards) and the React tree all read the same atoms.
export const jotaiStore = createStore();
