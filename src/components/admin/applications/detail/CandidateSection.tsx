import { DetailCard } from "@/components/admin/detail/DetailCard";
import { DetailField } from "@/components/admin/detail/DetailField";
import type { CandidateApplication } from "@/lib/mock/types";
import type { CandidateProfile } from "@/lib/mock/application-details";

const linkClass =
  "rounded text-fg outline-none transition-colors duration-150 hover:text-complex-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red";

export function CandidateSection({
  application,
  candidate,
}: {
  application: CandidateApplication;
  candidate: CandidateProfile;
}) {
  return (
    <DetailCard title="Candidate">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField label="Name">{application.candidateName}</DetailField>
        <DetailField label="Candidate reference">
          {candidate.reference}
        </DetailField>
        <DetailField label="Email">
          <a href={`mailto:${candidate.email}`} className={linkClass}>
            {candidate.email}
          </a>
        </DetailField>
        <DetailField label="Phone">
          <a
            href={`tel:${candidate.phone.replace(/\s+/g, "")}`}
            className={linkClass}
          >
            {candidate.phone}
          </a>
        </DetailField>
        <DetailField label="Location">{candidate.location}</DetailField>
      </dl>
    </DetailCard>
  );
}
