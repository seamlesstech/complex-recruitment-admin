"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { JobDetailsSection } from "./JobDetailsSection";
import { LocationSection } from "./LocationSection";
import { EmploymentPaySection } from "./EmploymentPaySection";
import { VacancyContentSection } from "./VacancyContentSection";
import { ApplicationSettingsSection } from "./ApplicationSettingsSection";
import { JobEditorSidebar } from "./JobEditorSidebar";
import { createJobAction, updateJobAction } from "@/lib/jobs/actions";
import type { OptionItem } from "@/lib/jobs/types";
import {
  formatDateDisplay,
  type JobDraft,
  type JobDraftErrors,
} from "@/lib/mock/job-editor";
import type { JobStatus } from "@/lib/mock/types";

function validateDraft(draft: JobDraft): JobDraftErrors {
  const errors: JobDraftErrors = {};
  if (!draft.title.trim()) errors.title = "Job title is required.";
  if (!draft.sector) errors.sector = "Select a sector.";
  if (!draft.client) errors.client = "Select a client.";
  if (!draft.location.trim()) errors.location = "Location is required.";
  if (!draft.employmentType) {
    errors.employmentType = "Select an employment type.";
  }
  return errors;
}

interface JobEditorProps {
  mode: "create" | "edit";
  jobId?: string;
  initialDraft: JobDraft;
  status: JobStatus;
  applicationsCount: number;
  createdBy: string;
  sectorOptions: OptionItem[];
  initialEmployerOptions: OptionItem[];
  ownerOptions: OptionItem[];
}

export function JobEditor({
  mode,
  jobId,
  initialDraft,
  status,
  applicationsCount,
  createdBy,
  sectorOptions,
  initialEmployerOptions,
  ownerOptions,
}: JobEditorProps) {
  const router = useRouter();
  const [draft, setDraft] = useState<JobDraft>(initialDraft);
  const [employerOptions, setEmployerOptions] = useState(initialEmployerOptions);
  const [showErrors, setShowErrors] = useState(false);
  const [feedback, setFeedback] = useState<"publish" | "draft" | "save" | null>(
    null,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errors = showErrors ? validateDraft(draft) : {};
  const hasErrors = Object.keys(errors).length > 0;
  const isDraftStatus = status === "Draft";
  const primaryLabel = isDraftStatus ? "Publish job" : "Save changes";

  function handleChange<K extends keyof JobDraft>(
    key: K,
    value: JobDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setFeedback(null);
    setSubmitError(null);
  }

  function handleEmployerCreated(employer: OptionItem) {
    setEmployerOptions((prev) => [...prev, employer].sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function persist(targetStatus: JobStatus, feedbackKind: "publish" | "draft" | "save") {
    setSubmitError(null);
    setIsSubmitting(true);
    const result =
      mode === "create"
        ? await createJobAction(draft, targetStatus)
        : await updateJobAction(jobId!, draft, targetStatus);
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    if (mode === "create") {
      router.push(`/jobs/${result.id}/edit`);
      return;
    }

    setFeedback(feedbackKind);
    router.refresh();
  }

  function handlePrimary() {
    const validationErrors = validateDraft(draft);
    setShowErrors(true);
    if (Object.keys(validationErrors).length > 0) {
      setFeedback(null);
      return;
    }
    void persist(isDraftStatus ? "Open" : status, isDraftStatus ? "publish" : "save");
  }

  function handleSaveDraft() {
    const validationErrors = validateDraft(draft);
    setShowErrors(true);
    if (Object.keys(validationErrors).length > 0) {
      setFeedback(null);
      return;
    }
    void persist("Draft", "draft");
  }

  function handleCancel() {
    router.push("/jobs");
  }

  const headerTitle = mode === "create" ? "Create job" : "Edit job";
  const headerDescription =
    mode === "create"
      ? "Create and prepare a vacancy for publication."
      : "Update vacancy details, ownership and publication settings.";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/jobs"
          className="flex w-fit items-center gap-1.5 rounded text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          <ArrowLeft size={16} />
          Jobs
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            {headerTitle}
          </h1>
          <p className="text-sm text-fg-muted">{headerDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {(showErrors && hasErrors) || submitError ? (
            <div className="flex items-center gap-2 rounded-md border border-red-line bg-red-tint px-4 py-3 text-sm font-medium text-complex-red">
              <AlertCircle size={16} className="shrink-0" />
              {submitError ??
                `Please complete the required fields before ${
                  isDraftStatus ? "publishing" : "saving"
                }.`}
            </div>
          ) : null}

          <JobDetailsSection
            draft={draft}
            errors={errors}
            onChange={handleChange}
            sectorOptions={sectorOptions}
            employerOptions={employerOptions}
            onEmployerCreated={handleEmployerCreated}
          />
          <LocationSection
            draft={draft}
            errors={errors}
            onChange={handleChange}
          />
          <EmploymentPaySection
            draft={draft}
            errors={errors}
            onChange={handleChange}
          />
          <VacancyContentSection
            draft={draft}
            errors={errors}
            onChange={handleChange}
          />
          <ApplicationSettingsSection
            draft={draft}
            errors={errors}
            onChange={handleChange}
          />
        </div>

        <JobEditorSidebar
          reference={draft.reference}
          status={status}
          applicationsCount={applicationsCount}
          createdBy={createdBy}
          owner={draft.owner}
          onOwnerChange={(owner) => handleChange("owner", owner)}
          ownerOptions={ownerOptions}
          publishOnWebsite={draft.publishOnWebsite}
          onPublishToggle={(value) => handleChange("publishOnWebsite", value)}
          closingDate={formatDateDisplay(draft.closingDate)}
          feedback={feedback}
          primaryLabel={primaryLabel}
          onPrimary={handlePrimary}
          showSaveDraft={isDraftStatus}
          onSaveDraft={handleSaveDraft}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}
