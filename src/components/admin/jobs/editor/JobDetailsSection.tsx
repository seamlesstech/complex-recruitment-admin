"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { FormSection } from "@/components/admin/forms/FormSection";
import { FormField } from "@/components/admin/forms/FormField";
import { TextInput } from "@/components/admin/forms/TextInput";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import { createEmployerAction } from "@/lib/jobs/actions";
import type { OptionItem } from "@/lib/jobs/types";
import type { JobDraftSectionProps } from "@/lib/mock/job-editor";

const CREATE_EMPLOYER_VALUE = "__create_employer__";

interface JobDetailsSectionProps extends JobDraftSectionProps {
  sectorOptions: OptionItem[];
  employerOptions: OptionItem[];
  onEmployerCreated: (employer: OptionItem) => void;
}

export function JobDetailsSection({
  draft,
  errors,
  onChange,
  sectorOptions,
  employerOptions,
  onEmployerCreated,
}: JobDetailsSectionProps) {
  const [creatingEmployer, setCreatingEmployer] = useState(false);
  const [newEmployerName, setNewEmployerName] = useState("");
  const [newEmployerLocation, setNewEmployerLocation] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  function handleClientSelectChange(value: string) {
    if (value === CREATE_EMPLOYER_VALUE) {
      setCreatingEmployer(true);
      setCreateError(null);
      return;
    }
    onChange("client", value);
  }

  async function handleCreateEmployer() {
    if (!newEmployerName.trim()) {
      setCreateError("Employer name is required.");
      return;
    }
    setIsCreating(true);
    setCreateError(null);
    const result = await createEmployerAction(newEmployerName, newEmployerLocation);
    setIsCreating(false);

    if (!result.ok) {
      setCreateError(result.error);
      return;
    }

    onEmployerCreated(result.employer);
    onChange("client", result.employer.id);
    setCreatingEmployer(false);
    setNewEmployerName("");
    setNewEmployerLocation("");
  }

  function handleCancelCreateEmployer() {
    setCreatingEmployer(false);
    setCreateError(null);
    setNewEmployerName("");
    setNewEmployerLocation("");
  }

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
            {sectorOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
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
            onChange={(event) => handleClientSelectChange(event.target.value)}
            hasError={Boolean(errors.client)}
          >
            <option value="" disabled>
              Select a client
            </option>
            {employerOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
            <option value={CREATE_EMPLOYER_VALUE}>+ Add new employer…</option>
          </SelectInput>
        </FormField>
      </div>

      {creatingEmployer ? (
        <div className="flex flex-col gap-3 rounded-md border border-surface-secondary bg-surface p-4">
          <span className="text-sm font-medium text-fg">New employer</span>
          {createError ? (
            <p className="text-xs font-medium text-complex-red">{createError}</p>
          ) : null}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Employer name" htmlFor="new-employer-name" required>
              <TextInput
                id="new-employer-name"
                value={newEmployerName}
                onChange={(event) => setNewEmployerName(event.target.value)}
                placeholder="Acme Logistics"
              />
            </FormField>
            <FormField label="Location" htmlFor="new-employer-location">
              <TextInput
                id="new-employer-location"
                value={newEmployerLocation}
                onChange={(event) => setNewEmployerLocation(event.target.value)}
                placeholder="Birmingham"
              />
            </FormField>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreateEmployer}
              disabled={isCreating}
              className="flex h-9 items-center justify-center rounded-md bg-complex-red px-3 text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isCreating ? "Creating…" : "Create employer"}
            </button>
            <button
              type="button"
              onClick={handleCancelCreateEmployer}
              disabled={isCreating}
              className="flex h-9 items-center justify-center rounded-md px-3 text-sm font-medium text-fg-muted transition-colors duration-150 hover:text-fg"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

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
            placeholder={draft.reference ? undefined : "Generated on save"}
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
