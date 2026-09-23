import type { ActivityItem, DocumentRecord, NoteRecord } from "@/lib/mock/detail-shared";
import type { Application, CandidateApplication } from "@/lib/mock/types";

export type { OptionItem } from "@/lib/candidates/types";

/** The related real Candidate, resolved through applications.candidate_id. */
export interface ApplicationCandidate {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}

/** The related real Job (+ Employer), resolved through applications.job_id. */
export interface ApplicationVacancy {
  jobId: string;
  jobLocation: string;
  employmentType: string;
  workPattern: string;
  pay: string;
}

export interface ApplicationDetailData {
  /** List-row shape (reference, names, status, owner name, unread). */
  application: CandidateApplication;
  /** Raw owner profile id (null = Unassigned) — the editable rail needs the
   * real id to persist a change; `application.owner` is only the name. */
  ownerId: string | null;
  /** Date + time of submission, for the page header. */
  submittedLabel: string;
  source: string;
  candidate: ApplicationCandidate;
  vacancy: ApplicationVacancy;
  documents: DocumentRecord[];
  notes: NoteRecord[];
  activity: ActivityItem[];
}

export interface ApplicationJobOption {
  id: string;
  label: string;
}

/** Dashboard "Recent applications" rows reuse the existing panel's shape. */
export type RecentApplication = Application;

export type ApplicationMutationResult =
  | { ok: true }
  | { ok: false; error: string };

export type AddApplicationNoteResult =
  | { ok: true; note: NoteRecord }
  | { ok: false; error: string };
