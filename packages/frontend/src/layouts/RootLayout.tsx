import { Outlet } from "@tanstack/react-router";

const RootLayout = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
