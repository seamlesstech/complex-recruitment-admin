import type { TeamMemberStatus, TeamRole } from "@/lib/mock/types";

export const teamRoleFilterOptions = [
  "All roles",
  "Super Admin",
  "Admin / Manager",
  "Recruiter",
  "Viewer",
] as const satisfies readonly ("All roles" | TeamRole)[];

export const teamStatusFilterOptions = [
  "All statuses",
  "Active",
  "Invited",
  "Disabled",
] as const satisfies readonly ("All statuses" | TeamMemberStatus)[];
