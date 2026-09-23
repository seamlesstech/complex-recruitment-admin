import { DetailCard } from "@/components/admin/detail/DetailCard";
import { DetailField } from "@/components/admin/detail/DetailField";
import type { ApplicationVacancy } from "@/lib/applications/types";
import type { CandidateApplication } from "@/lib/mock/types";

export function ApplicationSection({
  application,
  vacancy,
  source,
}: {
  application: CandidateApplication;
  vacancy: ApplicationVacancy;
  source: string;
}) {
  return (
    <DetailCard
      title="Application"
      actionLabel="Open job"
      actionHref={`/jobs/${vacancy.jobId}/edit`}
    >
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField label="Job title">{application.jobTitle}</DetailField>
        <DetailField label="Job reference">
          {application.jobReference}
        </DetailField>
        <DetailField label="Client">{application.client}</DetailField>
        <DetailField label="Job location">{vacancy.jobLocation}</DetailField>
        <DetailField label="Application reference">
          {application.reference}
        </DetailField>
        <DetailField label="Applied">{application.appliedAt}</DetailField>
        <DetailField label="Source">{source}</DetailField>
        <DetailField label="Employment type">
          {vacancy.employmentType}
        </DetailField>
        <DetailField label="Pay">{vacancy.pay}</DetailField>
        <DetailField label="Work pattern">{vacancy.workPattern}</DetailField>
      </dl>
    </DetailCard>
  );
}
