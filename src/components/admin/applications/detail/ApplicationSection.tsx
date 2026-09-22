import { DetailCard } from "@/components/admin/detail/DetailCard";
import { DetailField } from "@/components/admin/detail/DetailField";
import type { CandidateApplication, Job } from "@/lib/mock/types";
import type { VacancyDetail } from "@/lib/mock/application-details";

export function ApplicationSection({
  application,
  job,
  vacancy,
}: {
  application: CandidateApplication;
  job: Job | null;
  vacancy: VacancyDetail;
}) {
  return (
    <DetailCard
      title="Application"
      actionLabel={job ? "Open job" : undefined}
      actionHref={job ? `/jobs/${job.id}/edit` : undefined}
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
        <DetailField label="Source">{vacancy.source}</DetailField>
        <DetailField label="Employment type">
          {vacancy.employmentType}
        </DetailField>
        <DetailField label="Pay">{vacancy.pay}</DetailField>
        <DetailField label="Work pattern">{vacancy.workPattern}</DetailField>
      </dl>
    </DetailCard>
  );
}
