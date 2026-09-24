"use server";

import { revalidatePath } from "next/cache";
import { requireActiveProfile } from "@/lib/auth/profile";
import type { JobDraft } from "@/lib/mock/job-editor";
import type { JobStatus } from "@/lib/mock/types";
import { closeJob, createEmployer, createJob, updateJob } from "./queries";
import type { CloseJobResult, CreateEmployerResult, JobEditorResult } from "./types";

/**
 * Every mutating Jobs action re-verifies the caller via requireActiveProfile()
 * itself — Server Actions are independently-invokable HTTP endpoints, so the
 * (admin) layout's render-time check does not cover them (see Next.js's own
 * authentication guidance: treat Server Actions like public endpoints).
 * Beyond that, RLS is still what actually authorizes the underlying insert/
 * update — this call only established who is asking, not what they may do.
 */

export async function createJobAction(
  draft: JobDraft,
  status: JobStatus,
): Promise<JobEditorResult> {
  const profile = await requireActiveProfile();
  const result = await createJob(draft, status, profile.id);
  if (result.ok) {
    revalidatePath("/jobs");
  }
  return result;
}

export async function updateJobAction(
  id: string,
  draft: JobDraft,
  status: JobStatus,
): Promise<JobEditorResult> {
  await requireActiveProfile();
  const result = await updateJob(id, draft, status);
  if (result.ok) {
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}/edit`);
  }
  return result;
}

/**
 * The one canonical close-job Server Action — called from both the Jobs
 * list three-dot menu and the Job Detail "Close job" CTA. Authorization is
 * requireActiveProfile() plus jobs_update RLS (admin tier, or the
 * recruiter who owns/has no owner on the job); this action does not widen
 * that in any way.
 */
export async function closeJobAction(id: string): Promise<CloseJobResult> {
  await requireActiveProfile();
  const result = await closeJob(id);
  if (result.ok) {
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${id}/edit`);
  }
  return result;
}

export async function createEmployerAction(
  name: string,
  location: string,
): Promise<CreateEmployerResult> {
  const profile = await requireActiveProfile();
  return createEmployer(name, location, profile.id);
}
