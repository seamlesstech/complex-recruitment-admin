"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CandidateSection } from "./CandidateSection";
import { ApplicationSection } from "./ApplicationSection";
import { DocumentsSection } from "@/components/admin/detail/DocumentsSection";
import { NotesSection } from "@/components/admin/detail/NotesSection";
import { ActivitySection } from "@/components/admin/detail/ActivitySection";
import { ApplicationDetailSidebar } from "./ApplicationDetailSidebar";
import {
  applicationSourceShort,
  type ApplicationDetail,
} from "@/lib/mock/application-details";
import { resolveOwnerDisplayName } from "@/lib/mock/candidate-identity";
import type { ApplicationStatus } from "@/lib/mock/types";

export function ApplicationDetailView({ detail }: { detail: ApplicationDetail }) {
  const { application, job, candidate, vacancy, documents, notes, activity } =
    detail;

  const [status, setStatus] = useState<ApplicationStatus>(application.status);
  const [owner, setOwner] = useState(resolveOwnerDisplayName(application.owner));
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);

  function handleStatusChange(nextStatus: ApplicationStatus) {
    setStatus(nextStatus);
    setShowSaveFeedback(false);
  }

  function handleOwnerChange(nextOwner: string) {
    setOwner(nextOwner);
    setShowSaveFeedback(false);
  }

  function handleSave() {
    setShowSaveFeedback(true);
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
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-fg-muted">
            {application.reference} · {application.jobTitle}
          </p>
          <p className="text-sm text-fg-muted">
            Applied {application.appliedAt}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <CandidateSection application={application} candidate={candidate} />
          <ApplicationSection application={application} job={job} vacancy={vacancy} />
          <DocumentsSection documents={documents} />
          <NotesSection entityId={application.id} initialNotes={notes} />
          <ActivitySection activity={activity} />
        </div>

        <ApplicationDetailSidebar
          status={status}
          onStatusChange={handleStatusChange}
          owner={owner}
          onOwnerChange={handleOwnerChange}
          applicationReference={application.reference}
          appliedAt={application.appliedAt}
          source={applicationSourceShort}
          jobReference={application.jobReference}
          candidateReference={candidate.reference}
          showSaveFeedback={showSaveFeedback}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
