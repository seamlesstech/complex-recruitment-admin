import { candidates } from "./candidates";
import { hashSeed, resolveOwnerDisplayName } from "./candidate-identity";
import {
  addMinutesToTimestamp,
  parseRelativeTimestamp,
  type ActivityItem,
  type NoteRecord,
} from "./detail-shared";
import { enquiries } from "./enquiries";
import { staffRequests } from "./staff-requests";
import type { Candidate, Enquiry, StaffRequest } from "./types";

/**
 * Detail-specific mock records for a single Enquiry. Deliberately separate
 * from `Candidate` / `StaffRequest` — an enquiry may relate to one of those
 * records once converted, but the relationship is only ever *resolved*
 * from the existing datasets here, never duplicated.
 */
export type RelatedRecord =
  | { type: "staff-request"; request: StaffRequest }
  | { type: "candidate"; candidate: Candidate }
  | null;

export interface EnquiryDetail {
  enquiry: Enquiry;
  relatedRecord: RelatedRecord;
  notes: NoteRecord[];
  activity: ActivityItem[];
}

export const assignedOwnerOptions = [
  "Moremi Molai",
  "Taurai",
  "Shingi",
  "Unassigned",
];

/**
 * Which real Candidate/Staff Request record each Converted enquiry relates
 * to. Hand-curated so the relationship is genuine (same client, or a real
 * candidate) rather than fabricated — every `status: "Converted"` enquiry
 * has an entry here, and nothing else does.
 */
type RelatedRecordRef =
  | { type: "staff-request"; id: string }
  | { type: "candidate"; id: string };

const relatedRecordRefByEnquiryId: Record<string, RelatedRecordRef> = {
  "enq-0136": { type: "staff-request", id: "sr-0122" },
  "enq-0128": { type: "staff-request", id: "sr-0117" },
  "enq-0131": { type: "candidate", id: "cand-emily-foster" },
};

function resolveRelatedRecord(enquiryId: string): RelatedRecord {
  const ref = relatedRecordRefByEnquiryId[enquiryId];
  if (!ref) return null;

  if (ref.type === "staff-request") {
    const request = staffRequests.find((item) => item.id === ref.id);
    return request ? { type: "staff-request", request } : null;
  }

  const candidate = candidates.find((item) => item.id === ref.id);
  return candidate ? { type: "candidate", candidate } : null;
}

const enquiryNotePool = [
  "Client confirmed the requirement is for both day and night shifts.",
  "Follow-up call booked for tomorrow morning.",
  "Candidate advised to complete registration before discussing current vacancies.",
  "Sent over our standard terms for review.",
  "Left a voicemail — will try again this afternoon.",
  "Confirmed receipt and logged the enquiry for follow-up.",
];

function buildNotes(
  enquiry: Enquiry,
  seed: number,
  base: ReturnType<typeof parseRelativeTimestamp>,
): NoteRecord[] {
  // Notes are always written by a recruiter, even when the enquiry itself
  // is currently unassigned — fall back to the current admin user.
  const author = enquiry.owner
    ? resolveOwnerDisplayName(enquiry.owner)
    : "Moremi Molai";

  // Offsets are kept after every other activity event's offset (assigned
  // +10, status +25, converted +35) so notes always sort last in the
  // chronological activity feed below.
  return [
    {
      id: `${enquiry.id}-note-1`,
      author,
      timestamp: addMinutesToTimestamp(base, 45, enquiry.receivedAt),
      text: enquiryNotePool[seed % enquiryNotePool.length],
    },
    {
      id: `${enquiry.id}-note-2`,
      author,
      timestamp: addMinutesToTimestamp(base, 60, enquiry.receivedAt),
      text: enquiryNotePool[(seed + 3) % enquiryNotePool.length],
    },
  ];
}

function buildActivity(
  enquiry: Enquiry,
  relatedRecord: RelatedRecord,
  notes: NoteRecord[],
  base: ReturnType<typeof parseRelativeTimestamp>,
): ActivityItem[] {
  const events: ActivityItem[] = [
    {
      id: `${enquiry.id}-act-received`,
      description: `Enquiry received from ${enquiry.contactName}`,
      timestamp: enquiry.receivedAt,
    },
  ];

  if (enquiry.owner) {
    events.push({
      id: `${enquiry.id}-act-assigned`,
      description: `Enquiry assigned to ${resolveOwnerDisplayName(enquiry.owner)}`,
      timestamp: addMinutesToTimestamp(base, 10, enquiry.receivedAt),
    });
  }

  if (enquiry.status !== "New") {
    events.push({
      id: `${enquiry.id}-act-status`,
      description: `Status changed from New to ${enquiry.status}`,
      timestamp: addMinutesToTimestamp(base, 25, enquiry.receivedAt),
    });
  }

  if (enquiry.status === "Converted" && relatedRecord) {
    const description =
      relatedRecord.type === "staff-request"
        ? `Enquiry converted to Staff Request ${relatedRecord.request.reference}`
        : `Enquiry converted to Candidate ${relatedRecord.candidate.reference}`;
    events.push({
      id: `${enquiry.id}-act-converted`,
      description,
      timestamp: addMinutesToTimestamp(base, 35, enquiry.receivedAt),
    });
  }

  for (const note of notes) {
    events.push({
      id: `${note.id}-act`,
      description: `${note.author} added an internal note`,
      timestamp: note.timestamp,
    });
  }

  return events;
}

export function getEnquiryDetailById(id: string): EnquiryDetail | null {
  const enquiry = enquiries.find((item) => item.id === id);
  if (!enquiry) return null;

  const seed = hashSeed(enquiry.id);
  const base = parseRelativeTimestamp(enquiry.receivedAt);

  const relatedRecord = resolveRelatedRecord(enquiry.id);
  const notes = buildNotes(enquiry, seed, base);
  const activity = buildActivity(enquiry, relatedRecord, notes, base);

  return { enquiry, relatedRecord, notes, activity };
}
