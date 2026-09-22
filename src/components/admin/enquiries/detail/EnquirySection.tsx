import { DetailCard } from "@/components/admin/detail/DetailCard";
import { DetailField } from "@/components/admin/detail/DetailField";
import type { Enquiry } from "@/lib/mock/types";

export function EnquirySection({ enquiry }: { enquiry: Enquiry }) {
  return (
    <DetailCard title="Enquiry">
      <div className="flex flex-col gap-2">
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted/80">
          Subject
        </span>
        <p className="text-sm font-medium text-fg">{enquiry.subject}</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted/80">
          Message
        </span>
        <p className="whitespace-pre-wrap rounded-md border border-surface-secondary bg-surface p-4 text-sm leading-relaxed text-fg">
          {enquiry.message}
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-4 border-t border-surface-secondary pt-4 sm:grid-cols-2">
        <DetailField label="Reference">{enquiry.reference}</DetailField>
        <DetailField label="Received">{enquiry.receivedAt}</DetailField>
        <DetailField label="Source">{enquiry.source}</DetailField>
        <DetailField label="Type">{enquiry.type}</DetailField>
      </dl>
    </DetailCard>
  );
}
