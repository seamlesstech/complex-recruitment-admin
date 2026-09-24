"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ContactSection } from "./ContactSection";
import { EnquirySection } from "./EnquirySection";
import { RelatedRecordSection } from "./RelatedRecordSection";
import { NotesSection } from "@/components/admin/detail/NotesSection";
import { ActivitySection } from "@/components/admin/detail/ActivitySection";
import { EnquiryDetailSidebar } from "./EnquiryDetailSidebar";
import {
  addEnquiryNoteAction,
  updateEnquiryDetailAction,
} from "@/lib/enquiries/actions";
import type {
  EnquiryDetailData,
  EnquiryRelatedRecord,
  OptionItem,
} from "@/lib/enquiries/types";
import type { EnquiryStatus } from "@/lib/mock/types";

function relatedRecordLabel(relatedRecord: EnquiryRelatedRecord): string {
  if (relatedRecord?.type === "staff-request") return "Staff Request";
  if (relatedRecord?.type === "candidate") return "Candidate";
  return "None";
}

export function EnquiryDetailView({
  detail,
  ownerOptions,
}: {
  detail: EnquiryDetailData;
  ownerOptions: OptionItem[];
}) {
  const router = useRouter();
  const { enquiry, relatedRecord, notes, activity } = detail;
  const isConverted = enquiry.status === "Converted";

  const [status, setStatus] = useState<EnquiryStatus>(enquiry.status);
  const [ownerId, setOwnerId] = useState(detail.ownerId ?? "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function handleStatusChange(next: EnquiryStatus) {
    setStatus(next);
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
    const result = await updateEnquiryDetailAction(
      enquiry.id,
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
    return addEnquiryNoteAction(enquiry.id, text);
  }

  const supportingContext = enquiry.company
    ? `${enquiry.reference} · ${enquiry.company} · ${enquiry.type} enquiry`
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
            {/* Header reflects the saved status; the rail holds the unsaved draft. */}
            <StatusBadge status={enquiry.status} />
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
          <NotesSection
            entityId={enquiry.id}
            initialNotes={notes}
            onAddNote={handleAddNote}
          />
          <ActivitySection activity={activity} />
        </div>

        <EnquiryDetailSidebar
          status={status}
          onStatusChange={handleStatusChange}
          ownerId={ownerId}
          onOwnerChange={handleOwnerChange}
          ownerOptions={ownerOptions}
          isConverted={isConverted}
          reference={enquiry.reference}
          receivedAt={enquiry.receivedAt}
          type={enquiry.type}
          source={enquiry.source}
          relatedRecordLabel={relatedRecordLabel(relatedRecord)}
          showSaveFeedback={showSaveFeedback}
          saveError={saveError}
          isSaving={isSaving}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
