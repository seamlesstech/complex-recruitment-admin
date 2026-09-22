import { candidateApplications } from "./candidate-applications";
import {
  candidateReferenceFromSeed,
  emailFromName,
  hashSeed,
  phoneFromSeed,
  resolveOwnerDisplayName,
} from "./candidate-identity";
import {
  addMinutesToTimestamp,
  parseRelativeTimestamp,
  type ActivityItem,
  type DocumentRecord,
  type NoteRecord,
  type ParsedTimestamp,
} from "./detail-shared";
import { buildJobDraftFromJob } from "./job-details";
import { formatPayPreview } from "./job-editor";
import { jobs } from "./jobs";
import type { CandidateApplication, Job } from "./types";

/**
 * Detail-specific mock records for a single application. Kept separate from
 * `CandidateApplication` (the list-row shape) because a candidate, an
 * application, internal notes and activity are distinct concepts that will
 * eventually map to different Supabase tables.
 */
export interface CandidateProfile {
  reference: string;
  email: string;
  phone: string;
  location: string;
}

export interface VacancyDetail {
  employmentType: string;
  workPattern: string;
  pay: string;
  jobLocation: string;
  source: string;
}

export interface ApplicationDetail {
  application: CandidateApplication;
  job: Job | null;
  candidate: CandidateProfile;
  vacancy: VacancyDetail;
  documents: DocumentRecord[];
  notes: NoteRecord[];
  activity: ActivityItem[];
}

export const assignedRecruiterDetailOptions = [
  "Moremi Molai",
  "Taurai",
  "Shingi",
  "Unassigned",
];

export const applicationSource = "Complex Recruitment website";
export const applicationSourceShort = "Website";

const sectorVacancyDefaults: Record<
  string,
  { employmentType: string; workPattern: string; pay: string }
> = {
  "Driving & Transport": {
    employmentType: "Temporary",
    workPattern: "Full-time",
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

function buildVacancyDetail(job: Job | null): VacancyDetail {
  if (!job) {
    return {
      employmentType: "Temporary",
      workPattern: "Full-time",
      pay: "Competitive, dependent on experience",
      jobLocation: "—",
      source: applicationSource,
    };
  }

  const { draft } = buildJobDraftFromJob(job);
  const defaults =
    sectorVacancyDefaults[job.sector] ?? sectorVacancyDefaults.Construction;

  const employmentType = draft.employmentType || defaults.employmentType;
  const workPattern = draft.workPattern || defaults.workPattern;
  const previewPay = formatPayPreview(draft);
  const pay = previewPay === "Pay not yet specified" ? defaults.pay : previewPay;

  return {
    employmentType,
    workPattern,
    pay,
    jobLocation: job.location,
    source: applicationSource,
  };
}

function buildDocuments(
  application: CandidateApplication,
  job: Job | null,
  seed: number,
): DocumentRecord[] {
  const [firstName, ...rest] = application.candidateName.split(" ");
  const lastName = rest.join("-") || firstName;
  const fileBase = `${firstName}-${lastName}`;
  const cvSizeKb = 180 + (seed % 140);

  const documents: DocumentRecord[] = [
    {
      id: `${application.id}-doc-cv`,
      label: "CV",
      fileName: `${fileBase}-CV.pdf`,
      fileType: "PDF",
      fileSize: `${cvSizeKb} KB`,
      context: "Uploaded with application",
    },
  ];

  const isDrivingRole = job?.sector === "Driving & Transport";
  if (isDrivingRole && seed % 2 === 0) {
    documents.push({
      id: `${application.id}-doc-licence`,
      label: "Driving Licence",
      fileName: `${fileBase}-Driving-Licence.jpg`,
      fileType: "JPG",
      fileSize: `${420 + (seed % 200)} KB`,
      context: "Uploaded with application",
    });
    documents.push({
      id: `${application.id}-doc-cpc`,
      label: "CPC Card",
      fileName: `${fileBase}-CPC-Card.jpg`,
      fileType: "JPG",
      fileSize: `${310 + (seed % 150)} KB`,
      context: "Uploaded with application",
    });
  }

  if (seed % 3 === 0) {
    documents.push({
      id: `${application.id}-doc-rtw`,
      label: "Right to Work",
      fileName: `${fileBase}-Right-to-Work.pdf`,
      fileType: "PDF",
      fileSize: `${95 + (seed % 80)} KB`,
      context: "Uploaded with application",
    });
  }

  return documents;
}

const notePool = [
  "Candidate confirmed availability for an immediate start.",
  "Licence and CPC details to be verified before shortlist.",
  "Spoke with candidate — strong communication, good fit for the role.",
  "Awaiting reference confirmation from previous employer.",
  "Candidate has relevant experience with similar clients.",
  "Right to Work document reviewed and on file.",
  "Candidate rescheduled initial call to later this week.",
  "Flagged for priority review given client timeline.",
];

function buildNotes(
  application: CandidateApplication,
  seed: number,
  base: ParsedTimestamp | null,
): NoteRecord[] {
  // Notes are always written by a recruiter, even when the application
  // itself is currently unassigned — fall back to the current admin user.
  const author = application.owner
    ? resolveOwnerDisplayName(application.owner)
    : "Moremi Molai";

  return [
    {
      id: `${application.id}-note-1`,
      author,
      timestamp: addMinutesToTimestamp(base, 30, application.appliedAt),
      text: notePool[seed % notePool.length],
    },
    {
      id: `${application.id}-note-2`,
      author,
      timestamp: addMinutesToTimestamp(base, 55, application.appliedAt),
      text: notePool[(seed + 3) % notePool.length],
    },
  ];
}

function buildActivity(
  application: CandidateApplication,
  notes: NoteRecord[],
  base: ParsedTimestamp | null,
): ActivityItem[] {
  const events: ActivityItem[] = [
    {
      id: `${application.id}-act-submitted`,
      description: `Application submitted for ${application.jobTitle}`,
      timestamp: application.appliedAt,
    },
  ];

  if (application.owner) {
    events.push({
      id: `${application.id}-act-assigned`,
      description: `Application assigned to ${resolveOwnerDisplayName(application.owner)}`,
      timestamp: addMinutesToTimestamp(base, 8, application.appliedAt),
    });
  }

  if (application.status !== "New") {
    events.push({
      id: `${application.id}-act-status`,
      description: `Status changed from New to ${application.status}`,
      timestamp: addMinutesToTimestamp(base, 20, application.appliedAt),
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

export function getApplicationDetailById(id: string): ApplicationDetail | null {
  const application = candidateApplications.find((item) => item.id === id);
  if (!application) return null;

  const job = jobs.find((item) => item.id === application.jobId) ?? null;
  const seed = hashSeed(application.candidateId);
  const base = parseRelativeTimestamp(application.appliedAt);

  const candidate: CandidateProfile = {
    reference: candidateReferenceFromSeed(seed),
    email: emailFromName(application.candidateName),
    phone: phoneFromSeed(seed),
    location: job?.location ?? "—",
  };

  const vacancy = buildVacancyDetail(job);
  const documents = buildDocuments(application, job, seed);
  const notes = buildNotes(application, seed, base);
  const activity = buildActivity(application, notes, base);

  return { application, job, candidate, vacancy, documents, notes, activity };
}
