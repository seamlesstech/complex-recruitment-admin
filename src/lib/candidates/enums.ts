import type { CandidateAvailability } from "@/lib/mock/types";
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
