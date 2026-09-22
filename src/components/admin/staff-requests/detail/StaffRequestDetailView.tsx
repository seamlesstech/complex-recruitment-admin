"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { RequestOverviewSection } from "./RequestOverviewSection";
import { StaffingRequirementsSection } from "./StaffingRequirementsSection";
import { FulfilmentSection } from "./FulfilmentSection";
import { RelatedJobsSection } from "./RelatedJobsSection";
import { NotesSection } from "@/components/admin/detail/NotesSection";
import { ActivitySection } from "@/components/admin/detail/ActivitySection";
import { StaffRequestDetailSidebar } from "./StaffRequestDetailSidebar";
import { resolveOwnerDisplayName } from "@/lib/mock/candidate-identity";
import type { StaffRequestDetail } from "@/lib/mock/staff-request-details";
import type { StaffRequestStatus, StaffRequestUrgency } from "@/lib/mock/types";

export function StaffRequestDetailView({
  detail,
}: {
  detail: StaffRequestDetail;
}) {
  const { request, clientContact, requirement, relatedJobs, notes, activity } =
    detail;

  const [status, setStatus] = useState<StaffRequestStatus>(request.status);
  const [owner, setOwner] = useState(resolveOwnerDisplayName(request.owner));
  const [urgency, setUrgency] = useState<StaffRequestUrgency>(
    request.urgency,
  );
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);

  function handleStatusChange(next: StaffRequestStatus) {
    setStatus(next);
    setShowSaveFeedback(false);
  }

  function handleOwnerChange(next: string) {
    setOwner(next);
    setShowSaveFeedback(false);
  }

  function handleUrgencyChange(next: StaffRequestUrgency) {
    setUrgency(next);
    setShowSaveFeedback(false);
  }

  function handleSave() {
    setShowSaveFeedback(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/staff-requests"
          className="flex w-fit items-center gap-1.5 rounded text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          <ArrowLeft size={16} />
          Staff requests
        </Link>

        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">
              {request.client}
            </h1>
            <StatusBadge status={status} />
            {urgency === "Urgent" ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-complex-red">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-complex-red"
                  aria-hidden="true"
                />
                Urgent
              </span>
            ) : null}
          </div>
          <p className="text-sm text-fg-muted">
            {request.reference} · {request.quantityRequired}{" "}
            {request.requirementTitle}
          </p>
          <p className="text-sm text-fg-muted">
            Submitted {request.submittedAt}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <RequestOverviewSection
            request={request}
            clientContact={clientContact}
            source={requirement.source}
          />
          <StaffingRequirementsSection
            request={request}
            requirement={requirement}
          />
          <FulfilmentSection request={request} />
          <RelatedJobsSection jobs={relatedJobs} />
          <NotesSection entityId={request.id} initialNotes={notes} />
          <ActivitySection activity={activity} />
        </div>

        <StaffRequestDetailSidebar
          status={status}
          onStatusChange={handleStatusChange}
          owner={owner}
          onOwnerChange={handleOwnerChange}
          urgency={urgency}
          onUrgencyChange={handleUrgencyChange}
          reference={request.reference}
          submittedAt={request.submittedAt}
          quantityRequired={request.quantityRequired}
          quantityFilled={request.quantityFilled}
          neededBy={request.neededBy ?? "No date set"}
          showSaveFeedback={showSaveFeedback}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
