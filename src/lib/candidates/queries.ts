import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { NoteRecord } from "@/lib/mock/detail-shared";
import type { Candidate, CandidateApplication } from "@/lib/mock/types";
import { applicationStatusFromDb } from "@/lib/applications/enums";
import { availabilityFromDb, availabilityToDb } from "./enums";
import type { CandidateDetailData, CreateCandidateResult } from "./types";

export { getOwnerOptions, getSectorOptions } from "@/lib/lookups/queries";

/**
 * Same reusable pattern established in src/lib/jobs/queries.ts:
 *   - "server-only", plain async functions, no repository framework.
 *   - Reads run under the caller's own session (RLS is the boundary).
 *   - Functions return/accept UI-vocabulary shapes (Candidate, NoteRecord);
 *     the DB-enum <-> UI-label conversion is fully contained in ./enums.
 *
 * getSectorOptions()/getOwnerOptions() now live in lib/lookups/queries.ts
 * (extracted when Applications became the third domain needing them) and
 * are re-exported above so existing import sites are unchanged.
 */

function formatLastActivity(iso: string | null): string {
  if (!iso) return "No activity yet";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  const datePart = date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${datePart} · ${timePart}`;
}

function formatFullDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

const CANDIDATES_LIST_SELECT = `
  id,
  reference,
  full_name,
  email,
  phone,
  location,
  availability,
  last_activity_at,
  registered_at,
  registration_source,
  owner_id,
  sector:sectors!primary_sector_id(name),
  owner:profiles!owner_id(display_name),
  applications(count)
` as const;

type CandidateListRow = {
  id: string;
  reference: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  availability: Database["public"]["Enums"]["candidate_availability"];
  last_activity_at: string | null;
  registered_at: string;
  registration_source: string | null;
  owner_id: string | null;
  sector: { name: string } | null;
  owner: { display_name: string } | null;
  applications: { count: number }[] | null;
};

function mapListRowToCandidate(row: CandidateListRow): Candidate {
  return {
    id: row.id,
    reference: row.reference,
    name: row.full_name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    location: row.location ?? "",
    sector: row.sector?.name ?? "—",
    owner: row.owner?.display_name ?? null,
    availability: availabilityFromDb[row.availability],
    applicationCount: row.applications?.[0]?.count ?? 0,
    lastActivityAt: formatLastActivity(row.last_activity_at),
    registeredAt: row.registered_at,
    source: row.registration_source ?? "Not recorded",
  };
}

/**
 * Non-archived candidates, newest-registered first, with sector/owner names
 * already resolved and a live application count — never a stored count,
 * never a raw UUID. archived_at is filtered explicitly here (not left to
 * RLS alone) for the same reason as Jobs: admin-tier roles can SELECT
 * archived rows under RLS for other purposes, but the operational list
 * must never show them regardless of role.
 */
export async function getCandidates(): Promise<Candidate[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATES_LIST_SELECT)
    .is("archived_at", null)
    .order("registered_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("getCandidates failed:", error);
    throw new Error("Could not load candidates.");
  }

  return (data as unknown as CandidateListRow[]).map(mapListRowToCandidate);
}

/** Cheap count-only query for the Dashboard's "Registered candidates" metric. */
export async function getCandidateCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("candidates")
    .select("id", { count: "exact", head: true })
    .is("archived_at", null);

  if (error) {
    console.error("getCandidateCount failed:", error);
    throw new Error("Could not load candidate count.");
  }
  return count ?? 0;
}

type ApplicationHistoryRow = {
  id: string;
  reference: string;
  status: Database["public"]["Enums"]["application_status"];
  submitted_at: string;
  read_at: string | null;
  job: { id: string; reference: string; title: string; employer: { name: string } | null } | null;
  owner: { display_name: string } | null;
};

async function getApplicationHistory(
  candidateId: string,
  candidateName: string,
): Promise<CandidateApplication[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(`
      id, reference, status, submitted_at, read_at,
      job:jobs!job_id(id, reference, title, employer:employers!employer_id(name)),
      owner:profiles!owner_id(display_name)
    `)
    .eq("candidate_id", candidateId)
    .is("archived_at", null)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("getApplicationHistory failed:", error);
    throw new Error("Could not load application history.");
  }

  return (data as unknown as ApplicationHistoryRow[])
    .filter((row) => row.job !== null)
    .map((row) => ({
      id: row.id,
      reference: row.reference,
      candidateId,
      candidateName,
      jobId: row.job!.id,
      jobReference: row.job!.reference,
      jobTitle: row.job!.title,
      client: row.job!.employer?.name ?? "—",
      appliedAt: formatFullDate(row.submitted_at),
      owner: row.owner?.display_name ?? null,
      status: applicationStatusFromDb[row.status],
      unread: row.read_at === null,
    }));
}

type NoteRow = {
  id: string;
  body: string;
  created_at: string;
  author: { display_name: string } | null;
};

async function getCandidateNotes(candidateId: string): Promise<NoteRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidate_notes")
    .select("id, body, created_at, author:profiles!author_id(display_name)")
    .eq("candidate_id", candidateId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getCandidateNotes failed:", error);
    throw new Error("Could not load notes.");
  }

  return (data as unknown as NoteRow[]).map((row) => ({
    id: row.id,
    author: row.author?.display_name ?? "Unknown",
    timestamp: formatLastActivity(row.created_at),
    text: row.body,
  }));
}

type DocumentRow = {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
  expiry_date: string | null;
  is_current: boolean;
  document_type: { name: string } | null;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

async function getCandidateDocuments(candidateId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidate_documents")
    .select(`
      id, original_filename, mime_type, size_bytes, uploaded_at, expiry_date, is_current,
      document_type:document_types!document_type_id(name)
    `)
    .eq("candidate_id", candidateId)
    .is("archived_at", null)
    .order("uploaded_at", { ascending: false });

  if (error) {
    console.error("getCandidateDocuments failed:", error);
    throw new Error("Could not load documents.");
  }

  return (data as unknown as DocumentRow[]).map((row) => {
    const fileType = row.mime_type.split("/")[1]?.toUpperCase() ?? row.mime_type;
    const context = `${row.is_current ? "Current" : "Superseded"} · Uploaded ${formatFullDate(row.uploaded_at)}`;
    return {
      id: row.id,
      label: row.document_type?.name ?? "Document",
      fileName: row.original_filename,
      fileType,
      fileSize: formatFileSize(row.size_bytes),
      context,
      expiryLabel: row.expiry_date ? `Expires ${formatFullDate(row.expiry_date)}` : undefined,
    };
  });
}

/** Returns null when the row doesn't exist, was archived, or RLS denies it. */
export async function getCandidateForDetail(id: string): Promise<CandidateDetailData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("candidates")
    .select(CANDIDATES_LIST_SELECT)
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    console.error("getCandidateForDetail failed:", error);
    throw new Error("Could not load this candidate.");
  }
  if (!data) return null;

  const row = data as unknown as CandidateListRow;
  const candidate = mapListRowToCandidate(row);

  const [applications, notes, documents] = await Promise.all([
    getApplicationHistory(candidate.id, candidate.name),
    getCandidateNotes(candidate.id),
    getCandidateDocuments(candidate.id),
  ]);

  // A minimal, honest activity feed derived only from real fields already
  // fetched here — not the system-wide audit_events/activity_events tables,
  // which aren't generated by any application code path yet (deliberately
  // deferred, see supabase/migrations/20260922120305_audit_activity.sql).
  const activity = [
    {
      id: `${candidate.id}-registered`,
      description: "Candidate registered with Complex Recruitment",
      timestamp: formatFullDate(candidate.registeredAt),
    },
    ...notes.map((note) => ({
      id: `${note.id}-activity`,
      description: `${note.author} added an internal note`,
      timestamp: note.timestamp,
    })),
  ];

  return {
    candidate,
    ownerId: row.owner_id,
    registeredLabel: formatFullDate(candidate.registeredAt),
    applications,
    documents,
    notes,
    activity,
  };
}

export async function updateCandidateAvailabilityAndOwner(
  id: string,
  availabilityUi: Candidate["availability"],
  ownerId: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("candidates")
    .update({
      availability: availabilityToDb[availabilityUi],
      owner_id: ownerId,
    })
    .eq("id", id);

  if (error) {
    console.error("updateCandidateAvailabilityAndOwner failed:", error);
    return { ok: false, error: "Could not save changes. Please try again." };
  }
  return { ok: true };
}

export async function addCandidateNote(
  candidateId: string,
  body: string,
  authorId: string,
  authorDisplayName: string,
): Promise<{ ok: true; note: NoteRecord } | { ok: false; error: string }> {
  const trimmed = body.trim();
  if (!trimmed) {
    return { ok: false, error: "Note text is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("candidate_notes")
    .insert({ candidate_id: candidateId, author_id: authorId, body: trimmed })
    .select("id, created_at")
    .single();

  if (error) {
    console.error("addCandidateNote failed:", error);
    return { ok: false, error: "Could not save the note. Please try again." };
  }

  return {
    ok: true,
    note: {
      id: data.id,
      author: authorDisplayName,
      timestamp: formatLastActivity(data.created_at),
      text: trimmed,
    },
  };
}

export interface CreateCandidateInput {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  sectorId: string;
  ownerId: string;
  availability: Candidate["availability"];
}

/**
 * The minimal, least-intrusive Candidate creation path this task needs for
 * real E2E testing — there is no approved Add Candidate editor yet. The
 * public registration/application workflow (via submit_public_application,
 * already implemented in the database) will be the real creation path once
 * the public website and Applications are wired up.
 *
 * Unlike jobs/employers, `candidates` has no `created_by` column in the
 * approved schema (a candidate isn't "authored" by staff the way an
 * internal record is) — so, unlike createJob(), this takes no caller-id
 * parameter; the Server Action wrapper still re-verifies the caller via
 * requireActiveProfile() before calling this.
 */
export async function createCandidate(
  input: CreateCandidateInput,
): Promise<CreateCandidateResult> {
  const fullName = input.fullName.trim();
  if (!fullName) {
    return { ok: false, error: "Full name is required." };
  }

  const supabase = await createClient();
  const row = {
    full_name: fullName,
    email: input.email.trim() || null,
    phone: input.phone.trim() || null,
    location: input.location.trim() || null,
    primary_sector_id: input.sectorId || null,
    owner_id: input.ownerId || null,
    availability: availabilityToDb[input.availability],
    registration_source: "Complex Admin (internal)",
  } as Database["public"]["Tables"]["candidates"]["Insert"];

  const { data, error } = await supabase
    .from("candidates")
    .insert(row)
    .select("id, reference")
    .single();

  if (error) {
    console.error("createCandidate failed:", error);
    if (error.code === "23505") {
      return { ok: false, error: "A candidate with this email already exists." };
    }
    return { ok: false, error: "Could not create the candidate. Please try again." };
  }

  return { ok: true, id: data.id, reference: data.reference };
}
