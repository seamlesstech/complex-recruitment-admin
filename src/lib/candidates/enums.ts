import type { ApplicationStatus, CandidateAvailability } from "@/lib/mock/types";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Same boundary pattern as src/lib/jobs/enums.ts: the UI speaks
 * "Available"/"Working" etc, the database speaks "available"/"working" —
 * every conversion lives here, not scattered across components.
 */

type DbAvailability = Database["public"]["Enums"]["candidate_availability"];

export const availabilityToDb: Record<CandidateAvailability, DbAvailability> = {
  Available: "available",
  Working: "working",
  Unavailable: "unavailable",
  Inactive: "inactive",
};

export const availabilityFromDb: Record<DbAvailability, CandidateAvailability> = {
  available: "Available",
  working: "Working",
  unavailable: "Unavailable",
  inactive: "Inactive",
};

/**
 * Deliberately separate from any future Applications enum boundary — this
 * exists only so Candidate Detail's read-only "Applications" history table
 * can render the existing shared StatusBadge, which already expects this
 * exact Title Case union. It is not a general Applications data-access
 * layer; that comes in the next migration.
 */
type DbApplicationStatus = Database["public"]["Enums"]["application_status"];

export const applicationStatusFromDb: Record<DbApplicationStatus, ApplicationStatus> = {
  new: "New",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  interview: "Interview",
  offered: "Offered",
  placed: "Placed",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};
