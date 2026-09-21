import { FormSection } from "@/components/admin/forms/FormSection";
import { FormField } from "@/components/admin/forms/FormField";
import { TextInput } from "@/components/admin/forms/TextInput";
import { TextArea } from "@/components/admin/forms/TextArea";
import type { JobDraftSectionProps } from "@/lib/mock/job-editor";

export function ApplicationSettingsSection({
  draft,
  onChange,
}: JobDraftSectionProps) {
  return (
    <FormSection title="Application settings">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField
          label="Closing date"
          htmlFor="job-closing-date"
          helper={draft.closingDate ? undefined : "No closing date"}
        >
          <TextInput
            id="job-closing-date"
            type="date"
            value={draft.closingDate}
            onChange={(event) => onChange("closingDate", event.target.value)}
          />
        </FormField>

        <FormField
          label="Application method"
          htmlFor="job-application-method"
          helper="Applications submitted through the website will appear in Complex Admin."
        >
          <TextInput
            id="job-application-method"
            value="Apply through Complex Recruitment"
            readOnly
            className="cursor-default bg-surface font-medium text-fg"
          />
        </FormField>
      </div>

      <FormField
        label="Application instructions"
        htmlFor="job-application-instructions"
        helper="Optional — e.g. “Applicants must hold a valid UK Class 1 licence and CPC.”"
      >
        <TextArea
          id="job-application-instructions"
          rows={3}
          value={draft.applicationInstructions}
          onChange={(event) =>
            onChange("applicationInstructions", event.target.value)
          }
        />
      </FormField>
    </FormSection>
  );
}
