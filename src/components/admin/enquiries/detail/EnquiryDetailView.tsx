"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ContactSection } from "./ContactSection";
import { EnquirySection } from "./EnquirySection";
import { RelatedRecordSection } from "./RelatedRecordSection";
import { NotesSection } from "@/components/admin/detail/NotesSection";
import { ActivitySection } from "@/components/admin/detail/ActivitySection";
import { EnquiryDetailSidebar } from "./EnquiryDetailSidebar";
import { resolveOwnerDisplayName } from "@/lib/mock/candidate-identity";
import type { EnquiryDetail } from "@/lib/mock/enquiry-details";
import type { EnquiryStatus } from "@/lib/mock/types";

function relatedRecordLabel(
  relatedRecord: EnquiryDetail["relatedRecord"],
): string {
  if (relatedRecord?.type === "staff-request") return "Staff Request";
  if (relatedRecord?.type === "candidate") return "Candidate";
  return "None";
}

export function EnquiryDetailView({ detail }: { detail: EnquiryDetail }) {
  const { enquiry, relatedRecord, notes, activity } = detail;

  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [owner, setOwner] = useState(resolveOwnerDisplayName(enquiry.owner));
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);

  function handleStatusChange(next: EnquiryStatus) {
    setStatus(next);
    setShowSaveFeedback(false);
  }

  function handleOwnerChange(next: string) {
    setOwner(next);
    setShowSaveFeedback(false);
  }

  function handleSave() {
    setShowSaveFeedback(true);
  }

  const supportingContext = enquiry.company
    ? `${enquiry.reference} · ${enquiry.company}`
    : `${enquiry.reference} · ${enquiry.type} enquiry`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Link
          href="/enquiries"
          className="flex w-fit items-center gap-1.5 rounded text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          <ArrowLeft size={16} />
          Enquiries
        </Link>

        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-fg">
              {enquiry.contactName}
            </h1>
            <StatusBadge status={status} />
          </div>
          <p className="text-sm text-fg-muted">{supportingContext}</p>
          <p className="text-sm text-fg-muted">
            Received {enquiry.receivedAt}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <ContactSection enquiry={enquiry} />
          <EnquirySection enquiry={enquiry} />
          <RelatedRecordSection relatedRecord={relatedRecord} />
          <NotesSection entityId={enquiry.id} initialNotes={notes} />
          <ActivitySection activity={activity} />
        </div>

        <EnquiryDetailSidebar
          status={status}
          onStatusChange={handleStatusChange}
          owner={owner}
          onOwnerChange={handleOwnerChange}
          reference={enquiry.reference}
          receivedAt={enquiry.receivedAt}
          type={enquiry.type}
          source={enquiry.source}
          relatedRecordLabel={relatedRecordLabel(relatedRecord)}
          showSaveFeedback={showSaveFeedback}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
