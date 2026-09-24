import type { TeamMember, TeamMemberStatus, TeamRole } from "./types";

/**
 * The Team ROSTER — still a preview-only frontend/mock model: no auth, no
 * persistence, no permission enforcement (Team/account management is not
 * migrated yet). Only "Moremi Molai" corresponds to a real profile today;
 * everyone else is fictional, to demonstrate the full role/status range,
 * and is deliberately NOT created as a database account.
 *
 * The Workload column is no longer derived here — it comes from real
 * owner_id data via lib/team/queries.ts.
 */
export const teamMembers: TeamMember[] = [
  {
    id: "team-moremi-molai",
    name: "Moremi Molai",
    email: "moremi.molai@complexrecruitment.co.uk",
    initials: "MM",
    role: "Super Admin",
    status: "Active",
    lastActive: "Now",
    joinedAt: "2026-01-06",
    invitedAt: null,
    isCurrentUser: true,
  },
  {
    id: "team-taurai",
    name: "Taurai",
    email: "taurai@complexrecruitment.co.uk",
    initials: "T",
    role: "Admin / Manager",
    status: "Active",
    lastActive: "12 min ago",
    joinedAt: "2026-01-12",
    invitedAt: null,
    isCurrentUser: false,
  },
  {
    id: "team-shingi",
    name: "Shingi",
    email: "shingi@complexrecruitment.co.uk",
    initials: "S",
    role: "Recruiter",
    status: "Active",
    lastActive: "Today · 09:42",
    joinedAt: "2026-02-03",
    invitedAt: null,
    isCurrentUser: false,
  },
  {
    id: "team-priya-nair",
    name: "Priya Nair",
    email: "priya.nair@complexrecruitment.co.uk",
    initials: "PN",
    role: "Recruiter",
    status: "Active",
    lastActive: "Yesterday · 16:20",
    joinedAt: "2026-06-18",
    invitedAt: null,
    isCurrentUser: false,
  },
  {
    id: "team-daniel-osei",
    name: "Daniel Osei",
    email: "daniel.osei@complexrecruitment.co.uk",
    initials: "DO",
    role: "Viewer",
    status: "Active",
    lastActive: "Today · 11:05",
    joinedAt: "2026-07-22",
    invitedAt: null,
    isCurrentUser: false,
  },
  {
    id: "team-grace-whitfield",
    name: "Grace Whitfield",
    email: "grace.whitfield@complexrecruitment.co.uk",
    initials: "GW",
    role: "Recruiter",
    status: "Invited",
    lastActive: "Not joined yet",
    joinedAt: null,
    invitedAt: "2026-09-18",
    isCurrentUser: false,
  },
  {
    id: "team-olivia-bennett",
    name: "Olivia Bennett",
    email: "olivia.bennett@complexrecruitment.co.uk",
    initials: "OB",
    role: "Viewer",
    status: "Invited",
    lastActive: "Not joined yet",
    joinedAt: null,
    invitedAt: "2026-09-20",
    isCurrentUser: false,
  },
  {
    id: "team-callum-reid",
    name: "Callum Reid",
    email: "callum.reid@complexrecruitment.co.uk",
    initials: "CR",
    role: "Admin / Manager",
    status: "Disabled",
    lastActive: "14 Aug · 10:15",
    joinedAt: "2026-03-10",
    invitedAt: null,
    isCurrentUser: false,
  },
];

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

export const teamSummaryDisplayCounts = (() => {
  const all = teamMembers.length;
  return {
    all,
    active: teamMembers.filter((m) => m.status === "Active").length,
    invited: teamMembers.filter((m) => m.status === "Invited").length,
    disabled: teamMembers.filter((m) => m.status === "Disabled").length,
  };
})();
