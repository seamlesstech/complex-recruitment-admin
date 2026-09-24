import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { ActivityItem, NoteRecord } from "@/lib/mock/detail-shared";
import type { Enquiry, EnquiryStatus } from "@/lib/mock/types";
import { availabilityFromDb } from "@/lib/candidates/enums";
import { staffRequestStatusFromDb } from "@/lib/staff-requests/enums";
import { formatDateTime, UUID_PATTERN } from "@/lib/format";
import { enquiryStatusFromDb, enquiryStatusToDb, enquiryTypeFromDb } from "./enums";
import type {
  AddEnquiryNoteResult,
  EnquiryDetailData,
  EnquiryMutationResult,
  EnquiryRelatedRecord,
} from "./types";

/**
 * Same reusable pattern as jobs/, candidates/, applications/ and
 * staff-requests/:
 *   - "server-only", plain async functions, no repository framework.
 *   - Reads/writes run under the caller's own session via createClient();
 *     RLS is the authorization boundary (no service-role key anywhere).
 *   - Employer / Owner / conversion targets are resolved relationally in
 *     one PostgREST select; column types come from the generated Database
 *     types.
 *
 * Company: an inbound enquiry may only carry the raw company_free_text.
 * The matched Employer's name is shown when employer_id resolves, else the
 * free text — viewing an Enquiry never creates or matches an Employer.
 *
 * Unread: the schema's read state is `enquiries.read_at` ("unread" =
 * `read_at IS NULL`; there is no `unread` column). Opening an Enquiry does
 * not set read_at — same decision and reasoning as Applications (no
 * mutation-during-render, no brittle client effect) until a deliberate
 * read-state workflow exists.
 *
 * Conversion: status "converted" and its target are only ever written
 * together by the database's convert_enquiry() function. The generic
 * status/owner update below never writes "converted" and never moves a
 * converted enquiry off it; the enquiries CHECK constraints are the hard
 * backstop either way.
 */

const ENQUIRIES_LIST_SELECT = `
  id,
  reference,
  contact_name,
  company_free_text,
  email,
  phone,
  type,
  subject,
  message,
  source,
  status,
  received_at,
  read_at,
  employer:employers!employer_id(name),
  owner:profiles!owner_id(display_name)
` as const;

/** Column types come from the generated Row; only the embeds are spelled out. */
type ListRowShape = Pick<
  Database["public"]["Tables"]["enquiries"]["Row"],
  | "id"
  | "reference"
  | "contact_name"
  | "company_free_text"
  | "email"
  | "phone"
  | "type"
  | "subject"
  | "message"
  | "source"
  | "status"
  | "received_at"
  | "read_at"
> & {
  employer: { name: string } | null;
  owner: { display_name: string } | null;
};

function mapRowToEnquiry(row: ListRowShape): Enquiry {
  return {
    id: row.id,
    reference: row.reference,
    contactName: row.contact_name,
    company: row.employer?.name ?? row.company_free_text ?? null,
    email: row.email ?? "",
    phone: row.phone ?? "",
    type: enquiryTypeFromDb[row.type],
    subject: row.subject ?? "(No subject)",
    message: row.message,
    source: row.source ?? "Not recorded",
    owner: row.owner?.display_name ?? null,
    status: enquiryStatusFromDb[row.status],
    receivedAt: formatDateTime(row.received_at),
    unread: row.read_at === null,
  };
}

/**
 * Non-archived Enquiries, newest first. archived_at is filtered explicitly
 * (admin-tier roles may SELECT archived rows under RLS). Converted/Closed
 * are lifecycle outcomes, not archival, and are included. Filtering/search
 * runs client-side over this result — the same accepted MVP trade-off as
 * the other domains.
 */
export async function getEnquiries(): Promise<Enquiry[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enquiries")
    .select(ENQUIRIES_LIST_SELECT)
    .is("archived_at", null)
    .order("received_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("getEnquiries failed:", error);
    throw new Error("Could not load enquiries.");
  }

  return data.map(mapRowToEnquiry);
}

/** Dashboard attention: non-archived Enquiries still at status = new. */
export async function getNewEnquiryCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("enquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new")
    .is("archived_at", null);

  if (error) {
    console.error("getNewEnquiryCount failed:", error);
    throw new Error("Could not load enquiry count.");
  }
  return count ?? 0;
}

async function getEnquiryNotes(enquiryId: string): Promise<NoteRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("enquiry_notes")
    .select("id, body, created_at, author:profiles!author_id(display_name)")
    .eq("enquiry_id", enquiryId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getEnquiryNotes failed:", error);
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
 * Real activity_events for this Enquiry only. Nothing generates these rows
 * yet, so this is normally empty — shown honestly, never synthesised.
 */
async function getEnquiryActivity(enquiryId: string): Promise<ActivityItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_events")
    .select("id, verb, detail, occurred_at, actor:profiles!actor_profile_id(display_name)")
    .eq("entity_type", "enquiry")
    .eq("entity_id", enquiryId)
    .order("occurred_at", { ascending: true });

  if (error) {
    console.error("getEnquiryActivity failed:", error);
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
 * Returns null when the id isn't a UUID (e.g. an old mock `enq-…` link from
 * the still-mock Activity/Notifications feeds), the row doesn't exist, is
 * archived, or RLS denies it.
 */
export async function getEnquiryForDetail(id: string): Promise<EnquiryDetailData | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("enquiries")
    .select(`
      id, reference, contact_name, company_free_text, email, phone, type, subject,
      message, source, status, received_at, read_at, owner_id,
      employer:employers!employer_id(name),
      owner:profiles!owner_id(display_name),
      converted_candidate:candidates!converted_candidate_id(id, reference, full_name, availability),
      converted_staff_request:staff_requests!converted_staff_request_id(
        id, reference, requirement_title, quantity_required, status,
        employer:employers!employer_id(name)
      )
    `)
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    console.error("getEnquiryForDetail failed:", error);
    throw new Error("Could not load this enquiry.");
  }
  if (!row) return null;

  const [notes, activity] = await Promise.all([
    getEnquiryNotes(row.id),
    getEnquiryActivity(row.id),
  ]);

  // At most one target can be set (DB CHECK). A target hidden by RLS (e.g.
  // an archived record for a non-admin) resolves to null and is shown as
  // "no related record" rather than a broken link.
  let relatedRecord: EnquiryRelatedRecord = null;
  if (row.converted_staff_request) {
    const target = row.converted_staff_request;
    relatedRecord = {
      type: "staff-request",
      request: {
        id: target.id,
        reference: target.reference,
        client: target.employer?.name ?? "—",
        requirementTitle: target.requirement_title,
        quantityRequired: target.quantity_required,
        status: staffRequestStatusFromDb[target.status],
      },
    };
  } else if (row.converted_candidate) {
    const target = row.converted_candidate;
    relatedRecord = {
      type: "candidate",
      candidate: {
        id: target.id,
        reference: target.reference,
        name: target.full_name,
        availability: availabilityFromDb[target.availability],
      },
    };
  }

  return {
    enquiry: mapRowToEnquiry(row),
    ownerId: row.owner_id,
    relatedRecord,
    notes,
    activity,
  };
}

// Postgres error codes surfaced by PostgREST for the failure modes we map.
const PG_FOREIGN_KEY_VIOLATION = "23503";
const PG_CHECK_VIOLATION = "23514";
const PG_INSUFFICIENT_PRIVILEGE = "42501";

/**
 * Generic rail save. Two shapes, so conversion integrity never depends on
 * the browser:
 *   - status "Converted" (the enquiry is already converted, so the rail
 *     shows it locked): only owner_id is written, and only if the stored
 *     row really is converted — a not-yet-converted enquiry can't be
 *     flipped to Converted here.
 *   - any other status: written together with owner_id, but only on a row
 *     that is NOT converted — a converted enquiry can't be moved off it.
 * Zero matched rows is reported as an error, never as a save.
 */
export async function updateEnquiryStatusAndOwner(
  id: string,
  status: EnquiryStatus,
  ownerId: string | null,
): Promise<EnquiryMutationResult> {
  const supabase = await createClient();
  const converted = enquiryStatusToDb.Converted;

  const query =
    status === "Converted"
      ? supabase
          .from("enquiries")
          .update({ owner_id: ownerId })
          .eq("id", id)
          .eq("status", converted)
      : supabase
          .from("enquiries")
          .update({ status: enquiryStatusToDb[status], owner_id: ownerId })
          .eq("id", id)
          .neq("status", converted);

  const { data, error } = await query.is("archived_at", null).select("id");

  if (error) {
    console.error("updateEnquiryStatusAndOwner failed:", error);
    if (error.code === PG_FOREIGN_KEY_VIOLATION) {
      return { ok: false, error: "The selected owner could not be found." };
    }
    if (error.code === PG_CHECK_VIOLATION) {
      return { ok: false, error: "That status change isn't allowed for this enquiry." };
    }
    if (error.code === PG_INSUFFICIENT_PRIVILEGE) {
      return { ok: false, error: "You don't have permission to update this enquiry." };
    }
    return { ok: false, error: "Could not save changes. Please try again." };
  }

  if (data.length === 0) {
    return {
      ok: false,
      error:
        status === "Converted"
          ? "An enquiry can only be marked Converted through a conversion."
          : "This enquiry couldn't be updated — it may have been converted, or you don't have permission.",
    };
  }
  return { ok: true };
}

export async function addEnquiryNote(
  enquiryId: string,
  body: string,
  authorId: string,
  authorDisplayName: string,
): Promise<AddEnquiryNoteResult> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Note text is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enquiry_notes")
    .insert({ enquiry_id: enquiryId, author_id: authorId, body: trimmed })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("addEnquiryNote failed:", error);
    if (error.code === PG_INSUFFICIENT_PRIVILEGE) {
      return { ok: false, error: "You don't have permission to add notes." };
    }
    if (error.code === PG_FOREIGN_KEY_VIOLATION) {
      return { ok: false, error: "This enquiry no longer exists." };
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
