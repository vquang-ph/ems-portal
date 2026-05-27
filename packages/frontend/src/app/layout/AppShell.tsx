import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "./AppSidebar";
import { Topbar } from "./Topbar";

export function AppShell() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-6xl p-8">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
