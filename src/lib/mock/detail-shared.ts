/**
 * Shapes shared by every "detail" screen (Application Detail,
 * Candidate Detail, …) — documents, internal notes and activity are the
 * same kind of record regardless of which entity they're attached to.
 */

export interface DocumentRecord {
  id: string;
  label: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  context: string;
  /** Display-only, e.g. "Expires 12 Mar 2027" — relevant for licences etc. */
  expiryLabel?: string;
  /**
   * candidate_documents.id of the exact stored version, used to request a
   * short-lived signed URL from /api/documents/{id}. Never a Storage path.
   */
  documentId?: string;
  /** True for PDFs, which can be viewed in the browser; others download. */
  previewable?: boolean;
}

export interface NoteRecord {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
}
