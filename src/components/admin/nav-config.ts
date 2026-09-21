import {
  Activity,
  Briefcase,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Jobs", href: "/jobs", icon: Briefcase },
  { label: "Applications", href: "/applications", icon: FileText },
  { label: "Candidates", href: "/candidates", icon: Users },
  { label: "Staff Requests", href: "/staff-requests", icon: ClipboardList },
  { label: "Enquiries", href: "/enquiries", icon: MessageSquare },
];

export const managementNavItems: NavItem[] = [
  { label: "Activity", href: "/activity", icon: Activity },
];

export const bottomNavItems: NavItem[] = [
  { label: "Team", href: "/team", icon: UsersRound },
  { label: "Settings", href: "/settings", icon: Settings },
];

export const allNavItems: NavItem[] = [
  ...mainNavItems,
  ...managementNavItems,
  ...bottomNavItems,
];
