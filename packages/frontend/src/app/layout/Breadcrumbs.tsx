import { Link, useMatches } from "@tanstack/react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const BREADCRUMB_LABELS: Record<string, string> = {
  "/": "Dashboard",
  "/profile": "My Profile",
  "/profile/": "View",
  "/profile/setup": "Edit",
  "/profile/skills": "Skills",
  "/providers": "Find providers",
  "/bookings": "Bookings",
  "/messages": "Messages",
  "/settings": "Settings",
  "/admin/users": "Users",
  "/admin/skills": "Skills taxonomy",
  "/admin/verification": "Verification",
};

export function Breadcrumbs() {
  const matches = useMatches();

  const breadcrumbMatches = matches.filter((match) => {
    const path = match.pathname;
    return path in BREADCRUMB_LABELS && path !== "/";
  });

  if (breadcrumbMatches.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbMatches.map((match, index) => {
          const isLast = index === breadcrumbMatches.length - 1;
          const label = BREADCRUMB_LABELS[match.pathname] || match.pathname;
          const pathname = match.pathname;

          return (
            <div key={match.id} className="flex items-center gap-1.5">
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={pathname}>{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
