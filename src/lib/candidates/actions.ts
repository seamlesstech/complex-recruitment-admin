"use server";

import { revalidatePath } from "next/cache";
import { requireActiveProfile } from "@/lib/auth/profile";
import type { Candidate } from "@/lib/mock/types";
import {
  addCandidateNote,
  createCandidate,
  type CreateCandidateInput,
  updateCandidateAvailabilityAndOwner,
} from "./queries";
import type { AddNoteResult, CandidateMutationResult, CreateCandidateResult } from "./types";

/**
 * Every mutating Candidates action re-verifies the caller via
 * requireActiveProfile() itself, same reasoning as jobs/actions.ts: Server
 * Actions are independently-invokable endpoints, not covered by the (admin)
 * layout's render-time check. RLS is still what actually authorizes the
 * underlying insert/update.
 */

export async function updateCandidateDetailAction(
  candidateId: string,
  availability: Candidate["availability"],
  ownerId: string | null,
): Promise<CandidateMutationResult> {
  await requireActiveProfile();
  const result = await updateCandidateAvailabilityAndOwner(candidateId, availability, ownerId);
  if (result.ok) {
    revalidatePath(`/candidates/${candidateId}`);
    revalidatePath("/candidates");
  }
  return result;
}

export async function addCandidateNoteAction(
  candidateId: string,
  body: string,
): Promise<AddNoteResult> {
  const profile = await requireActiveProfile();
  const result = await addCandidateNote(candidateId, body, profile.id, profile.displayName);
  if (result.ok) {
    revalidatePath(`/candidates/${candidateId}`);
  }
  return result;
}

export async function createCandidateAction(
  input: CreateCandidateInput,
): Promise<CreateCandidateResult> {
  await requireActiveProfile();
  const result = await createCandidate(input);
  if (result.ok) {
    revalidatePath("/candidates");
  }
  return result;
}
