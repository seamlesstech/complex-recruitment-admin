import { FormSection } from "@/components/admin/forms/FormSection";
import { FormField } from "@/components/admin/forms/FormField";
import { TextArea } from "@/components/admin/forms/TextArea";
import type { JobDraftSectionProps } from "@/lib/mock/job-editor";

export function VacancyContentSection({
  draft,
  onChange,
}: JobDraftSectionProps) {
  return (
    <FormSection
      title="Vacancy content"
      description="This may later appear on the public Complex Recruitment website."
    >
      <FormField
        label="Job summary"
        htmlFor="job-summary"
        helper="A concise introduction shown near the top of the vacancy. Around 200–300 characters."
      >
        <TextArea
          id="job-summary"
          rows={3}
          value={draft.summary}
          onChange={(event) => onChange("summary", event.target.value)}
        />
        <p className="text-right text-[11px] text-fg-muted">
          {draft.summary.length} characters
        </p>
      </FormField>

      <FormField
        label="Job description"
        htmlFor="job-description"
        helper="Describe the role, day-to-day responsibilities and working environment."
      >
        <TextArea
          id="job-description"
          rows={7}
          value={draft.description}
          onChange={(event) => onChange("description", event.target.value)}
        />
      </FormField>

      <FormField
        label="Responsibilities"
        htmlFor="job-responsibilities"
        helper="List the main responsibilities for the role."
      >
        <TextArea
          id="job-responsibilities"
          rows={5}
          value={draft.responsibilities}
          onChange={(event) =>
            onChange("responsibilities", event.target.value)
          }
        />
      </FormField>

      <FormField
        label="Requirements"
        htmlFor="job-requirements"
        helper="Include required experience, licences, qualifications or skills."
      >
        <TextArea
          id="job-requirements"
          rows={5}
          value={draft.requirements}
          onChange={(event) => onChange("requirements", event.target.value)}
        />
      </FormField>

      <FormField
        label="Benefits / additional information"
        htmlFor="job-benefits"
        helper="Optional — overtime, weekly pay, ongoing work, training, progression."
      >
        <TextArea
          id="job-benefits"
          rows={3}
          value={draft.benefits}
          onChange={(event) => onChange("benefits", event.target.value)}
        />
      </FormField>
    </FormSection>
  );
}
