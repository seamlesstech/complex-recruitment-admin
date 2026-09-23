import { DetailCard } from "@/components/admin/detail/DetailCard";
import { DetailField } from "@/components/admin/detail/DetailField";
import type { ApplicationCandidate } from "@/lib/applications/types";

const linkClass =
  "rounded text-fg outline-none transition-colors duration-150 hover:text-complex-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red";

export function CandidateSection({
  candidate,
}: {
  candidate: ApplicationCandidate;
}) {
  return (
    <DetailCard
      title="Candidate"
      actionLabel="Open candidate"
      actionHref={`/candidates/${candidate.id}`}
    >
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField label="Name">{candidate.name}</DetailField>
        <DetailField label="Candidate reference">
          {candidate.reference}
        </DetailField>
        <DetailField label="Email">
          {candidate.email ? (
            <a href={`mailto:${candidate.email}`} className={linkClass}>
              {candidate.email}
            </a>
          ) : (
            "—"
          )}
        </DetailField>
        <DetailField label="Phone">
          {candidate.phone ? (
            <a
              href={`tel:${candidate.phone.replace(/\s+/g, "")}`}
              className={linkClass}
            >
              {candidate.phone}
            </a>
          ) : (
            "—"
          )}
        </DetailField>
        <DetailField label="Location">{candidate.location || "—"}</DetailField>
      </dl>
    </DetailCard>
  );
}
