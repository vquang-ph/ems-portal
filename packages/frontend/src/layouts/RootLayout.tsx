import { Link, Outlet } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { UserRole } from "@ems-portal/types";
import { UserMenu, currentUserAtom } from "@/modules/auth";

const RootLayout = () => {
  const user = useAtomValue(currentUserAtom);
  const isProvider = user?.role === UserRole.ServiceProvider;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-8 py-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-lg font-semibold">
            EMS Portal
          </Link>
          {isProvider && (
            <nav className="flex items-center gap-4 text-sm">
              <Link
                to="/profile"
                className="text-muted-foreground hover:text-foreground"
              >
                My Profile
              </Link>
              <Link
                to="/profile/skills"
                className="text-muted-foreground hover:text-foreground"
              >
                Skills
              </Link>
            </nav>
          )}
        </div>
        <UserMenu />
      </header>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
