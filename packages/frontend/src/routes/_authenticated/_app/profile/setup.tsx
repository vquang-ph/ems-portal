import { createFileRoute, redirect } from "@tanstack/react-router";
import { UserRole } from "@ems-portal/types";
import { jotaiStore } from "@/lib/jotaiStore";
import { currentUserAtom } from "@/modules/auth";
import { ProfileSetupPage } from "@/modules/provider-profile";

export const Route = createFileRoute("/_authenticated/_app/profile/setup")({
  beforeLoad: () => {
    const user = jotaiStore.get(currentUserAtom);
    if (user?.role !== UserRole.ServiceProvider) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: "/" });
    }
  },
  component: ProfileSetupPage,
});
