import Link from "next/link";
import { DetailCard } from "@/components/admin/detail/DetailCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { AvailabilityBadge } from "@/components/admin/candidates/AvailabilityBadge";
import type { RelatedRecord } from "@/lib/mock/enquiry-details";

const openLinkClass =
  "shrink-0 rounded text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red";

export function RelatedRecordSection({
  relatedRecord,
}: {
  relatedRecord: RelatedRecord;
}) {
  return (
    <DetailCard title="Related record">
      {relatedRecord?.type === "staff-request" ? (
        <div className="flex items-center justify-between gap-4 rounded-md border border-surface-secondary bg-surface p-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted/80">
              Staff request
            </span>
            <span className="text-sm font-medium text-fg">
              {relatedRecord.request.client}
            </span>
            <span className="text-sm text-fg-muted">
              {relatedRecord.request.quantityRequired}{" "}
              {relatedRecord.request.requirementTitle}
            </span>
            <span className="text-xs text-fg-muted">
              {relatedRecord.request.reference}
            </span>
          </div>
          <div className="flex flex-col items-end gap-3">
            <StatusBadge status={relatedRecord.request.status} />
            <Link
              href={`/staff-requests/${relatedRecord.request.id}`}
              className={openLinkClass}
            >
              Open staff request
            </Link>
          </div>
        </div>
      ) : relatedRecord?.type === "candidate" ? (
        <div className="flex items-center justify-between gap-4 rounded-md border border-surface-secondary bg-surface p-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted/80">
              Candidate
            </span>
            <span className="text-sm font-medium text-fg">
              {relatedRecord.candidate.name}
            </span>
            <span className="text-xs text-fg-muted">
              {relatedRecord.candidate.reference}
            </span>
          </div>
          <div className="flex flex-col items-end gap-3">
            <AvailabilityBadge availability={relatedRecord.candidate.availability} />
            <Link
              href={`/candidates/${relatedRecord.candidate.id}`}
              className={openLinkClass}
            >
              Open candidate
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-surface-secondary bg-surface px-6 py-10 text-center">
          <p className="text-sm font-semibold text-fg">No related record</p>
          <p className="text-sm text-fg-muted">
            This enquiry has not been converted into another operational
            record.
          </p>
        </div>
      )}
    </DetailCard>
  );
}
