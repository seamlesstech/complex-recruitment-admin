import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ActivityItem, DocumentRecord, NoteRecord } from "@/lib/mock/detail-shared";
import type { ApplicationStatus, CandidateApplication } from "@/lib/mock/types";
import { editorEnumFieldsFromDb, formatPayForDisplay } from "@/lib/jobs/enums";
import {
  formatDateTime,
  formatFileSize,
  formatFullDate,
  UUID_PATTERN,
} from "@/lib/format";
import { applicationStatusFromDb, applicationStatusToDb } from "./enums";
import type {
  AddApplicationNoteResult,
  ApplicationDetailData,
  ApplicationMutationResult,
  RecentApplication,
} from "./types";

/**
 * Same reusable pattern established in src/lib/jobs/queries.ts and
 * src/lib/candidates/queries.ts:
 *   - "server-only", plain async functions, no repository framework.
 *   - Reads/writes run under the caller's own session via createClient()
 *     (RLS is the authorization boundary; no service-role key anywhere).
 *   - Functions return UI-vocabulary shapes (CandidateApplication,
 *     NoteRecord, ...); DB-enum <-> UI-label conversion lives in ./enums.
 *   - Candidate / Job / Employer / Owner display values are resolved
 *     relationally in a single PostgREST select (no N+1 follow-ups), and
 *     row types are inferred from the generated Database types rather than
 *     hand-written.
 *
 * Unread: the schema's MVP read state is `applications.read_at` (a nullable
 * timestamp — "unread" is `read_at IS NULL`; there is no `unread` boolean
 * column). Opening an Application deliberately does NOT set read_at: doing
 * it during a Server Component render would be a mutation-during-render,
 * and a client effect would be brittle and fire on every prefetch/refresh.
 * The indicator stays as-is until a deliberate read-state workflow exists.
 */

const APPLICATIONS_LIST_SELECT = `
  id,
  reference,
  status,
  submitted_at,
  read_at,
  candidate:candidates!candidate_id(id, full_name),
  job:jobs!job_id(id, reference, title, employer:employers!employer_id(name)),
  owner:profiles!owner_id(display_name)
` as const;

/**
 * Non-archived applications, newest first, with candidate/job/employer/owner
 * names resolved relationally. archived_at is filtered explicitly (not left
 * to RLS alone) — admin-tier roles may SELECT archived rows under RLS, but
 * the operational list must never show them. Rejected/Withdrawn/Placed are
 * lifecycle outcomes, not archival, and are included.
 *
 * Filtering/search happens client-side over this full result set, the same
 * accepted MVP trade-off as getJobs()/getCandidates().
 */
export async function getApplications(): Promise<CandidateApplication[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(APPLICATIONS_LIST_SELECT)
    .is("archived_at", null)
    .order("submitted_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("getApplications failed:", error);
    throw new Error("Could not load applications.");
  }

  const applications: CandidateApplication[] = [];
  for (const row of data) {
    // candidate_id/job_id are NOT NULL FKs, but RLS can still hide the
    // related row (e.g. an archived Job from a recruiter). Such a row can't
    // be rendered truthfully, so it's skipped rather than shown half-empty.
    if (!row.candidate || !row.job) {
      console.warn("getApplications: related candidate/job not visible for", row.id);
      continue;
    }
    applications.push({
      id: row.id,
      reference: row.reference,
      candidateId: row.candidate.id,
      candidateName: row.candidate.full_name,
      jobId: row.job.id,
      jobReference: row.job.reference,
      jobTitle: row.job.title,
      client: row.job.employer?.name ?? "—",
      appliedAt: formatFullDate(row.submitted_at),
      owner: row.owner?.display_name ?? null,
      status: applicationStatusFromDb[row.status],
      unread: row.read_at === null,
    });
  }
  return applications;
}

/** Dashboard "New applications": non-archived Applications still at status = new. */
export async function getNewApplicationCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "new")
    .is("archived_at", null);

  if (error) {
    console.error("getNewApplicationCount failed:", error);
    throw new Error("Could not load application count.");
  }
  return count ?? 0;
}

/** Dashboard "Recent applications" panel — the latest few, in the panel's existing shape. */
export async function getRecentApplications(limit = 5): Promise<RecentApplication[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(`
      id, status, submitted_at,
      candidate:candidates!candidate_id(full_name),
      job:jobs!job_id(title, sector:sectors!sector_id(name)),
      owner:profiles!owner_id(display_name)
    `)
    .is("archived_at", null)
    .order("submitted_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentApplications failed:", error);
    throw new Error("Could not load recent applications.");
  }

  return data
    .filter((row) => row.candidate && row.job)
    .map((row) => ({
      id: row.id,
      candidate: row.candidate!.full_name,
      role: row.job!.title,
      sector: row.job!.sector?.name ?? "—",
      applied: formatDateTime(row.submitted_at),
      status: applicationStatusFromDb[row.status],
      assignee: row.owner?.display_name ?? null,
    }));
}

async function getApplicationNotes(applicationId: string): Promise<NoteRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("application_notes")
    .select("id, body, created_at, author:profiles!author_id(display_name)")
    .eq("application_id", applicationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getApplicationNotes failed:", error);
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
 * The exact Candidate Document VERSIONS linked to this Application via
 * application_documents — not the Candidate's current documents. A linked
 * version is shown even if it has since been superseded or archived on the
 * Candidate, because it's still what this Application was submitted with.
 * Metadata only: no storage paths, signed URLs or public URLs are read.
 */
async function getApplicationDocuments(applicationId: string): Promise<DocumentRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("application_documents")
    .select(`
      id, linked_at,
      document:candidate_documents!candidate_document_id(
        original_filename, mime_type, size_bytes, uploaded_at, expiry_date, is_current,
        document_type:document_types!document_type_id(name)
      )
    `)
    .eq("application_id", applicationId)
    .order("linked_at", { ascending: true });

  if (error) {
    console.error("getApplicationDocuments failed:", error);
    throw new Error("Could not load documents.");
  }

  return data.flatMap((row) => {
    const doc = row.document;
    if (!doc) return [];
    const fileType = doc.mime_type.split("/")[1]?.toUpperCase() ?? doc.mime_type;
    const version = doc.is_current ? "Current version" : "Earlier version";
    return [{
      id: row.id,
      label: doc.document_type?.name ?? "Document",
      fileName: doc.original_filename,
      fileType,
      fileSize: formatFileSize(doc.size_bytes),
      context: `Submitted with application · ${version} · Uploaded ${formatFullDate(doc.uploaded_at)}`,
      expiryLabel: doc.expiry_date ? `Expires ${formatFullDate(doc.expiry_date)}` : undefined,
    }];
  });
}

/**
 * Real activity_events for this Application only. Nothing generates these
 * rows yet (see supabase/migrations/20260922120305_audit_activity.sql), so
 * this is normally empty — and the UI shows that honestly rather than
 * synthesising history.
 */
async function getApplicationActivity(applicationId: string): Promise<ActivityItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activity_events")
    .select("id, verb, detail, occurred_at, actor:profiles!actor_profile_id(display_name)")
    .eq("entity_type", "application")
    .eq("entity_id", applicationId)
    .order("occurred_at", { ascending: true });

  if (error) {
    console.error("getApplicationActivity failed:", error);
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
 * Returns null when the id isn't a UUID (e.g. an old mock `capp-…` link
 * from the still-mock Activity/Notifications feeds), the row doesn't exist,
 * is archived, RLS denies it, or its Candidate/Job isn't visible.
 */
export async function getApplicationForDetail(id: string): Promise<ApplicationDetailData | null> {
  if (!UUID_PATTERN.test(id)) return null;

  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("applications")
    .select(`
      id, reference, status, source, submitted_at, read_at, owner_id, applicant_message,
      candidate:candidates!candidate_id(id, reference, full_name, email, phone, location),
      job:jobs!job_id(
        id, reference, title, location, employment_type, work_pattern, pay_type, pay_from, pay_to, workplace_type,
        employer:employers!employer_id(name)
      ),
      owner:profiles!owner_id(display_name)
    `)
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    console.error("getApplicationForDetail failed:", error);
    throw new Error("Could not load this application.");
  }
  if (!row) return null;

  const { candidate, job } = row;
  if (!candidate || !job) {
    console.warn("getApplicationForDetail: related candidate/job not visible for", row.id);
    return null;
  }

  const [notes, documents, activity] = await Promise.all([
    getApplicationNotes(row.id),
    getApplicationDocuments(row.id),
    getApplicationActivity(row.id),
  ]);

  const jobEnums = editorEnumFieldsFromDb(job);

  return {
    application: {
      id: row.id,
      reference: row.reference,
      candidateId: candidate.id,
      candidateName: candidate.full_name,
      jobId: job.id,
      jobReference: job.reference,
      jobTitle: job.title,
      client: job.employer?.name ?? "—",
      appliedAt: formatFullDate(row.submitted_at),
      owner: row.owner?.display_name ?? null,
      status: applicationStatusFromDb[row.status],
      unread: row.read_at === null,
    },
    ownerId: row.owner_id,
    submittedLabel: formatDateTime(row.submitted_at),
    source: row.source ?? "Not recorded",
    applicantMessage: row.applicant_message,
    candidate: {
      id: candidate.id,
      reference: candidate.reference,
      name: candidate.full_name,
      email: candidate.email ?? "",
      phone: candidate.phone ?? "",
      location: candidate.location ?? "",
    },
    vacancy: {
      jobId: job.id,
      jobLocation: job.location ?? "—",
      employmentType: jobEnums.employmentType || "Not specified",
      workPattern: job.work_pattern ? jobEnums.workPattern : "Not specified",
      pay: formatPayForDisplay(job.pay_type, job.pay_from, job.pay_to),
    },
    documents,
    notes,
    activity,
  };
}

// Postgres error codes surfaced by PostgREST for the failure modes we map.
const PG_FOREIGN_KEY_VIOLATION = "23503";
const PG_INSUFFICIENT_PRIVILEGE = "42501";

export async function updateApplicationStatusAndOwner(
  id: string,
  status: ApplicationStatus,
  ownerId: string | null,
): Promise<ApplicationMutationResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .update({ status: applicationStatusToDb[status], owner_id: ownerId })
    .eq("id", id)
    .is("archived_at", null)
    .select("id");

  if (error) {
    console.error("updateApplicationStatusAndOwner failed:", error);
    if (error.code === PG_FOREIGN_KEY_VIOLATION) {
      return { ok: false, error: "The selected recruiter could not be found." };
    }
    if (error.code === PG_INSUFFICIENT_PRIVILEGE) {
      return { ok: false, error: "You don't have permission to update this application." };
    }
    return { ok: false, error: "Could not save changes. Please try again." };
  }

  // RLS-filtered UPDATEs don't error — they just match zero rows. Treat
  // that as the denial (or a since-archived/deleted row) it really is,
  // rather than reporting a save that never happened.
  if (data.length === 0) {
    return {
      ok: false,
      error: "You don't have permission to update this application, or it no longer exists.",
    };
  }
  return { ok: true };
}

export async function addApplicationNote(
  applicationId: string,
  body: string,
  authorId: string,
  authorDisplayName: string,
): Promise<AddApplicationNoteResult> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Note text is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("application_notes")
    .insert({ application_id: applicationId, author_id: authorId, body: trimmed })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("addApplicationNote failed:", error);
    if (error.code === PG_INSUFFICIENT_PRIVILEGE) {
      return { ok: false, error: "You don't have permission to add notes." };
    }
    if (error.code === PG_FOREIGN_KEY_VIOLATION) {
      return { ok: false, error: "This application no longer exists." };
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
