import { candidateApplications } from "./candidate-applications";
import {
  candidateReferenceFromSeed,
  emailFromName,
  hashSeed,
  phoneFromSeed,
} from "./candidate-identity";
import { jobs } from "./jobs";
import type {
  Candidate,
  CandidateApplication,
  CandidateAvailability,
} from "./types";

/**
 * Candidates are the persistent PERSON record and are deliberately modelled
 * separately from `CandidateApplication` (one submission for one vacancy).
 * Most candidates below are derived from the existing Applications dataset
 * so the two screens stay coherent, but a candidate can — and here does —
 * exist in the database with zero applications.
 */

function availabilityFromLatestApplication(
  status: CandidateApplication["status"],
): CandidateAvailability {
  switch (status) {
    case "Placed":
      return "Working";
    case "Withdrawn":
    case "Rejected":
      return "Unavailable";
    default:
      return "Available";
  }
}

function registeredAtFor(seed: number): string {
  // A plausible registration date, deterministic per candidate — not meant
  // to model exact historical registration behaviour.
  const day = 1 + (seed % 20);
  return `2026-08-${String(day).padStart(2, "0")}`;
}

interface AppliedCandidateSeed {
  candidateId: string;
  name: string;
}

// Distinct candidates already present in the Applications dataset, in
// first-seen order (the dataset is newest-first, so this is also each
// candidate's most recent application first).
const appliedCandidateSeeds: AppliedCandidateSeed[] = (() => {
  const seen = new Map<string, AppliedCandidateSeed>();
  for (const application of candidateApplications) {
    if (!seen.has(application.candidateId)) {
      seen.set(application.candidateId, {
        candidateId: application.candidateId,
        name: application.candidateName,
      });
    }
  }
  return Array.from(seen.values());
})();

const appliedCandidates: Candidate[] = appliedCandidateSeeds.map((seed) => {
  const applications = candidateApplications.filter(
    (a) => a.candidateId === seed.candidateId,
  );
  const latest = applications[0];
  const job = jobs.find((j) => j.id === latest.jobId) ?? null;
  const identitySeed = hashSeed(seed.candidateId);

  const candidate: Candidate = {
    id: seed.candidateId,
    reference: candidateReferenceFromSeed(identitySeed),
    name: seed.name,
    email: emailFromName(seed.name),
    phone: phoneFromSeed(identitySeed),
    location: job?.location ?? "—",
    sector: job?.sector ?? "Driving & Transport",
    owner: latest.owner,
    availability: availabilityFromLatestApplication(latest.status),
    applicationCount: applications.length,
    lastActivityAt: latest.appliedAt,
    registeredAt: registeredAtFor(identitySeed),
    source: "Complex Recruitment website",
  };

  return candidate;
});

// Candidates who registered with Complex Recruitment but have not applied
// for a vacancy yet — Candidate ≠ Application, so a 0 application count is
// a valid, expected state.
const unappliedCandidates: Candidate[] = [
  {
    id: "cand-aisha-patel",
    reference: candidateReferenceFromSeed(hashSeed("cand-aisha-patel")),
    name: "Aisha Patel",
    email: emailFromName("Aisha Patel"),
    phone: phoneFromSeed(hashSeed("cand-aisha-patel")),
    location: "Leicester",
    sector: "Industrial & Warehouse",
    owner: null,
    availability: "Available",
    applicationCount: 0,
    lastActivityAt: "19 Sept · 14:30",
    registeredAt: "2026-09-19",
    source: "Website registration",
  },
  {
    id: "cand-connor-walsh",
    reference: candidateReferenceFromSeed(hashSeed("cand-connor-walsh")),
    name: "Connor Walsh",
    email: emailFromName("Connor Walsh"),
    phone: phoneFromSeed(hashSeed("cand-connor-walsh")),
    location: "Nottingham",
    sector: "Construction",
    owner: "Shingi",
    availability: "Inactive",
    applicationCount: 0,
    lastActivityAt: "2 Sept · 10:00",
    registeredAt: "2026-09-02",
    source: "Website registration",
  },
];

// The real /candidates and /candidates/[id] screens no longer use this
// mock dataset at all — see src/lib/candidates/queries.ts. It stays here
// because Enquiry Detail (still mock-only) looks up a mock candidate by id
// to resolve its "converted to candidate" link.
export const candidates: Candidate[] = [
  ...appliedCandidates,
  ...unappliedCandidates,
];
