import { Info } from "lucide-react";
import { FormField } from "@/components/admin/forms/FormField";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import { assignedRecruiterDetailOptions } from "@/lib/mock/application-details";
import { candidateAvailabilityFilterOptions } from "@/lib/mock/candidates";
import type { CandidateAvailability } from "@/lib/mock/types";

const availabilityOptions = candidateAvailabilityFilterOptions.filter(
  (option): option is CandidateAvailability => option !== "All availability",
);

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="font-medium text-fg">{value}</span>
    </div>
  );
}

interface CandidateDetailSidebarProps {
  availability: CandidateAvailability;
  onAvailabilityChange: (availability: CandidateAvailability) => void;
  owner: string;
  onOwnerChange: (owner: string) => void;
  candidateReference: string;
  registeredLabel: string;
  applicationCount: number;
  sector: string;
  location: string;
  showSaveFeedback: boolean;
  onSave: () => void;
}

export function CandidateDetailSidebar({
  availability,
  onAvailabilityChange,
  owner,
  onOwnerChange,
  candidateReference,
  registeredLabel,
  applicationCount,
  sector,
  location,
  showSaveFeedback,
  onSave,
}: CandidateDetailSidebarProps) {
  return (
    <aside className="flex flex-col gap-5 rounded-lg border border-surface-secondary bg-card p-5 xl:sticky xl:top-[76px]">
      <FormField label="Availability" htmlFor="candidate-availability">
        <SelectInput
          id="candidate-availability"
          value={availability}
          onChange={(event) =>
            onAvailabilityChange(event.target.value as CandidateAvailability)
          }
        >
          {availabilityOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </SelectInput>
      </FormField>

      <div className="flex flex-col gap-1.5 border-t border-surface-secondary pt-5">
        <FormField label="Assigned recruiter" htmlFor="candidate-owner">
          <SelectInput
            id="candidate-owner"
            value={owner}
            onChange={(event) => onOwnerChange(event.target.value)}
          >
            {assignedRecruiterDetailOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <div className="flex flex-col gap-2 border-t border-surface-secondary pt-5">
        <span className="mb-1 text-sm font-medium text-fg">
          Candidate summary
        </span>
        <SummaryRow label="Candidate" value={candidateReference} />
        <SummaryRow label="Registered" value={registeredLabel} />
        <SummaryRow label="Applications" value={String(applicationCount)} />
        <SummaryRow label="Sector" value={sector} />
        <SummaryRow label="Location" value={location} />
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
