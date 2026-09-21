import { FormSection } from "@/components/admin/forms/FormSection";
import { FormField } from "@/components/admin/forms/FormField";
import { TextInput } from "@/components/admin/forms/TextInput";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import {
  workplaceTypeOptions,
  type JobDraftSectionProps,
} from "@/lib/mock/job-editor";

export function LocationSection({
  draft,
  errors,
  onChange,
}: JobDraftSectionProps) {
  return (
    <FormSection title="Location & working arrangement">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Location"
          htmlFor="job-location"
          required
          error={errors.location}
        >
          <TextInput
            id="job-location"
            value={draft.location}
            onChange={(event) => onChange("location", event.target.value)}
            placeholder="Birmingham"
            hasError={Boolean(errors.location)}
          />
        </FormField>

        <FormField label="Workplace type" htmlFor="job-workplace-type">
          <SelectInput
            id="job-workplace-type"
            value={draft.workplaceType}
            onChange={(event) =>
              onChange("workplaceType", event.target.value as typeof draft.workplaceType)
            }
          >
            {workplaceTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      <FormField
        label="Number of vacancies"
        htmlFor="job-vacancies"
        className="max-w-[180px]"
      >
        <TextInput
          id="job-vacancies"
          type="number"
          min={1}
          value={draft.vacancies}
          onChange={(event) =>
            onChange("vacancies", Math.max(1, Number(event.target.value) || 1))
          }
        />
      </FormField>
    </FormSection>
  );
}
