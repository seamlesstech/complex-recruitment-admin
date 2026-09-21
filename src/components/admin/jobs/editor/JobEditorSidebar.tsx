import { Info } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FormField } from "@/components/admin/forms/FormField";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import { Toggle } from "@/components/admin/forms/Toggle";
import { assignedRecruiterOptions } from "@/lib/mock/job-editor";
import type { JobStatus } from "@/lib/mock/types";

interface JobEditorSidebarProps {
  reference: string;
  status: JobStatus;
  applicationsCount: number;
  createdBy: string;
  owner: string;
  onOwnerChange: (owner: string) => void;
  publishOnWebsite: boolean;
  onPublishToggle: (value: boolean) => void;
  closingDate: string;
  feedback: "publish" | "draft" | "save" | null;
  primaryLabel: string;
  onPrimary: () => void;
  showSaveDraft: boolean;
  onSaveDraft: () => void;
  onCancel: () => void;
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium text-fg">{value}</span>
    </div>
  );
}

const feedbackCopy: Record<"publish" | "draft" | "save", string> = {
  publish:
    "Preview only — this vacancy has not been published. Backend publishing will be added later.",
  draft: "Preview only — this draft has not been saved anywhere yet.",
  save: "Preview only — these changes have not been saved yet.",
};

export function JobEditorSidebar({
  reference,
  status,
  applicationsCount,
  createdBy,
  owner,
  onOwnerChange,
  publishOnWebsite,
  onPublishToggle,
  closingDate,
  feedback,
  primaryLabel,
  onPrimary,
  showSaveDraft,
  onSaveDraft,
  onCancel,
}: JobEditorSidebarProps) {
  return (
    <aside className="flex flex-col gap-5 rounded-lg border border-surface-secondary bg-card p-5 xl:sticky xl:top-[76px]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-fg">Status</span>
        <StatusBadge status={status} />
      </div>

      <div className="flex flex-col gap-1.5 border-t border-surface-secondary pt-5">
        <FormField label="Assigned recruiter" htmlFor="job-owner">
          <SelectInput
            id="job-owner"
            value={owner}
            onChange={(event) => onOwnerChange(event.target.value)}
          >
            {assignedRecruiterOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <div className="flex flex-col gap-3 border-t border-surface-secondary pt-5">
        <span className="text-sm font-medium text-fg">Publication</span>
        <Toggle
          id="job-publish-toggle"
          label="List on website when published"
          checked={publishOnWebsite}
          onChange={onPublishToggle}
        />
        <p className="text-xs text-fg-muted">
          When published, this vacancy will be visible on the Complex
          Recruitment website.
        </p>
        <p className="text-xs text-fg-muted">
          Closing date: {closingDate || "No closing date"}
        </p>
      </div>

      <div className="flex flex-col gap-2 border-t border-surface-secondary pt-5">
        <span className="mb-1 text-sm font-medium text-fg">
          Vacancy summary
        </span>
        <SummaryRow label="Reference" value={reference} />
        <SummaryRow label="Status" value={status} />
        <SummaryRow label="Applications" value={String(applicationsCount)} />
        <SummaryRow label="Created by" value={createdBy} />
      </div>

      <div className="flex flex-col gap-2 border-t border-surface-secondary pt-5">
        {feedback ? (
          <div className="flex items-start gap-2 rounded-md bg-surface px-3 py-2 text-xs text-fg-muted">
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>{feedbackCopy[feedback]}</span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onPrimary}
          className="flex h-10 items-center justify-center rounded-md bg-complex-red text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          {primaryLabel}
        </button>
        {showSaveDraft ? (
          <button
            type="button"
            onClick={onSaveDraft}
            className="flex h-10 items-center justify-center rounded-md border border-surface-secondary bg-card text-sm font-medium text-fg transition-colors duration-150 hover:border-contrast hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
          >
            Save draft
          </button>
        ) : null}
        <button
          type="button"
          onClick={onCancel}
          className="flex h-9 items-center justify-center rounded-md text-sm font-medium text-fg-muted transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Cancel
        </button>
      </div>
    </aside>
  );
}
