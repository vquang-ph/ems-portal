import {
  LucideIcon,
  Home,
  User,
  Sparkles,
  Search,
  Calendar,
  MessageSquare,
  Shield,
  Users,
  Tag,
  BadgeCheck,
  Settings,
  LogOut,
  Bell,
} from "lucide-react";
import type { UserRole } from "@ems-portal/types";

export type NavItem = {
  key: string;
  label: string;
  to?: string;
  icon: LucideIcon;
  roles: UserRole[];
  group?: "main" | "admin";
  badge?: () => string | number | null;
  children?: NavItem[];
};

export const NAV_CONFIG: NavItem[] = [
  {
    key: "home",
    label: "Dashboard",
    to: "/",
    icon: Home,
    roles: [],
    group: "main",
  },
  {
    key: "profile",
    label: "My Profile",
    to: "/profile",
    icon: User,
    roles: ["service_provider"],
    group: "main",
    children: [
      {
        key: "profile-skills",
        label: "Skills",
        to: "/profile/skills",
        icon: Sparkles,
        roles: ["service_provider"],
      },
    ],
  },
  {
    key: "providers",
    label: "Find providers",
    to: "/providers",
    icon: Search,
    roles: ["client"],
    group: "main",
  },
  {
    key: "bookings",
    label: "Bookings",
    to: "/bookings",
    icon: Calendar,
    roles: ["client", "service_provider"],
    group: "main",
  },
  {
    key: "messages",
    label: "Messages",
    to: "/messages",
    icon: MessageSquare,
    roles: [],
    group: "main",
  },
  {
    key: "admin-users",
    label: "Users",
    to: "/admin/users",
    icon: Users,
    roles: ["admin"],
    group: "admin",
  },
  {
    key: "admin-skills",
    label: "Skills taxonomy",
    to: "/admin/skills",
    icon: Tag,
    roles: ["admin"],
    group: "admin",
  },
  {
    key: "admin-verify",
    label: "Verification",
    to: "/admin/verification",
    icon: BadgeCheck,
    roles: ["admin"],
    group: "admin",
  },
  {
    key: "settings",
    label: "Settings",
    to: "/settings",
    icon: Settings,
    roles: [],
    group: "main",
  },
];

export const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  user: User,
  sparkles: Sparkles,
  search: Search,
  calendar: Calendar,
  "message-square": MessageSquare,
  shield: Shield,
  users: Users,
  tag: Tag,
  "badge-check": BadgeCheck,
  settings: Settings,
  logout: LogOut,
  bell: Bell,
};
