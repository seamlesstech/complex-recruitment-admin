import type { ActivityItem, NoteRecord } from "@/lib/mock/detail-shared";
import type { JobStatus, StaffRequest } from "@/lib/mock/types";

export type { OptionItem } from "@/lib/candidates/types";

/** The real employer_contacts row linked via staff_requests.employer_contact_id. */
export interface StaffRequestContact {
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
}

/** Staff Request fields beyond the list-row shape, already display-formatted. */
export interface StaffRequestRequirement {
  employmentType: string;
  workPattern: string;
  duration: string;
  pay: string;
  source: string;
}

/** A real Job whose jobs.staff_request_id points at this request. */
export interface RelatedJob {
  id: string;
  reference: string;
  title: string;
  status: JobStatus;
  applicationsCount: number;
}

export interface StaffRequestDetailData {
  /** List-row shape (reference, employer name, quantities, status, urgency, owner name). */
  request: StaffRequest;
  /** Raw owner profile id (null = Unassigned) for the editable rail. */
  ownerId: string | null;
  /** null when employer_contact_id is NULL — rendered as "not provided". */
  contact: StaffRequestContact | null;
  requirement: StaffRequestRequirement;
  relatedJobs: RelatedJob[];
  notes: NoteRecord[];
  activity: ActivityItem[];
}

export type StaffRequestMutationResult =
  | { ok: true }
  | { ok: false; error: string };

export type AddStaffRequestNoteResult =
  | { ok: true; note: NoteRecord }
  | { ok: false; error: string };
