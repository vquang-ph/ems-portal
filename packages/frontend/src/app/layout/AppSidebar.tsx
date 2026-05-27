import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { NAV_CONFIG, type NavItem } from "@/app/navigation/navConfig";
import useSession from "@/modules/auth/hooks/useSession";
import { Link, useLocation } from "@tanstack/react-router";
import type { UserRole } from "@ems-portal/types";

export function AppSidebar() {
  const { user } = useSession();
  const { pathname } = useLocation();
  const userRole = user?.role as UserRole | undefined;

  const mainItems = NAV_CONFIG.filter(
    (item) =>
      item.group === "main" &&
      (item.roles.length === 0 || (userRole && item.roles.includes(userRole))),
  );

  const adminItems = NAV_CONFIG.filter(
    (item) =>
      item.group === "admin" &&
      (item.roles.length === 0 || (userRole && item.roles.includes(userRole))),
  );

  const settingsItem = NAV_CONFIG.find((item) => item.key === "settings");

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const renderNavItem = (item: NavItem) => {
    const active = item.to ? isActive(item.to) : false;

    if (item.children && item.children.length > 0) {
      const hasActiveChild = item.children.some(
        (child) => child.to && isActive(child.to),
      );

      return (
        <div key={item.key}>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className={hasActiveChild ? "bg-sidebar-accent" : ""}
            >
              <Link to={item.to || "#"}>
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenu className="ml-6">
            {item.children.map((child) => {
              const childActive = child.to ? isActive(child.to) : false;
              return (
                <SidebarMenuItem key={child.key}>
                  <SidebarMenuButton
                    asChild
                    size="sm"
                    className={
                      childActive ? "bg-sidebar-accent font-semibold" : ""
                    }
                  >
                    <Link to={child.to || "#"}>
                      {child.icon && <child.icon className="h-3 w-3" />}
                      <span className="text-sm">{child.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      );
    }

    return (
      <SidebarMenuItem key={item.key}>
        <SidebarMenuButton asChild className={active ? "bg-sidebar-accent" : ""}>
          <Link to={item.to || "#"}>
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => renderNavItem(item))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {adminItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => renderNavItem(item))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to={settingsItem?.to || "/settings"}>
                {settingsItem && <settingsItem.icon className="h-4 w-4" />}
                <span>{settingsItem?.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
