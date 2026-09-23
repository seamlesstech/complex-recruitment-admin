import type { ActivityItem, DocumentRecord, NoteRecord } from "@/lib/mock/detail-shared";
import type { Candidate, CandidateApplication } from "@/lib/mock/types";

/** id + display label — the only shape the toolbar/editor <select>s need. */
export interface OptionItem {
  id: string;
  name: string;
}

export interface CandidateDetailData {
  candidate: Candidate;
  /** The raw owner profile id (null = Unassigned) — `candidate.owner` only
   * carries the resolved display name, but the editable sidebar select
   * needs the real id to persist a change. */
  ownerId: string | null;
  registeredLabel: string;
  applications: CandidateApplication[];
  documents: DocumentRecord[];
  notes: NoteRecord[];
  activity: ActivityItem[];
}

export type CandidateMutationResult =
  | { ok: true }
  | { ok: false; error: string };

export type CreateCandidateResult =
  | { ok: true; id: string; reference: string }
  | { ok: false; error: string };

export type AddNoteResult =
  | { ok: true; note: NoteRecord }
  | { ok: false; error: string };
