import type { ActivityItem, NoteRecord } from "@/lib/mock/detail-shared";
import type {
  CandidateAvailability,
  Enquiry,
  StaffRequestStatus,
} from "@/lib/mock/types";

export type { OptionItem } from "@/lib/candidates/types";

/**
 * The real record an Enquiry was converted into, resolved through exactly
 * one of enquiries.converted_candidate_id / converted_staff_request_id (the
 * database guarantees never both). null = not converted.
 */
export type EnquiryRelatedRecord =
  | {
      type: "staff-request";
      request: {
        id: string;
        reference: string;
        client: string;
        requirementTitle: string;
        quantityRequired: number;
        status: StaffRequestStatus;
      };
    }
  | {
      type: "candidate";
      candidate: {
        id: string;
        reference: string;
        name: string;
        availability: CandidateAvailability;
      };
    }
  | null;

export interface EnquiryDetailData {
  /** List-row shape; `company` is the matched Employer's name, else the
   * raw company_free_text, else null. */
  enquiry: Enquiry;
  /** Raw owner profile id (null = Unassigned) for the editable rail. */
  ownerId: string | null;
  relatedRecord: EnquiryRelatedRecord;
  notes: NoteRecord[];
  activity: ActivityItem[];
}

export type EnquiryMutationResult =
  | { ok: true }
  | { ok: false; error: string };

export type AddEnquiryNoteResult =
  | { ok: true; note: NoteRecord }
  | { ok: false; error: string };
