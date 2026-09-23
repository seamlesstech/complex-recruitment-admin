import { AlertCircle, Info } from "lucide-react";
import { FormField } from "@/components/admin/forms/FormField";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import {
  staffRequestStatuses as statusOptions,
  staffRequestUrgencies as urgencyOptions,
} from "@/lib/staff-requests/enums";
import type { OptionItem } from "@/lib/staff-requests/types";
import type { StaffRequestStatus, StaffRequestUrgency } from "@/lib/mock/types";

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium text-fg">{value}</span>
    </div>
  );
}

interface StaffRequestDetailSidebarProps {
  status: StaffRequestStatus;
  onStatusChange: (status: StaffRequestStatus) => void;
  /** Real profile id, or "" for Unassigned. */
  ownerId: string;
  onOwnerChange: (ownerId: string) => void;
  ownerOptions: OptionItem[];
  urgency: StaffRequestUrgency;
  onUrgencyChange: (urgency: StaffRequestUrgency) => void;
  reference: string;
  submittedAt: string;
  quantityRequired: number;
  quantityFilled: number;
  neededBy: string;
  showSaveFeedback: boolean;
  saveError: string | null;
  isSaving: boolean;
  onSave: () => void;
}

export function StaffRequestDetailSidebar({
  status,
  onStatusChange,
  ownerId,
  onOwnerChange,
  ownerOptions,
  urgency,
  onUrgencyChange,
  reference,
  submittedAt,
  quantityRequired,
  quantityFilled,
  neededBy,
  showSaveFeedback,
  saveError,
  isSaving,
  onSave,
}: StaffRequestDetailSidebarProps) {
  const remaining = Math.max(quantityRequired - quantityFilled, 0);

  return (
    <aside className="flex flex-col gap-5 rounded-lg border border-surface-secondary bg-card p-5 xl:sticky xl:top-[76px]">
      <FormField label="Request status" htmlFor="staff-request-status">
        <SelectInput
          id="staff-request-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as StaffRequestStatus)
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
        <FormField label="Assigned recruiter" htmlFor="staff-request-owner">
          <SelectInput
            id="staff-request-owner"
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

      <div className="flex flex-col gap-1.5 border-t border-surface-secondary pt-5">
        <FormField label="Urgency" htmlFor="staff-request-urgency">
          <SelectInput
            id="staff-request-urgency"
            value={urgency}
            onChange={(event) =>
              onUrgencyChange(event.target.value as StaffRequestUrgency)
            }
          >
            {urgencyOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <div className="flex flex-col gap-2 border-t border-surface-secondary pt-5">
        <span className="mb-1 text-sm font-medium text-fg">
          Request summary
        </span>
        <SummaryRow label="Request" value={reference} />
        <SummaryRow label="Submitted" value={submittedAt} />
        <SummaryRow label="Required" value={String(quantityRequired)} />
        <SummaryRow label="Filled" value={String(quantityFilled)} />
        <SummaryRow label="Remaining" value={String(remaining)} />
        <SummaryRow label="Needed by" value={neededBy} />
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
