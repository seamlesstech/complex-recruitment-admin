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
