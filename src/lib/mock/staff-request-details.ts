import { hashSeed, resolveOwnerDisplayName } from "./candidate-identity";
import {
  addMinutesToTimestamp,
  parseRelativeTimestamp,
  type ActivityItem,
  type NoteRecord,
} from "./detail-shared";
import { jobs } from "./jobs";
import { staffRequests } from "./staff-requests";
import type { Job, StaffRequest } from "./types";

/**
 * Detail-specific mock records for a single Staff Request — the employer's
 * demand for workers. Kept separate from `Job` (a vacancy Complex may
 * create to help fulfil that demand): a request may resolve to zero, one,
 * or several Jobs, and this layer only ever *resolves* that relationship
 * from the existing Jobs dataset rather than duplicating Job data.
 */
export interface ClientContact {
  name: string;
  email: string;
  phone: string;
}

export interface RequirementDetails {
  role: string;
  employmentType: string;
  workPattern: string;
  duration: string;
  pay: string;
  source: string;
}

export interface StaffRequestDetail {
  request: StaffRequest;
  clientContact: ClientContact;
  requirement: RequirementDetails;
  relatedJobs: Job[];
  notes: NoteRecord[];
  activity: ActivityItem[];
}

export const assignedRecruiterOptions = [
  "Moremi Molai",
  "Taurai",
  "Shingi",
  "Unassigned",
];

const contactFirstNames = [
  "Rachel",
  "James",
  "Sophie",
  "David",
  "Laura",
  "Michael",
  "Emma",
  "Daniel",
];

const contactLastNames = [
  "Evans",
  "Whitfield",
  "Turner",
  "Coleman",
  "Bennett",
  "Hughes",
  "Fraser",
  "Wallace",
];

function clientSlug(client: string): string {
  return client.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function landlinePhoneFromSeed(seed: number): string {
  const areaCodes = ["0121", "0161", "0116", "0115", "024"];
  const area = areaCodes[seed % areaCodes.length];
  const mid = String(500 + (seed % 400));
  const last = String(1000 + ((seed * 7) % 9000)).padStart(4, "0");
  return `${area} ${mid} ${last}`;
}

function buildClientContact(request: StaffRequest, seed: number): ClientContact {
  const firstName = contactFirstNames[seed % contactFirstNames.length];
  const lastName = contactLastNames[(seed + 5) % contactLastNames.length];
  return {
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${clientSlug(request.client)}.example`,
    phone: landlinePhoneFromSeed(seed),
  };
}

const sectorRequirementDefaults: Record<
  string,
  { employmentType: string; workPattern: string; pay: string }
> = {
  "Driving & Transport": {
    employmentType: "Temporary",
    workPattern: "Shift work",
    pay: "£13.50–£15.00 per hour",
  },
  "Industrial & Warehouse": {
    employmentType: "Temporary",
    workPattern: "Shift work",
    pay: "£11.50–£12.75 per hour",
  },
  Construction: {
    employmentType: "Temporary",
    workPattern: "Full-time",
    pay: "£12.00–£13.50 per hour",
  },
};

const durationOptions = ["Ongoing", "6 weeks", "3 months", "12 weeks"];

const sourceOptions = [
  "Website staff request",
  "Existing client",
  "Email",
  "Phone",
];

function singularise(requirementTitle: string): string {
  return requirementTitle.endsWith("s")
    ? requirementTitle.slice(0, -1)
    : requirementTitle;
}

function buildRequirementDetails(
  request: StaffRequest,
  seed: number,
): RequirementDetails {
  const defaults =
    sectorRequirementDefaults[request.sector] ??
    sectorRequirementDefaults.Construction;

  return {
    role: singularise(request.requirementTitle),
    employmentType: defaults.employmentType,
    workPattern: defaults.workPattern,
    duration: durationOptions[seed % durationOptions.length],
    pay: defaults.pay,
    source: sourceOptions[(seed + 2) % sourceOptions.length],
  };
}

/**
 * Which existing mock Jobs (by id) each Staff Request currently relates to.
 * Hand-curated so the relationship is genuine (matching client + role)
 * rather than arbitrary — deliberately a mix of none / one / several.
 */
const relatedJobIdsByRequestId: Record<string, string[]> = {
  "sr-0128": ["job-0238"],
  "sr-0127": ["job-0241"],
  "sr-0125": ["job-0225"],
  "sr-0122": ["job-0229"],
  "sr-0121": ["job-0221", "job-0188"],
  "sr-0120": ["job-0176"],
  "sr-0119": ["job-0233"],
  "sr-0116": ["job-0219"],
};

const staffRequestNotePool = [
  "Client confirmed night shift cover is the immediate priority.",
  "Two workers already supplied; sourcing continues for remaining positions.",
  "Client has requested candidates with previous experience in this sector.",
  "Followed up with client to confirm ongoing requirement.",
  "Client flagged this as a priority for the coming week.",
  "Candidates shortlisted and awaiting client feedback.",
];

function buildNotes(
  request: StaffRequest,
  seed: number,
  base: ReturnType<typeof parseRelativeTimestamp>,
): NoteRecord[] {
  // Notes are always written by a recruiter, even when the request itself
  // is currently unassigned — fall back to the current admin user.
  const author = request.owner
    ? resolveOwnerDisplayName(request.owner)
    : "Moremi Molai";

  // Offsets are kept after every other activity event's offset (assigned
  // +10, status +25, related job +35, filled +45) so the notes always sort
  // last in the chronological activity feed, regardless of which of those
  // conditional events actually fired for this request.
  return [
    {
      id: `${request.id}-note-1`,
      author,
      timestamp: addMinutesToTimestamp(base, 55, request.submittedAt),
      text: staffRequestNotePool[seed % staffRequestNotePool.length],
    },
    {
      id: `${request.id}-note-2`,
      author,
      timestamp: addMinutesToTimestamp(base, 70, request.submittedAt),
      text: staffRequestNotePool[(seed + 3) % staffRequestNotePool.length],
    },
  ];
}

function buildActivity(
  request: StaffRequest,
  relatedJobs: Job[],
  notes: NoteRecord[],
  base: ReturnType<typeof parseRelativeTimestamp>,
): ActivityItem[] {
  const events: ActivityItem[] = [
    {
      id: `${request.id}-act-submitted`,
      description: `Staff request submitted by ${request.client}`,
      timestamp: request.submittedAt,
    },
  ];

  if (request.owner) {
    events.push({
      id: `${request.id}-act-assigned`,
      description: `Request assigned to ${resolveOwnerDisplayName(request.owner)}`,
      timestamp: addMinutesToTimestamp(base, 10, request.submittedAt),
    });
  }

  if (request.status !== "New") {
    events.push({
      id: `${request.id}-act-status`,
      description: `Status changed from New to ${request.status}`,
      timestamp: addMinutesToTimestamp(base, 25, request.submittedAt),
    });
  }

  for (const job of relatedJobs) {
    events.push({
      id: `${request.id}-act-job-${job.id}`,
      description: `${job.title} linked to this request`,
      timestamp: addMinutesToTimestamp(base, 35, request.submittedAt),
    });
  }

  if (request.quantityFilled > 0) {
    events.push({
      id: `${request.id}-act-filled`,
      description: `${request.quantityFilled} position${request.quantityFilled === 1 ? "" : "s"} marked as filled`,
      timestamp: addMinutesToTimestamp(base, 45, request.submittedAt),
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

export function getStaffRequestDetailById(
  id: string,
): StaffRequestDetail | null {
  const request = staffRequests.find((item) => item.id === id);
  if (!request) return null;

  const seed = hashSeed(request.id);
  const base = parseRelativeTimestamp(request.submittedAt);

  const clientContact = buildClientContact(request, seed);
  const requirement = buildRequirementDetails(request, seed);
  const relatedJobIds = relatedJobIdsByRequestId[request.id] ?? [];
  const relatedJobs = relatedJobIds
    .map((jobId) => jobs.find((job) => job.id === jobId))
    .filter((job): job is Job => Boolean(job));
  const notes = buildNotes(request, seed, base);
  const activity = buildActivity(request, relatedJobs, notes, base);

  return { request, clientContact, requirement, relatedJobs, notes, activity };
}
