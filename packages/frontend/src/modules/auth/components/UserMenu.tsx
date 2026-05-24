import { Button } from "@/components/ui/button";
import useSession from "../hooks/useSession";
import { AUTH_TEST_IDS } from "../test/testIds";

const UserMenu = () => {
  const { user, logout, isAuthenticated } = useSession();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div
      data-testid={AUTH_TEST_IDS.userMenu}
      className="flex items-center gap-3 text-sm"
    >
      <div className="text-right leading-tight">
        <div className="font-medium">{user.name}</div>
        <div className="text-muted-foreground capitalize">
          {user.role.replace("_", " ")}
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        data-testid={AUTH_TEST_IDS.logoutButton}
        onClick={() => logout()}
      >
        Log out
      </Button>
    </div>
  );
};

export default UserMenu;
