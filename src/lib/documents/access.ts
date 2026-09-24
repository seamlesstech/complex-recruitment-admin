import "server-only";
import { resolveCurrentProfile } from "@/lib/auth/profile";
import type { ProfileRole } from "@/lib/auth/roles";
import { UUID_PATTERN } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

/**
 * On-demand, short-lived access to a private candidate document.
 *
 * The browser only ever supplies a candidate_documents id — never a Storage
 * path — and nothing here is persisted: each request mints a fresh signed URL
 * that expires after SIGNED_URL_TTL_SECONDS.
 *
 * Authorization is layered, and every layer must agree:
 *   1. an active profile (Data Access Layer, same as every admin screen);
 *   2. a document-capable role — Viewer is denied, matching the RLS matrix;
 *   3. the metadata row is read with the caller's own session, so
 *      candidate_documents RLS must return it;
 *   4. the stored object path must be exactly candidates/{candidate_id}/{id};
 *   5. the URL is signed with the caller's session, so the Storage policy on
 *      the private bucket is enforced again by Supabase itself.
 */

export const SIGNED_URL_TTL_SECONDS = 120;

export type DocumentAccessMode = "view" | "download";

const DOCUMENT_ROLES: ReadonlySet<ProfileRole> = new Set([
  "super_admin",
  "admin_manager",
  "recruiter",
]);

/** Only PDFs are previewed in the browser; Word files are always downloaded. */
export function isPreviewableMime(mimeType: string): boolean {
  return mimeType === "application/pdf";
}

export type DocumentAccessResult =
  | { ok: true; url: string }
  | { ok: false; status: 401 | 403 | 404 | 500 };

export async function createDocumentAccessUrl(
  documentId: string,
  mode: DocumentAccessMode,
): Promise<DocumentAccessResult> {
  const resolution = await resolveCurrentProfile();
  if (resolution.kind !== "active") return { ok: false, status: 401 };
  if (!DOCUMENT_ROLES.has(resolution.profile.role)) return { ok: false, status: 403 };
  if (!UUID_PATTERN.test(documentId)) return { ok: false, status: 404 };

  const supabase = await createClient();

  const { data: doc, error } = await supabase
    .from("candidate_documents")
    .select("id, candidate_id, object_path, original_filename, mime_type")
    .eq("id", documentId)
    .maybeSingle();

  if (error) {
    console.error("createDocumentAccessUrl: metadata lookup failed:", error.code);
    return { ok: false, status: 500 };
  }
  // Missing, or hidden by RLS — indistinguishable to the caller on purpose.
  if (!doc) return { ok: false, status: 404 };

  if (doc.object_path !== `candidates/${doc.candidate_id}/${doc.id}`) {
    console.error("createDocumentAccessUrl: unexpected object path for document", doc.id);
    return { ok: false, status: 404 };
  }

  const inline = mode === "view" && isPreviewableMime(doc.mime_type);
  const { data: signed, error: signError } = await supabase.storage
    .from("candidate-documents")
    .createSignedUrl(
      doc.object_path,
      SIGNED_URL_TTL_SECONDS,
      inline ? undefined : { download: doc.original_filename },
    );

  if (signError || !signed?.signedUrl) {
    // Includes the Storage policy denying this session.
    console.error("createDocumentAccessUrl: signing failed for document", doc.id);
    return { ok: false, status: 404 };
  }

  return { ok: true, url: signed.signedUrl };
}
