import type { ApplicationStatus } from "@/lib/mock/types";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Same boundary pattern as src/lib/jobs/enums.ts and
 * src/lib/candidates/enums.ts: the UI speaks "New"/"Reviewing" etc (the
 * exact Title Case union the shared StatusBadge already expects), the
 * database speaks "new"/"reviewing" — every conversion lives here.
 *
 * This is the single Applications status boundary; Candidate Detail's
 * read-only application history imports applicationStatusFromDb from here
 * rather than keeping its own copy.
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

export const applicationStatusToDb: Record<ApplicationStatus, DbApplicationStatus> = {
  New: "new",
  Reviewing: "reviewing",
  Shortlisted: "shortlisted",
  Interview: "interview",
  Offered: "offered",
  Placed: "placed",
  Rejected: "rejected",
  Withdrawn: "withdrawn",
};

/** Pipeline order, derived from the map above so it can never drift from the DB enum. */
export const applicationStatuses: ApplicationStatus[] = Object.values(applicationStatusFromDb);

/** Runtime guard for Server Action input — a client can send any string. */
export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && Object.hasOwn(applicationStatusToDb, value);
}
