import type { EnquiryStatus, EnquiryType } from "@/lib/mock/types";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Same boundary pattern as the other domains' enums: the UI speaks
 * "In Review"/"Partnership", the database speaks "in_review"/"partnership".
 * Enquiry type (who is asking) and status (where it is in triage) are
 * separate concepts and stay separate maps.
 */

type DbEnquiryStatus = Database["public"]["Enums"]["enquiry_status"];
type DbEnquiryType = Database["public"]["Enums"]["enquiry_type"];

export const enquiryStatusFromDb: Record<DbEnquiryStatus, EnquiryStatus> = {
  new: "New",
  in_review: "In Review",
  responded: "Responded",
  converted: "Converted",
  closed: "Closed",
};

export const enquiryStatusToDb: Record<EnquiryStatus, DbEnquiryStatus> = {
  New: "new",
  "In Review": "in_review",
  Responded: "responded",
  Converted: "converted",
  Closed: "closed",
};

export const enquiryTypeFromDb: Record<DbEnquiryType, EnquiryType> = {
  employer: "Employer",
  candidate: "Candidate",
  general: "General",
  partnership: "Partnership",
};

/** Triage order, derived from the maps so they can never drift from the DB enums. */
export const enquiryStatuses: EnquiryStatus[] = Object.values(enquiryStatusFromDb);
export const enquiryTypes: EnquiryType[] = Object.values(enquiryTypeFromDb);

/**
 * "Converted" is never a generic, hand-picked status: it is only ever set
 * together with its target by the database's convert_enquiry() function
 * (and the enquiries CHECK constraints reject it otherwise). The rail and
 * the Server Action both use this to keep it out of ordinary saves.
 */
export const CONVERTED_STATUS: EnquiryStatus = "Converted";

/** Runtime guard for Server Action input — a client can send any string. */
export function isEnquiryStatus(value: unknown): value is EnquiryStatus {
  return typeof value === "string" && Object.hasOwn(enquiryStatusToDb, value);
}
