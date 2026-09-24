import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { getRoleLabel, getStatusLabel } from "@/lib/auth/roles";
import type { TeamMember } from "@/lib/mock/types";
import type { TeamWorkload } from "./types";

/**
 * Real Team roster + workload. The roster comes straight from
 * public.profiles (RLS: profiles_select_active only returns rows to an
 * active caller, and returns every profile regardless of that row's own
 * status — see rls_foundation.sql's profiles_select_active policy, which
 * gates on the CALLER's status, not the target row's). Workload is real,
 * live ownership data across the four operational tables, keyed directly by
 * profiles.id (== the TeamMember.id every roster row already carries), with
 * "still open" mirroring each screen's own terminal statuses. Invited and
 * Disabled members always show zero workload by construction: only rows
 * whose id matches a real owner_id count, and no code path invents a number
 * for an id that never appears as an owner_id.
 */

const EMPTY_WORKLOAD: TeamWorkload = {
  jobs: 0,
  applications: 0,
  staffRequests: 0,
  enquiries: 0,
  total: 0,
};

type ProfileRow = {
  id: string;
  display_name: string;
  email: string;
  initials: string | null;
  role: Database["public"]["Enums"]["profile_role"];
  status: Database["public"]["Enums"]["profile_status"];
  invited_at: string | null;
  joined_at: string | null;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function describeActivity(row: ProfileRow): string {
  if (row.status === "invited") {
    return row.invited_at ? `Invited ${formatDate(row.invited_at)}` : "Invited";
  }
  if (row.joined_at) return `Joined ${formatDate(row.joined_at)}`;
  return "—";
}

function mapProfileToTeamMember(row: ProfileRow): TeamMember {
  return {
    id: row.id,
    name: row.display_name,
    email: row.email,
    initials: row.initials || initialsFromName(row.display_name),
    role: getRoleLabel(row.role) as TeamMember["role"],
    status: getStatusLabel(row.status) as TeamMember["status"],
    lastActive: describeActivity(row),
    joinedAt: row.joined_at,
    invitedAt: row.invited_at,
  };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, email, initials, role, status, invited_at, joined_at")
    .order("display_name", { ascending: true });

  if (error) {
    console.error("getTeamMembers failed:", error);
    throw new Error("Could not load the team.");
  }

  return (data as ProfileRow[]).map(mapProfileToTeamMember);
}

function tally(rows: { owner_id: string | null }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const { owner_id } of rows) {
    if (owner_id) counts.set(owner_id, (counts.get(owner_id) ?? 0) + 1);
  }
  return counts;
}

export async function getTeamWorkloadByMemberId(
  members: TeamMember[],
): Promise<Record<string, TeamWorkload>> {
  const supabase = await createClient();

  const [jobs, applications, staffRequests, enquiries] = await Promise.all([
    supabase
      .from("jobs")
      .select("owner_id")
      .is("archived_at", null)
      .not("owner_id", "is", null)
      .neq("status", "closed"),
    supabase
      .from("applications")
      .select("owner_id")
      .is("archived_at", null)
      .not("owner_id", "is", null)
      .not("status", "in", "(placed,rejected,withdrawn)"),
    supabase
      .from("staff_requests")
      .select("owner_id")
      .is("archived_at", null)
      .not("owner_id", "is", null)
      .not("status", "in", "(filled,closed)"),
    supabase
      .from("enquiries")
      .select("owner_id")
      .is("archived_at", null)
      .not("owner_id", "is", null)
      .not("status", "in", "(converted,closed)"),
  ]);

  const error = jobs.error ?? applications.error ?? staffRequests.error ?? enquiries.error;
  if (error) {
    console.error("getTeamWorkloadByMemberId failed:", error);
    throw new Error("Could not load team workload.");
  }

  const jobCounts = tally(jobs.data ?? []);
  const applicationCounts = tally(applications.data ?? []);
  const staffRequestCounts = tally(staffRequests.data ?? []);
  const enquiryCounts = tally(enquiries.data ?? []);

  return Object.fromEntries(
    members.map((member) => {
      const workload = {
        jobs: jobCounts.get(member.id) ?? 0,
        applications: applicationCounts.get(member.id) ?? 0,
        staffRequests: staffRequestCounts.get(member.id) ?? 0,
        enquiries: enquiryCounts.get(member.id) ?? 0,
      };
      return [
        member.id,
        member.status === "Active"
          ? { ...workload, total: workload.jobs + workload.applications + workload.staffRequests + workload.enquiries }
          : EMPTY_WORKLOAD,
      ];
    }),
  );
}
