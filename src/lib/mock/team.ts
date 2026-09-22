import { candidateApplications } from "./candidate-applications";
import { enquiries } from "./enquiries";
import { jobs } from "./jobs";
import { staffRequests } from "./staff-requests";
import type { TeamMember, TeamMemberStatus, TeamRole } from "./types";

/**
 * The people who operate Complex Admin. This is the frontend/mock model
 * only — no auth, no persistence, no permission enforcement. Moremi Molai,
 * Taurai and Shingi are the same recruiters already referenced as
 * `owner`/`assignee` across Jobs, Applications, Staff Requests and
 * Enquiries; everyone else is a fictional addition to demonstrate the full
 * role/status range.
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
    operationalOwnerAliases: ["Moremi"],
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
    operationalOwnerAliases: ["Taurai"],
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
    operationalOwnerAliases: ["Shingi"],
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
    operationalOwnerAliases: [],
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
    operationalOwnerAliases: [],
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
    operationalOwnerAliases: [],
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
    operationalOwnerAliases: [],
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
    operationalOwnerAliases: [],
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

export interface TeamWorkload {
  jobs: number;
  applications: number;
  staffRequests: number;
  enquiries: number;
  total: number;
}

/**
 * "Still open" per dataset, mirroring that screen's own terminal statuses —
 * a workload count means the same thing here as it would filtering that
 * screen down to unresolved records.
 */
const TERMINAL_APPLICATION_STATUSES = new Set(["Placed", "Rejected", "Withdrawn"]);
const TERMINAL_STAFF_REQUEST_STATUSES = new Set(["Filled", "Closed"]);
const TERMINAL_ENQUIRY_STATUSES = new Set(["Converted", "Closed"]);

/**
 * Derives a team member's current operational workload from the existing
 * Jobs/Applications/Staff Requests/Enquiries mock datasets by matching their
 * `operationalOwnerAliases` against each record's raw `owner`/`assignee`
 * string. Mock/frontend-only — this is not the real user_id relationship.
 */
function workloadForAliases(aliases: string[]): TeamWorkload {
  if (aliases.length === 0) {
    return { jobs: 0, applications: 0, staffRequests: 0, enquiries: 0, total: 0 };
  }

  const jobsCount = jobs.filter(
    (job) => job.owner && aliases.includes(job.owner) && job.status !== "Closed",
  ).length;

  const applicationsCount = candidateApplications.filter(
    (application) =>
      application.owner &&
      aliases.includes(application.owner) &&
      !TERMINAL_APPLICATION_STATUSES.has(application.status),
  ).length;

  const staffRequestsCount = staffRequests.filter(
    (request) =>
      request.owner &&
      aliases.includes(request.owner) &&
      !TERMINAL_STAFF_REQUEST_STATUSES.has(request.status),
  ).length;

  const enquiriesCount = enquiries.filter(
    (enquiry) =>
      enquiry.owner &&
      aliases.includes(enquiry.owner) &&
      !TERMINAL_ENQUIRY_STATUSES.has(enquiry.status),
  ).length;

  return {
    jobs: jobsCount,
    applications: applicationsCount,
    staffRequests: staffRequestsCount,
    enquiries: enquiriesCount,
    total: jobsCount + applicationsCount + staffRequestsCount + enquiriesCount,
  };
}

export const teamWorkloadById: Record<string, TeamWorkload> = Object.fromEntries(
  teamMembers.map((member) => [
    member.id,
    workloadForAliases(member.operationalOwnerAliases),
  ]),
);
