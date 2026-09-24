import { AlertCircle, Info } from "lucide-react";
import { FormField } from "@/components/admin/forms/FormField";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import { CONVERTED_STATUS, enquiryStatuses as statusOptions } from "@/lib/enquiries/enums";
import type { OptionItem } from "@/lib/enquiries/types";
import type { EnquiryStatus } from "@/lib/mock/types";

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
  /** Real profile id, or "" for Unassigned. */
  ownerId: string;
  onOwnerChange: (ownerId: string) => void;
  ownerOptions: OptionItem[];
  /**
   * Whether the SAVED enquiry is converted. Conversion is only ever done by
   * the database's convert_enquiry() (status + target together), so here
   * "Converted" can't be picked for an unconverted enquiry, and a converted
   * enquiry's status is locked — owner stays editable either way.
   */
  isConverted: boolean;
  reference: string;
  receivedAt: string;
  type: string;
  source: string;
  relatedRecordLabel: string;
  showSaveFeedback: boolean;
  saveError: string | null;
  isSaving: boolean;
  onSave: () => void;
}

export function EnquiryDetailSidebar({
  status,
  onStatusChange,
  ownerId,
  onOwnerChange,
  ownerOptions,
  isConverted,
  reference,
  receivedAt,
  type,
  source,
  relatedRecordLabel,
  showSaveFeedback,
  saveError,
  isSaving,
  onSave,
}: EnquiryDetailSidebarProps) {
  return (
    <aside className="flex flex-col gap-5 rounded-lg border border-surface-secondary bg-card p-5 xl:sticky xl:top-[76px]">
      <FormField label="Enquiry status" htmlFor="enquiry-status">
        <SelectInput
          id="enquiry-status"
          value={status}
          disabled={isConverted}
          onChange={(event) =>
            onStatusChange(event.target.value as EnquiryStatus)
          }
        >
          {statusOptions.map((option) => (
            <option
              key={option}
              value={option}
              disabled={option === CONVERTED_STATUS && !isConverted}
            >
              {option}
            </option>
          ))}
        </SelectInput>
      </FormField>
      {isConverted ? (
        <p className="-mt-3 text-xs text-fg-muted">
          Converted enquiries keep this status. The record it became is linked
          under Related record.
        </p>
      ) : null}

      <div className="flex flex-col gap-1.5 border-t border-surface-secondary pt-5">
        <FormField label="Assigned owner" htmlFor="enquiry-owner">
          <SelectInput
            id="enquiry-owner"
            value={ownerId}
            onChange={(event) => onOwnerChange(event.target.value)}
          >
            <option value="">Unassigned</option>
            {ownerOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
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
        {saveError ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-red-line bg-red-tint px-3 py-2 text-xs font-medium text-complex-red"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{saveError}</span>
          </div>
        ) : showSaveFeedback ? (
          <div className="flex items-start gap-2 rounded-md bg-surface px-3 py-2 text-xs text-fg-muted">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>Changes saved.</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex h-10 items-center justify-center rounded-md bg-complex-red text-sm font-medium text-white outline-none transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </aside>
  );
}
