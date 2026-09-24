import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type { JobDraft } from "@/lib/mock/job-editor";
import type { Job, JobStatus } from "@/lib/mock/types";
import {
  closingDateFromDb,
  closingDateToDb,
  editorEnumFieldsFromDb,
  employmentTypeToDb,
  formatPayValueForEditor,
  jobStatusFromDb,
  jobStatusToDb,
  parsePayValue,
  payTypeToDb,
  workPatternToDb,
  workplaceTypeToDb,
} from "./enums";
import type {
  CloseJobResult,
  CreateEmployerResult,
  JobEditorData,
  JobEditorResult,
  OptionItem,
} from "./types";

export { getOwnerOptions, getSectorOptions } from "@/lib/lookups/queries";

/**
 * The reusable Supabase operational-data pattern this module establishes
 * (to be repeated for Candidates, Applications, Staff Requests, Enquiries):
 *   - "server-only" module, plain async functions — no repository framework.
 *   - Reads run under the caller's own session via createClient() (RLS is
 *     the authorization boundary; no service-role key anywhere here).
 *   - Every function returns/accepts data already in the UI's vocabulary
 *     (Job, JobDraft, JobStatus) — the DB-enum <-> UI-label conversion is
 *     fully contained in ./enums, so components never see a raw DB row.
 *   - Writes are exposed here as plain functions too; only actions.ts
 *     ("use server") wraps them for Client Component consumption.
 */

const JOBS_LIST_SELECT = `
  id,
  reference,
  title,
  location,
  status,
  closing_date,
  created_at,
  employer:employers!employer_id(name),
  sector:sectors!sector_id(name),
  owner:profiles!owner_id(display_name),
  applications(count)
` as const;

type JobListRow = {
  id: string;
  reference: string;
  title: string;
  location: string | null;
  status: Database["public"]["Enums"]["job_status"];
  closing_date: string | null;
  created_at: string;
  employer: { name: string } | null;
  sector: { name: string } | null;
  owner: { display_name: string } | null;
  applications: { count: number }[] | null;
};

const CLOSING_SOON_WINDOW_DAYS = 7;

function isClosingSoon(closingDateIso: string | null): boolean {
  if (!closingDateIso) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const closing = new Date(`${closingDateIso}T00:00:00`);
  const daysUntil = Math.round((closing.getTime() - today.getTime()) / 86_400_000);
  return daysUntil >= 0 && daysUntil <= CLOSING_SOON_WINDOW_DAYS;
}

function formatClosingDateDisplay(closingDateIso: string | null): string | null {
  if (!closingDateIso) return null;
  const date = new Date(`${closingDateIso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function mapListRowToJob(row: JobListRow): Job {
  return {
    id: row.id,
    reference: row.reference,
    title: row.title,
    client: row.employer?.name ?? "—",
    sector: row.sector?.name ?? "—",
    location: row.location ?? "",
    owner: row.owner?.display_name ?? null,
    applicationsCount: row.applications?.[0]?.count ?? 0,
    status: jobStatusFromDb[row.status],
    closingDate: formatClosingDateDisplay(row.closing_date),
    closingSoon: row.status === "open" && isClosingSoon(row.closing_date),
    createdAt: row.created_at,
  };
}

/**
 * Non-archived jobs, newest first, with related sector/employer/owner names
 * already resolved and the live application count attached — never raw
 * UUIDs, never a stored applications_count column. archived_at is filtered
 * explicitly here (not left to RLS alone) because admin-tier roles are
 * allowed to SELECT archived rows under RLS for other purposes; the
 * operational Jobs list must never show them regardless of role.
 *
 * Filtering/search on this list happens client-side over this full result
 * set (see (admin)/jobs/page.tsx) — an accepted MVP trade-off while job
 * volume is small; move to server-side filtering when scale warrants it.
 */
export async function getJobs(): Promise<Job[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(JOBS_LIST_SELECT)
    .is("archived_at", null)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  if (error) {
    console.error("getJobs failed:", error);
    throw new Error("Could not load jobs.");
  }

  return (data as unknown as JobListRow[]).map(mapListRowToJob);
}

function localIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Dashboard Jobs summary: the count of non-archived Open jobs, plus the Open
 * jobs whose closing date falls within the same CLOSING_SOON_WINDOW_DAYS
 * window the Jobs list uses for its "closing soon" signal.
 */
export async function getOpenJobsSummary(): Promise<{
  openCount: number;
  closingSoon: { id: string; title: string; employer: string }[];
}> {
  const supabase = await createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate() + CLOSING_SOON_WINDOW_DAYS);

  const [openResult, closingResult] = await Promise.all([
    supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "open")
      .is("archived_at", null),
    supabase
      .from("jobs")
      .select("id, title, employer:employers!employer_id(name)")
      .eq("status", "open")
      .is("archived_at", null)
      .gte("closing_date", localIsoDate(today))
      .lte("closing_date", localIsoDate(windowEnd))
      .order("closing_date", { ascending: true }),
  ]);

  const error = openResult.error ?? closingResult.error;
  if (error) {
    console.error("getOpenJobsSummary failed:", error);
    throw new Error("Could not load job counts.");
  }

  return {
    openCount: openResult.count ?? 0,
    closingSoon: (closingResult.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      employer: row.employer?.name ?? "—",
    })),
  };
}

export async function getEmployerOptions(): Promise<OptionItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employers")
    .select("id, name")
    .is("archived_at", null)
    .order("name");

  if (error) {
    console.error("getEmployerOptions failed:", error);
    throw new Error("Could not load employers.");
  }
  return data;
}

type JobEditRow = {
  id: string;
  reference: string;
  title: string;
  employer_id: string;
  sector_id: string | null;
  location: string | null;
  workplace_type: Database["public"]["Enums"]["workplace_type"];
  vacancies_count: number;
  employment_type: Database["public"]["Enums"]["employment_type"] | null;
  work_pattern: Database["public"]["Enums"]["work_pattern"] | null;
  pay_type: Database["public"]["Enums"]["pay_type"] | null;
  pay_from: number | null;
  pay_to: number | null;
  summary: string | null;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  application_instructions: string | null;
  closing_date: string | null;
  status: Database["public"]["Enums"]["job_status"];
  publish_on_website: boolean;
  owner_id: string | null;
  created_by_profile: { display_name: string } | null;
};

/** Returns null when the row doesn't exist, was archived, or RLS denies it. */
export async function getJobForEditor(id: string): Promise<JobEditorData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .select(`
      id, reference, title, employer_id, sector_id, location, workplace_type,
      vacancies_count, employment_type, work_pattern, pay_type, pay_from, pay_to,
      summary, description, responsibilities, requirements, benefits,
      application_instructions, closing_date, status, publish_on_website, owner_id,
      created_by_profile:profiles!created_by(display_name)
    `)
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();

  if (error) {
    console.error("getJobForEditor failed:", error);
    throw new Error("Could not load this job.");
  }
  if (!data) return null;

  const row = data as unknown as JobEditRow;
  const enumFields = editorEnumFieldsFromDb(row);

  const draft: JobDraft = {
    title: row.title,
    sector: row.sector_id ?? "",
    client: row.employer_id,
    reference: row.reference,
    location: row.location ?? "",
    workplaceType: enumFields.workplaceType,
    vacancies: row.vacancies_count,
    employmentType: enumFields.employmentType,
    workPattern: enumFields.workPattern,
    payType: enumFields.payType,
    payFrom: formatPayValueForEditor(row.pay_from),
    payTo: formatPayValueForEditor(row.pay_to),
    summary: row.summary ?? "",
    description: row.description ?? "",
    responsibilities: row.responsibilities ?? "",
    requirements: row.requirements ?? "",
    benefits: row.benefits ?? "",
    closingDate: closingDateFromDb(row.closing_date),
    applicationInstructions: row.application_instructions ?? "",
    owner: row.owner_id ?? "",
    publishOnWebsite: row.publish_on_website,
  };

  const { count: applicationsCount, error: countError } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("job_id", id);

  if (countError) {
    console.error("getJobForEditor application count failed:", countError);
    throw new Error("Could not load this job.");
  }

  return {
    draft,
    status: jobStatusFromDb[row.status],
    applicationsCount: applicationsCount ?? 0,
    createdBy: row.created_by_profile?.display_name ?? "Unknown",
  };
}

function draftToJobsRow(
  draft: JobDraft,
  status: JobStatus,
): Omit<Database["public"]["Tables"]["jobs"]["Insert"], "reference" | "created_by"> {
  return {
    title: draft.title.trim(),
    employer_id: draft.client,
    sector_id: draft.sector || null,
    location: draft.location.trim() || null,
    workplace_type: workplaceTypeToDb[draft.workplaceType],
    vacancies_count: draft.vacancies,
    employment_type: draft.employmentType ? employmentTypeToDb[draft.employmentType] : null,
    work_pattern: workPatternToDb[draft.workPattern],
    pay_type: payTypeToDb[draft.payType],
    pay_from: parsePayValue(draft.payFrom),
    pay_to: parsePayValue(draft.payTo),
    summary: draft.summary.trim() || null,
    description: draft.description.trim() || null,
    responsibilities: draft.responsibilities.trim() || null,
    requirements: draft.requirements.trim() || null,
    benefits: draft.benefits.trim() || null,
    application_instructions: draft.applicationInstructions.trim() || null,
    closing_date: closingDateToDb(draft.closingDate),
    status: jobStatusToDb[status],
    publish_on_website: draft.publishOnWebsite,
    owner_id: draft.owner || null,
  };
}

/**
 * created_by is set here, server-side, from the authenticated caller's own
 * profile id — never trusted from the client. `reference` is never supplied;
 * the jobs_set_reference trigger (Postgres) is the only source of JOB-xxxx
 * references. The generated Insert type marks `reference` as required
 * because it doesn't know about that trigger — the cast below is the
 * documented escape hatch for that one known, deliberate mismatch.
 */
export async function createJob(
  draft: JobDraft,
  status: JobStatus,
  createdByProfileId: string,
): Promise<JobEditorResult> {
  const supabase = await createClient();

  const row = {
    ...draftToJobsRow(draft, status),
    created_by: createdByProfileId,
  } as Database["public"]["Tables"]["jobs"]["Insert"];

  const { data, error } = await supabase
    .from("jobs")
    .insert(row)
    .select("id, reference")
    .single();

  if (error) {
    console.error("createJob failed:", error);
    return { ok: false, error: "Could not create the job. Please try again." };
  }

  return { ok: true, id: data.id, reference: data.reference };
}

export async function updateJob(
  id: string,
  draft: JobDraft,
  status: JobStatus,
): Promise<JobEditorResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .update(draftToJobsRow(draft, status))
    .eq("id", id)
    .select("id, reference")
    .single();

  if (error) {
    console.error("updateJob failed:", error);
    return { ok: false, error: "Could not save changes. Please try again." };
  }

  return { ok: true, id: data.id, reference: data.reference };
}

/**
 * The single canonical close-job operation — the Jobs list three-dot menu
 * and the Job Detail "Close job" CTA both call this via closeJobAction, so
 * there is exactly one code path that can transition a job to Closed.
 *
 * publish_on_website is cleared at the same time: status = 'open' is
 * already required for a job to appear in public_jobs, so this isn't what
 * removes it from the site, but leaving the flag on would silently
 * re-publish the job the moment anyone re-opened it in future without
 * noticing. Clearing it here makes re-publication an explicit decision.
 *
 * Only a job that is genuinely still Open can be closed — the update's
 * `.eq("status", "open")` guards against a stale client racing a second
 * close (or closing an already-Closed/Draft job) into a false "success".
 */
export async function closeJob(id: string): Promise<CloseJobResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("jobs")
    .update({ status: "closed", publish_on_website: false })
    .eq("id", id)
    .eq("status", "open")
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("closeJob failed:", error);
    return { ok: false, error: "Could not close this job. Please try again." };
  }

  if (!data) {
    return { ok: false, error: "This job is no longer open, so it can't be closed." };
  }

  return { ok: true };
}

export async function createEmployer(
  name: string,
  location: string,
  createdByProfileId: string,
): Promise<CreateEmployerResult> {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return { ok: false, error: "Employer name is required." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employers")
    .insert({
      name: trimmedName,
      location: location.trim() || null,
      created_by: createdByProfileId,
    })
    .select("id, name")
    .single();

  if (error) {
    console.error("createEmployer failed:", error);
    return { ok: false, error: "Could not create the employer. Please try again." };
  }

  return { ok: true, employer: data };
}
