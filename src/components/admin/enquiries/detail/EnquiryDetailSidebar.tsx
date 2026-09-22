import { Info } from "lucide-react";
import { FormField } from "@/components/admin/forms/FormField";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import { assignedOwnerOptions } from "@/lib/mock/enquiry-details";
import { enquiryStatusFilterOptions } from "@/lib/mock/enquiries";
import type { EnquiryStatus } from "@/lib/mock/types";

const statusOptions = enquiryStatusFilterOptions.filter(
  (option): option is EnquiryStatus => option !== "All statuses",
);

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium text-fg">{value}</span>
    </div>
  );
}

interface EnquiryDetailSidebarProps {
  status: EnquiryStatus;
  onStatusChange: (status: EnquiryStatus) => void;
  owner: string;
  onOwnerChange: (owner: string) => void;
  reference: string;
  receivedAt: string;
  type: string;
  source: string;
  relatedRecordLabel: string;
  showSaveFeedback: boolean;
  onSave: () => void;
}

export function EnquiryDetailSidebar({
  status,
  onStatusChange,
  owner,
  onOwnerChange,
  reference,
  receivedAt,
  type,
  source,
  relatedRecordLabel,
  showSaveFeedback,
  onSave,
}: EnquiryDetailSidebarProps) {
  return (
    <aside className="flex flex-col gap-5 rounded-lg border border-surface-secondary bg-card p-5 xl:sticky xl:top-[76px]">
      <FormField label="Enquiry status" htmlFor="enquiry-status">
        <SelectInput
          id="enquiry-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as EnquiryStatus)
          }
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <div className="flex flex-col gap-1.5 border-t border-surface-secondary pt-5">
        <FormField label="Assigned owner" htmlFor="enquiry-owner">
          <SelectInput
            id="enquiry-owner"
            value={owner}
            onChange={(event) => onOwnerChange(event.target.value)}
          >
            {assignedOwnerOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <div className="flex flex-col gap-2 border-t border-surface-secondary pt-5">
        <span className="mb-1 text-sm font-medium text-fg">
          Enquiry summary
        </span>
        <SummaryRow label="Enquiry" value={reference} />
        <SummaryRow label="Received" value={receivedAt} />
        <SummaryRow label="Type" value={type} />
        <SummaryRow label="Source" value={source} />
        <SummaryRow label="Related record" value={relatedRecordLabel} />
      </div>

      <div className="flex flex-col gap-2 border-t border-surface-secondary pt-5">
        {showSaveFeedback ? (
          <div className="flex items-start gap-2 rounded-md bg-surface px-3 py-2 text-xs text-fg-muted">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>Preview only — changes have not been persisted.</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onSave}
          className="flex h-10 items-center justify-center rounded-md bg-complex-red text-sm font-medium text-white outline-none transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Save changes
        </button>
      </div>
    </aside>
  );
}
