import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { ActivityItem, NoteRecord } from "@/lib/mock/detail-shared";
import type { StaffRequest, StaffRequestStatus, StaffRequestUrgency } from "@/lib/mock/types";
import {
  employmentTypeFromDb,
  formatPayForDisplay,
  jobStatusFromDb,
  workPatternFromDb,
} from "@/lib/jobs/enums";
import { formatDateTime, formatShortDate, UUID_PATTERN } from "@/lib/format";
import {
  staffRequestStatusFromDb,
  staffRequestStatusToDb,
  staffRequestUrgencyFromDb,
  staffRequestUrgencyToDb,
} from "./enums";
import type {
  AddStaffRequestNoteResult,
  RelatedJob,
  StaffRequestDetailData,
  StaffRequestMutationResult,
} from "./types";

/**
 * Same reusable pattern as jobs/, candidates/ and applications/:
 *   - "server-only", plain async functions, no repository framework.
 *   - Reads/writes run under the caller's own session via createClient();
 *     RLS is the authorization boundary (no service-role key anywhere).
 *   - Employer / Employer Contact / Sector / Owner display values are
 *     resolved relationally in one PostgREST select, with row types inferred
 *     from the generated Database types.
 *   - DB-enum <-> UI-label conversion lives in ./enums (and jobs/enums for
 *     the shared employment/work-pattern/pay enums).
 *
 * quantity_filled is the MVP's manually-maintained integer (see
 * supabase/migrations/20260922120237_staff_requests.sql) — it is displayed
 * as stored, never inferred from Applications, and this task adds no editor
 * for it (the approved UI has none).
 */

const STAFF_REQUESTS_LIST_SELECT = `
  id,
  reference,
  requirement_title,
  quantity_required,
  quantity_filled,
  location,
  needed_by,
  urgency,
  status,
  submitted_at,
  employer:employers!employer_id(name),
  sector:sectors!sector_id(name),
  owner:profiles!owner_id(display_name)
` as const;

/** Column types come from the generated Row; only the embeds are spelled out. */
type ListRowShape = Pick<
  Database["public"]["Tables"]["staff_requests"]["Row"],
  | "id"
  | "reference"
  | "requirement_title"
  | "quantity_required"
  | "quantity_filled"
  | "location"
  | "needed_by"
  | "urgency"
  | "status"
  | "submitted_at"
> & {
  employer: { name: string } | null;
  sector: { name: string } | null;
  owner: { display_name: string } | null;
};

function mapRowToStaffRequest(row: ListRowShape): StaffRequest {
  return {
    id: row.id,
    reference: row.reference,
    client: row.employer?.name ?? "—",
    requirementTitle: row.requirement_title,
    quantityRequired: row.quantity_required,
    quantityFilled: row.quantity_filled,
    sector: row.sector?.name ?? "—",
    location: row.location ?? "—",
    neededBy: row.needed_by ? formatShortDate(row.needed_by) : null,
    urgency: staffRequestUrgencyFromDb[row.urgency],
    owner: row.owner?.display_name ?? null,
    status: staffRequestStatusFromDb[row.status],
    submittedAt: formatDateTime(row.submitted_at),
  };
}

/**
 * Non-archived Staff Requests, newest first. archived_at is filtered
 * explicitly (admin-tier roles may SELECT archived rows under RLS, but the
 * operational list never shows them). Filled/Closed are lifecycle outcomes,
 * not archival, and are included. Filtering/search runs client-side over
 * this result — the same accepted MVP trade-off as the other domains.
 */
export async function getStaffRequests(): Promise<StaffRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("staff_requests")
    .select(STAFF_REQUESTS_LIST_SELECT)
    .is("archived_at", null)
    .order("submitted_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("getStaffRequests failed:", error);
    throw new Error("Could not load staff requests.");
  }

  return data.map(mapRowToStaffRequest);
}

/** Dashboard "Recent staff requests" — the latest few, in the list-row shape. */
export async function getRecentStaffRequests(limit = 2): Promise<StaffRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("staff_requests")
    .select(STAFF_REQUESTS_LIST_SELECT)
    .is("archived_at", null)
    .order("submitted_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentStaffRequests failed:", error);
    throw new Error("Could not load recent staff requests.");
  }

  return data.map(mapRowToStaffRequest);
}

/** Statuses that still represent live, unfinished demand. */
const ACTIVE_DB_STATUSES = ["new", "assigned", "sourcing", "partially_filled"] as const;

/**
 * Dashboard counts: New staff requests (status = new), how many of those
 * are unassigned, and how many still-active requests have no owner at all.
 */
export async function getStaffRequestDashboardCounts(): Promise<{
  newCount: number;
  newUnassignedCount: number;
  activeUnassignedCount: number;
}> {
  const supabase = await createClient();
  const base = () =>
    supabase
      .from("staff_requests")
      .select("id", { count: "exact", head: true })
      .is("archived_at", null);

  const [newResult, newUnassignedResult, activeUnassignedResult] = await Promise.all([
    base().eq("status", "new"),
    base().eq("status", "new").is("owner_id", null),
    base().in("status", [...ACTIVE_DB_STATUSES]).is("owner_id", null),
  ]);

  const error = newResult.error ?? newUnassignedResult.error ?? activeUnassignedResult.error;
  if (error) {
    console.error("getStaffRequestDashboardCounts failed:", error);
    throw new Error("Could not load staff request counts.");
  }

  return {
    newCount: newResult.count ?? 0,
    newUnassignedCount: newUnassignedResult.count ?? 0,
    activeUnassignedCount: activeUnassignedResult.count ?? 0,
  };
}

async function getStaffRequestNotes(staffRequestId: string): Promise<NoteRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("staff_request_notes")
    .select("id, body, created_at, author:profiles!author_id(display_name)")
    .eq("staff_request_id", staffRequestId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getStaffRequestNotes failed:", error);
    throw new Error("Could not load notes.");
  }

  return data.map((row) => ({
    id: row.id,
    author: row.author?.display_name ?? "Unknown",
    timestamp: formatDateTime(row.created_at),
    text: row.body,
  }));
}

/**
 * Real Jobs linked through jobs.staff_request_id — replaces the old
 * hand-curated mock map. Non-archived only; application counts are live.
 */
async function getRelatedJobs(staffRequestId: string): Promise<RelatedJob[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("id, reference, title, status, applications(count)")
    .eq("staff_request_id", staffRequestId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getRelatedJobs failed:", error);
    throw new Error("Could not load related jobs.");
  }

  return data.map((row) => ({
    id: row.id,
    reference: row.reference,
    title: row.title,
    status: jobStatusFromDb[row.status],
    applicationsCount: row.applications?.[0]?.count ?? 0,
  }));
}

/**
 * Real activity_events for this Staff Request only. Nothing generates these
 * rows yet, so this is normally empty — shown honestly, never synthesised.
 */
async function getStaffRequestActivity(staffRequestId: string): Promise<ActivityItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_events")
    .select("id, verb, detail, occurred_at, actor:profiles!actor_profile_id(display_name)")
    .eq("entity_type", "staff_request")
    .eq("entity_id", staffRequestId)
    .order("occurred_at", { ascending: true });

  if (error) {
    console.error("getStaffRequestActivity failed:", error);
    throw new Error("Could not load activity.");
  }

  return data.map((row) => {
    const action = row.detail ?? row.verb.replace(/_/g, " ");
    return {
      id: String(row.id),
      description: row.actor ? `${row.actor.display_name} ${action}` : action,
      timestamp: formatDateTime(row.occurred_at),
    };
  });
}

/**
 * Returns null when the id isn't a UUID (e.g. an old mock `sr-…` link from
 * the still-mock Enquiry/Activity/Notification screens), the row doesn't
 * exist, is archived, or RLS denies it.
 */
export async function getStaffRequestForDetail(id: string): Promise<StaffRequestDetailData | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("staff_requests")
    // staff_requests has TWO FKs into employer_contacts (the plain
    // employer_contact_id FK and the composite (employer_contact_id,
    // employer_id) integrity FK), so the contact embed names the constraint.
    .select(`
      id, reference, requirement_title, quantity_required, quantity_filled,
      location, needed_by, urgency, status, submitted_at,
      owner_id, source, employment_type, work_pattern, duration, pay_type, pay_from, pay_to,
      employer:employers!employer_id(name),
      sector:sectors!sector_id(name),
      owner:profiles!owner_id(display_name),
      contact:employer_contacts!staff_requests_employer_contact_id_fkey(name, email, phone, job_title)
    `)
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    console.error("getStaffRequestForDetail failed:", error);
    throw new Error("Could not load this staff request.");
  }
  if (!row) return null;

  const [notes, relatedJobs, activity] = await Promise.all([
    getStaffRequestNotes(row.id),
    getRelatedJobs(row.id),
    getStaffRequestActivity(row.id),
  ]);

  return {
    request: mapRowToStaffRequest(row),
    ownerId: row.owner_id,
    contact: row.contact
      ? {
          name: row.contact.name,
          email: row.contact.email ?? "",
          phone: row.contact.phone ?? "",
          jobTitle: row.contact.job_title ?? "",
        }
      : null,
    requirement: {
      employmentType: row.employment_type
        ? employmentTypeFromDb[row.employment_type]
        : "Not specified",
      workPattern: row.work_pattern ? workPatternFromDb[row.work_pattern] : "Not specified",
      duration: row.duration ?? "Not specified",
      pay: formatPayForDisplay(row.pay_type, row.pay_from, row.pay_to),
      source: row.source ?? "Not recorded",
    },
    relatedJobs,
    notes,
    activity,
  };
}

// Postgres error codes surfaced by PostgREST for the failure modes we map.
const PG_FOREIGN_KEY_VIOLATION = "23503";
const PG_INSUFFICIENT_PRIVILEGE = "42501";

export async function updateStaffRequestStatusOwnerUrgency(
  id: string,
  status: StaffRequestStatus,
  ownerId: string | null,
  urgency: StaffRequestUrgency,
): Promise<StaffRequestMutationResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("staff_requests")
    .update({
      status: staffRequestStatusToDb[status],
      owner_id: ownerId,
      urgency: staffRequestUrgencyToDb[urgency],
    })
    .eq("id", id)
    .is("archived_at", null)
    .select("id");

  if (error) {
    console.error("updateStaffRequestStatusOwnerUrgency failed:", error);
    if (error.code === PG_FOREIGN_KEY_VIOLATION) {
      return { ok: false, error: "The selected recruiter could not be found." };
    }
    if (error.code === PG_INSUFFICIENT_PRIVILEGE) {
      return { ok: false, error: "You don't have permission to update this staff request." };
    }
    return { ok: false, error: "Could not save changes. Please try again." };
  }

  // RLS-filtered UPDATEs don't error — they match zero rows. Report that as
  // the denial (or since-archived row) it is, not as a successful save.
  if (data.length === 0) {
    return {
      ok: false,
      error: "You don't have permission to update this staff request, or it no longer exists.",
    };
  }
  return { ok: true };
}

export async function addStaffRequestNote(
  staffRequestId: string,
  body: string,
  authorId: string,
  authorDisplayName: string,
): Promise<AddStaffRequestNoteResult> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Note text is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_request_notes")
    .insert({ staff_request_id: staffRequestId, author_id: authorId, body: trimmed })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("addStaffRequestNote failed:", error);
    if (error.code === PG_INSUFFICIENT_PRIVILEGE) {
      return { ok: false, error: "You don't have permission to add notes." };
    }
    if (error.code === PG_FOREIGN_KEY_VIOLATION) {
      return { ok: false, error: "This staff request no longer exists." };
    }
    return { ok: false, error: "Could not save the note. Please try again." };
  }

  return {
    ok: true,
    note: {
      id: data.id,
      author: authorDisplayName,
      timestamp: formatDateTime(data.created_at),
      text: trimmed,
    },
  };
}
