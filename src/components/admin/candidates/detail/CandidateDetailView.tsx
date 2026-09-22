"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CandidateProfileSection } from "./CandidateProfileSection";
import { ApplicationHistorySection } from "./ApplicationHistorySection";
import { DocumentsSection } from "@/components/admin/detail/DocumentsSection";
import { NotesSection } from "@/components/admin/detail/NotesSection";
import { ActivitySection } from "@/components/admin/detail/ActivitySection";
import { CandidateDetailSidebar } from "./CandidateDetailSidebar";
import { resolveOwnerDisplayName } from "@/lib/mock/candidate-identity";
import type { CandidateDetail } from "@/lib/mock/candidate-details";
import type { CandidateAvailability } from "@/lib/mock/types";

export function CandidateDetailView({ detail }: { detail: CandidateDetail }) {
  const {
    candidate,
    registeredLabel,
    applications,
    documents,
    notes,
    activity,
  } = detail;

  const [availability, setAvailability] = useState<CandidateAvailability>(
    candidate.availability,
  );
  const [owner, setOwner] = useState(resolveOwnerDisplayName(candidate.owner));
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);

  function handleAvailabilityChange(next: CandidateAvailability) {
    setAvailability(next);
    setShowSaveFeedback(false);
  }

  function handleOwnerChange(next: string) {
    setOwner(next);
    setShowSaveFeedback(false);
  }

  function handleSave() {
    setShowSaveFeedback(true);
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
          <NotesSection entityId={candidate.id} initialNotes={notes} />
          <ActivitySection activity={activity} />
        </div>

        <CandidateDetailSidebar
          availability={availability}
          onAvailabilityChange={handleAvailabilityChange}
          owner={owner}
          onOwnerChange={handleOwnerChange}
          candidateReference={candidate.reference}
          registeredLabel={registeredLabel}
          applicationCount={applications.length}
          sector={candidate.sector}
          location={candidate.location}
          showSaveFeedback={showSaveFeedback}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
