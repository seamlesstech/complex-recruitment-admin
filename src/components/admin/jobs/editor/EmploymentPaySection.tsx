import { FormSection } from "@/components/admin/forms/FormSection";
import { FormField } from "@/components/admin/forms/FormField";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import {
  employmentTypeOptions,
  workPatternOptions,
  type JobDraftSectionProps,
} from "@/lib/mock/job-editor";
import { PayFields } from "./PayFields";

export function EmploymentPaySection(props: JobDraftSectionProps) {
  const { draft, errors, onChange } = props;

  return (
    <FormSection title="Employment & pay">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Employment type"
          htmlFor="job-employment-type"
          required
          error={errors.employmentType}
        >
          <SelectInput
            id="job-employment-type"
            value={draft.employmentType}
            onChange={(event) =>
              onChange(
                "employmentType",
                event.target.value as typeof draft.employmentType,
              )
            }
            hasError={Boolean(errors.employmentType)}
          >
            <option value="" disabled>
              Select employment type
            </option>
            {employmentTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField label="Work pattern" htmlFor="job-work-pattern">
          <SelectInput
            id="job-work-pattern"
            value={draft.workPattern}
            onChange={(event) =>
              onChange("workPattern", event.target.value as typeof draft.workPattern)
            }
          >
            {workPatternOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <PayFields {...props} />
    </FormSection>
  );
}
