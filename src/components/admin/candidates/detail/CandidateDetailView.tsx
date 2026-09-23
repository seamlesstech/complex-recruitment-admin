"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CandidateProfileSection } from "./CandidateProfileSection";
import { ApplicationHistorySection } from "./ApplicationHistorySection";
import { DocumentsSection } from "@/components/admin/detail/DocumentsSection";
import { NotesSection } from "@/components/admin/detail/NotesSection";
import { ActivitySection } from "@/components/admin/detail/ActivitySection";
import { CandidateDetailSidebar } from "./CandidateDetailSidebar";
import { addCandidateNoteAction, updateCandidateDetailAction } from "@/lib/candidates/actions";
import type { CandidateDetailData, OptionItem } from "@/lib/candidates/types";
import type { CandidateAvailability } from "@/lib/mock/types";

export function CandidateDetailView({
  detail,
  ownerOptions,
}: {
  detail: CandidateDetailData;
  ownerOptions: OptionItem[];
}) {
  const router = useRouter();
  const { candidate, registeredLabel, applications, documents, notes, activity } = detail;

  const [availability, setAvailability] = useState<CandidateAvailability>(
    candidate.availability,
  );
  const [ownerId, setOwnerId] = useState(detail.ownerId ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function handleAvailabilityChange(next: CandidateAvailability) {
    setAvailability(next);
    setShowSaveFeedback(false);
    setSaveError(null);
  }

  function handleOwnerChange(next: string) {
    setOwnerId(next);
    setShowSaveFeedback(false);
    setSaveError(null);
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);
    const result = await updateCandidateDetailAction(
      candidate.id,
      availability,
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
    return addCandidateNoteAction(candidate.id, text);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/candidates"
          className="flex w-fit items-center gap-1.5 rounded text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          <ArrowLeft size={16} />
          Candidates
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            {candidate.name}
          </h1>
          <p className="text-sm text-fg-muted">{candidate.reference}</p>
          <p className="text-sm text-fg-muted">
            {candidate.location} · {candidate.sector}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <CandidateProfileSection
            candidate={candidate}
            registeredLabel={registeredLabel}
          />
          <ApplicationHistorySection applications={applications} />
          <DocumentsSection documents={documents} />
          <NotesSection
            entityId={candidate.id}
            initialNotes={notes}
            onAddNote={handleAddNote}
          />
          <ActivitySection activity={activity} />
        </div>

        <CandidateDetailSidebar
          availability={availability}
          onAvailabilityChange={handleAvailabilityChange}
          ownerId={ownerId}
          onOwnerChange={handleOwnerChange}
          ownerOptions={ownerOptions}
          candidateReference={candidate.reference}
          registeredLabel={registeredLabel}
          applicationCount={applications.length}
          sector={candidate.sector}
          location={candidate.location}
          showSaveFeedback={showSaveFeedback}
          saveError={saveError}
          isSaving={isSaving}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
