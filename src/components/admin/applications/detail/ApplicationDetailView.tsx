"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CandidateSection } from "./CandidateSection";
import { ApplicationSection } from "./ApplicationSection";
import { DocumentsSection } from "@/components/admin/detail/DocumentsSection";
import { NotesSection } from "@/components/admin/detail/NotesSection";
import { ActivitySection } from "@/components/admin/detail/ActivitySection";
import { ApplicationDetailSidebar } from "./ApplicationDetailSidebar";
import {
  addApplicationNoteAction,
  updateApplicationDetailAction,
} from "@/lib/applications/actions";
import type { ApplicationDetailData, OptionItem } from "@/lib/applications/types";
import type { ApplicationStatus } from "@/lib/mock/types";

export function ApplicationDetailView({
  detail,
  ownerOptions,
}: {
  detail: ApplicationDetailData;
  ownerOptions: OptionItem[];
}) {
  const router = useRouter();
  const { application, candidate, vacancy, documents, notes, activity } = detail;

  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [ownerId, setOwnerId] = useState(detail.ownerId ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function handleStatusChange(nextStatus: ApplicationStatus) {
    setStatus(nextStatus);
    setShowSaveFeedback(false);
    setSaveError(null);
  }

  function handleOwnerChange(nextOwnerId: string) {
    setOwnerId(nextOwnerId);
    setShowSaveFeedback(false);
    setSaveError(null);
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    const result = await updateApplicationDetailAction(
      application.id,
      status,
      ownerId || null,
    );
    setIsSaving(false);

    if (!result.ok) {
      setSaveError(result.error);
      return;
    }
    setShowSaveFeedback(true);
    router.refresh();
  }

  async function handleAddNote(text: string) {
    return addApplicationNoteAction(application.id, text);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/applications"
          className="flex w-fit items-center gap-1.5 rounded text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          <ArrowLeft size={16} />
          Applications
        </Link>

        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">
              {application.candidateName}
            </h1>
            {/* The badge shows the persisted status; the rail's select is the unsaved draft. */}
            <StatusBadge status={application.status} />
          </div>
          <p className="text-sm text-fg-muted">
            {application.reference} · {application.jobTitle}
          </p>
          <p className="text-sm text-fg-muted">
            Applied {detail.submittedLabel}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <CandidateSection candidate={candidate} />
          <ApplicationSection
            application={application}
            vacancy={vacancy}
            source={detail.source}
          />
          <DocumentsSection documents={documents} />
          <NotesSection
            entityId={application.id}
            initialNotes={notes}
            onAddNote={handleAddNote}
          />
          <ActivitySection activity={activity} />
        </div>

        <ApplicationDetailSidebar
          status={status}
          onStatusChange={handleStatusChange}
          ownerId={ownerId}
          onOwnerChange={handleOwnerChange}
          ownerOptions={ownerOptions}
          applicationReference={application.reference}
          appliedAt={application.appliedAt}
          source={detail.source}
          jobReference={application.jobReference}
          candidateReference={candidate.reference}
          showSaveFeedback={showSaveFeedback}
          saveError={saveError}
          isSaving={isSaving}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
