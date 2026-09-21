import { FormField } from "@/components/admin/forms/FormField";
import { TextInput } from "@/components/admin/forms/TextInput";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import {
  formatPayPreview,
  payTypeOptions,
  type JobDraftSectionProps,
} from "@/lib/mock/job-editor";

export function PayFields({ draft, onChange }: JobDraftSectionProps) {
  const showRange = draft.payType !== "Negotiable";

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <FormField label="Pay type" htmlFor="job-pay-type">
          <SelectInput
            id="job-pay-type"
            value={draft.payType}
            onChange={(event) =>
              onChange("payType", event.target.value as typeof draft.payType)
            }
          >
            {payTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </FormField>

        {showRange ? (
          <>
            <FormField label="Pay from" htmlFor="job-pay-from">
              <TextInput
                id="job-pay-from"
                value={draft.payFrom}
                onChange={(event) => onChange("payFrom", event.target.value)}
                placeholder="£17.50"
              />
            </FormField>
            <FormField label="Pay to" htmlFor="job-pay-to">
              <TextInput
                id="job-pay-to"
                value={draft.payTo}
                onChange={(event) => onChange("payTo", event.target.value)}
                placeholder="£21.00"
              />
            </FormField>
          </>
        ) : null}
      </div>

      <div className="rounded-md bg-surface px-3 py-2.5 text-sm text-fg">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          Public preview{" "}
        </span>
        <span className="ml-1">{formatPayPreview(draft)}</span>
      </div>
    </div>
  );
}
