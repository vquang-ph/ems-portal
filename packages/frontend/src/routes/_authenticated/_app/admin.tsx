import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { jotaiStore } from "@/lib/jotaiStore";
import { currentUserAtom } from "@/modules/auth/store/sessionAtom";

export const Route = createFileRoute("/_authenticated/_app/admin")({
  beforeLoad: async () => {
    const user = jotaiStore.get(currentUserAtom);
    if (user?.role !== "admin") {
      throw redirect({ to: "/" });
    }
  },
  component: () => <Outlet />,
});
