import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@ems-portal/types";

export interface RoleBadgeProps {
  role: UserRole;
}

const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  client: {
    label: "Client",
    variant: "default",
  },
  service_provider: {
    label: "Service Provider",
    variant: "secondary",
  },
  admin: {
    label: "Admin",
    variant: "destructive",
  },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
