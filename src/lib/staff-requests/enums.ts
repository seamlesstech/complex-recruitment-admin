import type { StaffRequestStatus, StaffRequestUrgency } from "@/lib/mock/types";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Same boundary pattern as the Jobs/Candidates/Applications enums: the UI
 * speaks "Partially Filled"/"Urgent", the database speaks
 * "partially_filled"/"urgent". Staff Request status is deliberately its own
 * vocabulary (not Application status), and urgency is a separate attribute
 * — never a status.
 */

type DbStaffRequestStatus = Database["public"]["Enums"]["staff_request_status"];
type DbStaffRequestUrgency = Database["public"]["Enums"]["staff_request_urgency"];

export const staffRequestStatusFromDb: Record<DbStaffRequestStatus, StaffRequestStatus> = {
  new: "New",
  assigned: "Assigned",
  sourcing: "Sourcing",
  partially_filled: "Partially Filled",
  filled: "Filled",
  closed: "Closed",
};

export const staffRequestStatusToDb: Record<StaffRequestStatus, DbStaffRequestStatus> = {
  New: "new",
  Assigned: "assigned",
  Sourcing: "sourcing",
  "Partially Filled": "partially_filled",
  Filled: "filled",
  Closed: "closed",
};

export const staffRequestUrgencyFromDb: Record<DbStaffRequestUrgency, StaffRequestUrgency> = {
  standard: "Standard",
  urgent: "Urgent",
};

export const staffRequestUrgencyToDb: Record<StaffRequestUrgency, DbStaffRequestUrgency> = {
  Standard: "standard",
  Urgent: "urgent",
};

/** Lifecycle order, derived from the map so it can never drift from the DB enum. */
export const staffRequestStatuses: StaffRequestStatus[] = Object.values(staffRequestStatusFromDb);
export const staffRequestUrgencies: StaffRequestUrgency[] = Object.values(staffRequestUrgencyFromDb);

/** Runtime guards for Server Action input — a client can send any string. */
export function isStaffRequestStatus(value: unknown): value is StaffRequestStatus {
  return typeof value === "string" && Object.hasOwn(staffRequestStatusToDb, value);
}
export function isStaffRequestUrgency(value: unknown): value is StaffRequestUrgency {
  return typeof value === "string" && Object.hasOwn(staffRequestUrgencyToDb, value);
}
