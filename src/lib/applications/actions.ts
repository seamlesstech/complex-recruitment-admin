"use server";

import { revalidatePath } from "next/cache";
import { requireActiveProfile } from "@/lib/auth/profile";
import { isApplicationStatus } from "./enums";
import { addApplicationNote, updateApplicationStatusAndOwner } from "./queries";
import type { AddApplicationNoteResult, ApplicationMutationResult } from "./types";

/**
 * Every mutating Applications action re-verifies the caller via
 * requireActiveProfile() itself, same reasoning as jobs/actions.ts and
 * candidates/actions.ts: Server Actions are independently-invokable
 * endpoints, not covered by the (admin) layout's render-time check. RLS is
 * still what actually authorizes the underlying insert/update.
 *
 * Arguments arrive from the browser, so status/owner are validated here
 * before they reach the database — TypeScript types are not a runtime check.
 */

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateApplicationDetailAction(
  applicationId: string,
  status: unknown,
  ownerId: string | null,
): Promise<ApplicationMutationResult> {
  await requireActiveProfile();

  if (!UUID_PATTERN.test(applicationId)) {
    return { ok: false, error: "This application could not be found." };
  }
  if (!isApplicationStatus(status)) {
    return { ok: false, error: "Please choose a valid application status." };
  }
  if (ownerId !== null && !UUID_PATTERN.test(ownerId)) {
    return { ok: false, error: "The selected recruiter could not be found." };
  }

  const result = await updateApplicationStatusAndOwner(applicationId, status, ownerId);
  if (result.ok) {
    // Status/owner surface on every screen that reads applications live.
    revalidatePath(`/applications/${applicationId}`);
    revalidatePath("/applications");
    revalidatePath("/candidates", "layout");
    revalidatePath("/");
  }
  return result;
}

export async function addApplicationNoteAction(
  applicationId: string,
  body: string,
): Promise<AddApplicationNoteResult> {
  const profile = await requireActiveProfile();

  if (!UUID_PATTERN.test(applicationId)) {
    return { ok: false, error: "This application could not be found." };
  }

  const result = await addApplicationNote(applicationId, body, profile.id, profile.displayName);
  if (result.ok) {
    revalidatePath(`/applications/${applicationId}`);
  }
  return result;
}
