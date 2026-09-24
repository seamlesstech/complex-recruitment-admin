import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { TeamMember } from "@/lib/mock/types";
import type { TeamWorkload } from "./types";

/**
 * Real operational workload for the Team screen.
 *
 * The Team ROSTER is still the preview-only mock list (lib/mock/team.ts):
 * Team/account management isn't migrated, and fictional members aren't
 * turned into database accounts. The WORKLOAD column, however, is now real:
 * it counts non-archived, still-open records whose owner_id is a real
 * profile, across all four live operational tables. A roster entry is
 * matched to a real profile by email, falling back to exact display name;
 * an entry with no matching profile genuinely owns nothing and shows zero.
 *
 * "Still open" mirrors each screen's own terminal statuses.
 */

const EMPTY_WORKLOAD: TeamWorkload = {
  jobs: 0,
  applications: 0,
  staffRequests: 0,
  enquiries: 0,
  total: 0,
};

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

  const [profiles, jobs, applications, staffRequests, enquiries] = await Promise.all([
    supabase.from("profiles").select("id, display_name, email"),
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

  const error =
    profiles.error ?? jobs.error ?? applications.error ?? staffRequests.error ?? enquiries.error;
  if (error) {
    console.error("getTeamWorkloadByMemberId failed:", error);
    throw new Error("Could not load team workload.");
  }

  const jobCounts = tally(jobs.data ?? []);
  const applicationCounts = tally(applications.data ?? []);
  const staffRequestCounts = tally(staffRequests.data ?? []);
  const enquiryCounts = tally(enquiries.data ?? []);

  const profileRows = profiles.data ?? [];
  const profileIdByEmail = new Map(
    profileRows.map((p) => [p.email.toLowerCase(), p.id] as const),
  );
  const profileIdByName = new Map(profileRows.map((p) => [p.display_name, p.id] as const));

  return Object.fromEntries(
    members.map((member) => {
      const profileId =
        profileIdByEmail.get(member.email.toLowerCase()) ?? profileIdByName.get(member.name);
      if (!profileId) return [member.id, EMPTY_WORKLOAD];

      const workload = {
        jobs: jobCounts.get(profileId) ?? 0,
        applications: applicationCounts.get(profileId) ?? 0,
        staffRequests: staffRequestCounts.get(profileId) ?? 0,
        enquiries: enquiryCounts.get(profileId) ?? 0,
      };
      return [
        member.id,
        {
          ...workload,
          total:
            workload.jobs + workload.applications + workload.staffRequests + workload.enquiries,
        },
      ];
    }),
  );
}
