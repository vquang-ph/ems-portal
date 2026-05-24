import { Link, Outlet } from "@tanstack/react-router";
import { UserMenu } from "@/modules/auth";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-8 py-4">
        <Link to="/" className="text-lg font-semibold">
          EMS Portal
        </Link>
        <UserMenu />
      </header>
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
