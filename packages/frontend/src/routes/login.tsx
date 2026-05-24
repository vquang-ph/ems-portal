import { createFileRoute, redirect } from "@tanstack/react-router";
import { jotaiStore } from "@/lib/jotaiStore";
import { LoginPage, isAuthenticatedAtom } from "@/modules/auth";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (jotaiStore.get(isAuthenticatedAtom)) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});
