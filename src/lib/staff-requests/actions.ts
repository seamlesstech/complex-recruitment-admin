"use server";

import { revalidatePath } from "next/cache";
import { requireActiveProfile } from "@/lib/auth/profile";
import { UUID_PATTERN } from "@/lib/format";
import { isStaffRequestStatus, isStaffRequestUrgency } from "./enums";
import { addStaffRequestNote, updateStaffRequestStatusOwnerUrgency } from "./queries";
import type { AddStaffRequestNoteResult, StaffRequestMutationResult } from "./types";

/**
 * Every mutating Staff Requests action re-verifies the caller via
 * requireActiveProfile() itself, same reasoning as the other domains'
 * actions.ts: Server Actions are independently-invokable endpoints. RLS is
 * still what actually authorizes the underlying insert/update.
 *
 * Arguments arrive from the browser, so status/urgency/owner are validated
 * at runtime here before they reach the database.
 */

export async function updateStaffRequestDetailAction(
  staffRequestId: string,
  status: unknown,
  ownerId: string | null,
  urgency: unknown,
): Promise<StaffRequestMutationResult> {
  await requireActiveProfile();

  if (!UUID_PATTERN.test(staffRequestId)) {
    return { ok: false, error: "This staff request could not be found." };
  }
  if (!isStaffRequestStatus(status)) {
    return { ok: false, error: "Please choose a valid request status." };
  }
  if (!isStaffRequestUrgency(urgency)) {
    return { ok: false, error: "Please choose a valid urgency." };
  }
  if (ownerId !== null && !UUID_PATTERN.test(ownerId)) {
    return { ok: false, error: "The selected recruiter could not be found." };
  }

  const result = await updateStaffRequestStatusOwnerUrgency(staffRequestId, status, ownerId, urgency);
  if (result.ok) {
    revalidatePath(`/staff-requests/${staffRequestId}`);
    revalidatePath("/staff-requests");
    revalidatePath("/");
  }
  return result;
}

export async function addStaffRequestNoteAction(
  staffRequestId: string,
  body: string,
): Promise<AddStaffRequestNoteResult> {
  const profile = await requireActiveProfile();

  if (!UUID_PATTERN.test(staffRequestId)) {
    return { ok: false, error: "This staff request could not be found." };
  }

  const result = await addStaffRequestNote(staffRequestId, body, profile.id, profile.displayName);
  if (result.ok) {
    revalidatePath(`/staff-requests/${staffRequestId}`);
  }
  return result;
}
