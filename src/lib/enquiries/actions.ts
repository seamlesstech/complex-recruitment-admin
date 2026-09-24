"use server";

import { revalidatePath } from "next/cache";
import { requireActiveProfile } from "@/lib/auth/profile";
import { UUID_PATTERN } from "@/lib/format";
import { isEnquiryStatus } from "./enums";
import { addEnquiryNote, updateEnquiryStatusAndOwner } from "./queries";
import type { AddEnquiryNoteResult, EnquiryMutationResult } from "./types";

/**
 * Every mutating Enquiries action re-verifies the caller via
 * requireActiveProfile() itself, same reasoning as the other domains'
 * actions.ts: Server Actions are independently-invokable endpoints. RLS is
 * still what actually authorizes the underlying insert/update.
 *
 * There is deliberately no conversion action here: conversion is the
 * database's convert_enquiry() function, and no approved conversion UI
 * exists yet.
 */

export async function updateEnquiryDetailAction(
  enquiryId: string,
  status: unknown,
  ownerId: string | null,
): Promise<EnquiryMutationResult> {
  await requireActiveProfile();

  if (!UUID_PATTERN.test(enquiryId)) {
    return { ok: false, error: "This enquiry could not be found." };
  }
  if (!isEnquiryStatus(status)) {
    return { ok: false, error: "Please choose a valid enquiry status." };
  }
  if (ownerId !== null && !UUID_PATTERN.test(ownerId)) {
    return { ok: false, error: "The selected owner could not be found." };
  }

  const result = await updateEnquiryStatusAndOwner(enquiryId, status, ownerId);
  if (result.ok) {
    revalidatePath(`/enquiries/${enquiryId}`);
    revalidatePath("/enquiries");
    revalidatePath("/team");
    revalidatePath("/");
  }
  return result;
}

export async function addEnquiryNoteAction(
  enquiryId: string,
  body: string,
): Promise<AddEnquiryNoteResult> {
  const profile = await requireActiveProfile();

  if (!UUID_PATTERN.test(enquiryId)) {
    return { ok: false, error: "This enquiry could not be found." };
  }

  const result = await addEnquiryNote(enquiryId, body, profile.id, profile.displayName);
  if (result.ok) {
    revalidatePath(`/enquiries/${enquiryId}`);
  }
  return result;
}
