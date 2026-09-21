import { Copy } from "lucide-react";
import { FormSection } from "@/components/admin/forms/FormSection";
import { FormField } from "@/components/admin/forms/FormField";
import { TextInput } from "@/components/admin/forms/TextInput";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import {
  jobClientOptions,
  jobSectorOptions,
  type JobDraftSectionProps,
} from "@/lib/mock/job-editor";

export function JobDetailsSection({
  draft,
  errors,
  onChange,
}: JobDraftSectionProps) {
  return (
    <FormSection
      title="Job details"
      description="Core information used to identify and organise the vacancy."
    >
      <FormField
        label="Job title"
        htmlFor="job-title"
        required
        error={errors.title}
      >
        <TextInput
          id="job-title"
          value={draft.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="HGV Class 1 Driver"
          hasError={Boolean(errors.title)}
          className="text-base font-medium"
        />
      </FormField>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Sector"
          htmlFor="job-sector"
          required
          error={errors.sector}
        >
          <SelectInput
            id="job-sector"
            value={draft.sector}
            onChange={(event) => onChange("sector", event.target.value)}
            hasError={Boolean(errors.sector)}
          >
            <option value="" disabled>
              Select a sector
            </option>
            {jobSectorOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField
          label="Client"
          htmlFor="job-client"
          required
          error={errors.client}
        >
          <SelectInput
            id="job-client"
            value={draft.client}
            onChange={(event) => onChange("client", event.target.value)}
            hasError={Boolean(errors.client)}
          >
            <option value="" disabled>
              Select a client
            </option>
            {jobClientOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <FormField
        label="Job reference"
        htmlFor="job-reference"
        helper="Generated automatically"
      >
        <div className="relative">
          <TextInput
            id="job-reference"
            value={draft.reference}
            readOnly
            className="cursor-default bg-surface font-medium text-fg"
          />
          <Copy
            size={15}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted"
            aria-hidden="true"
          />
        </div>
      </FormField>
    </FormSection>
  );
}
