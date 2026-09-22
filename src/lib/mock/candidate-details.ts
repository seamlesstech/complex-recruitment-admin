import { candidateApplications } from "./candidate-applications";
import { candidates } from "./candidates";
import { hashSeed, resolveOwnerDisplayName } from "./candidate-identity";
import {
  addMinutesToTimestamp,
  parseRelativeTimestamp,
  type ActivityItem,
  type DocumentRecord,
  type NoteRecord,
} from "./detail-shared";
import type { Candidate, CandidateApplication } from "./types";

/**
 * Detail-specific mock records for a single candidate — the persistent
 * PERSON record. Deliberately separate from `ApplicationDetail`: a
 * candidate's documents, notes and activity belong to the candidate
 * relationship as a whole, not to any one of their applications.
 */
export interface CandidateDetail {
  candidate: Candidate;
  registeredLabel: string;
  applications: CandidateApplication[];
  documents: DocumentRecord[];
  notes: NoteRecord[];
  activity: ActivityItem[];
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

function formatIsoDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function expiryDateFor(seed: number): string {
  const day = 1 + (seed % 28);
  const month = MONTH_NAMES[seed % 12];
  return `${day} ${month} 2027`;
}

function buildCandidateDocuments(
  candidate: Candidate,
  seed: number,
): DocumentRecord[] {
  const [firstName, ...rest] = candidate.name.split(" ");
  const lastName = rest.join("-") || firstName;
  const fileBase = `${firstName}-${lastName}`;
  const uploadedLabel = `Uploaded ${formatIsoDate(candidate.registeredAt)}`;

  const documents: DocumentRecord[] = [
    {
      id: `${candidate.id}-doc-cv`,
      label: "CV",
      fileName: `${fileBase}-CV.pdf`,
      fileType: "PDF",
      fileSize: `${190 + (seed % 130)} KB`,
      context: uploadedLabel,
    },
  ];

  if (candidate.sector === "Driving & Transport") {
    documents.push(
      {
        id: `${candidate.id}-doc-licence`,
        label: "Driving Licence",
        fileName: `${fileBase}-Driving-Licence.jpg`,
        fileType: "JPG",
        fileSize: `${430 + (seed % 180)} KB`,
        context: uploadedLabel,
        expiryLabel: `Expires ${expiryDateFor(seed)}`,
      },
      {
        id: `${candidate.id}-doc-cpc`,
        label: "CPC Card",
        fileName: `${fileBase}-CPC-Card.jpg`,
        fileType: "JPG",
        fileSize: `${300 + (seed % 140)} KB`,
        context: uploadedLabel,
        expiryLabel: `Expires ${expiryDateFor(seed + 7)}`,
      },
    );
  } else if (seed % 2 === 0) {
    documents.push({
      id: `${candidate.id}-doc-rtw`,
      label: "Right to Work",
      fileName: `${fileBase}-Right-to-Work.pdf`,
      fileType: "PDF",
      fileSize: `${100 + (seed % 90)} KB`,
      context: uploadedLabel,
    });
  }

  return documents;
}

const candidateNotePool = [
  "Candidate prefers weekday day shifts.",
  "Available immediately and willing to travel within the West Midlands.",
  "Spoke with candidate regarding upcoming opportunities.",
  "Candidate confirmed continued interest in temporary work.",
  "Reference check completed and on file.",
  "Candidate would consider permanent roles for the right client.",
];

function buildCandidateNotes(candidate: Candidate, seed: number): NoteRecord[] {
  // Notes are always written by a recruiter, even when the candidate
  // relationship is currently unassigned — fall back to the current user.
  const author = candidate.owner
    ? resolveOwnerDisplayName(candidate.owner)
    : "Moremi Molai";
  const base = parseRelativeTimestamp(candidate.lastActivityAt);

  return [
    {
      id: `${candidate.id}-note-1`,
      author,
      timestamp: addMinutesToTimestamp(base, 15, candidate.lastActivityAt),
      text: candidateNotePool[seed % candidateNotePool.length],
    },
    {
      id: `${candidate.id}-note-2`,
      author,
      timestamp: addMinutesToTimestamp(base, 40, candidate.lastActivityAt),
      text: candidateNotePool[(seed + 3) % candidateNotePool.length],
    },
  ];
}

function buildCandidateActivity(
  candidate: Candidate,
  applications: CandidateApplication[],
  notes: NoteRecord[],
): ActivityItem[] {
  const events: ActivityItem[] = [
    {
      id: `${candidate.id}-act-registered`,
      description: "Candidate registered with Complex Recruitment",
      timestamp: formatIsoDate(candidate.registeredAt),
    },
  ];

  // Applications are stored newest-first; walk oldest-first for a
  // chronological activity feed.
  for (const application of [...applications].reverse()) {
    events.push({
      id: `${application.id}-act-applied`,
      description: `Candidate applied for ${application.jobTitle}`,
      timestamp: application.appliedAt,
    });
  }

  if (candidate.owner) {
    events.push({
      id: `${candidate.id}-act-assigned`,
      description: `Candidate assigned to ${resolveOwnerDisplayName(candidate.owner)}`,
      timestamp: candidate.lastActivityAt,
    });
  }

  events.push({
    id: `${candidate.id}-act-availability`,
    description: `Candidate availability changed to ${candidate.availability}`,
    timestamp: candidate.lastActivityAt,
  });

  for (const note of notes) {
    events.push({
      id: `${note.id}-act`,
      description: `${note.author} added an internal note`,
      timestamp: note.timestamp,
    });
  }

  return events;
}

export function getCandidateDetailById(id: string): CandidateDetail | null {
  const candidate = candidates.find((item) => item.id === id);
  if (!candidate) return null;

  // The same stable candidateId links a Candidate to their Applications, so
  // this is a genuine relationship rather than a display-name match — and
  // its length always matches `candidate.applicationCount` exactly.
  const applications = candidateApplications.filter(
    (application) => application.candidateId === id,
  );

  const seed = hashSeed(id);
  const registeredLabel = formatIsoDate(candidate.registeredAt);
  const documents = buildCandidateDocuments(candidate, seed);
  const notes = buildCandidateNotes(candidate, seed);
  const activity = buildCandidateActivity(candidate, applications, notes);

  return { candidate, registeredLabel, applications, documents, notes, activity };
}
