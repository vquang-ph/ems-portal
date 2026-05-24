import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { jotaiStore } from "@/lib/jotaiStore";
import { isAuthenticatedAtom } from "@/modules/auth";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    if (!jotaiStore.get(isAuthenticatedAtom)) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: Outlet,
});
