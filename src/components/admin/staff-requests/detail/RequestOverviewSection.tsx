import { DetailCard } from "@/components/admin/detail/DetailCard";
import { DetailField } from "@/components/admin/detail/DetailField";
import type { StaffRequestContact } from "@/lib/staff-requests/types";
import type { StaffRequest } from "@/lib/mock/types";

const linkClass =
  "rounded text-fg outline-none transition-colors duration-150 hover:text-complex-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red";

export function RequestOverviewSection({
  request,
  clientContact,
  source,
}: {
  request: StaffRequest;
  /** null when the request has no employer_contact_id. */
  clientContact: StaffRequestContact | null;
  source: string;
}) {
  return (
    <DetailCard title="Request overview">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField label="Client">{request.client}</DetailField>
        <DetailField label="Request reference">
          {request.reference}
        </DetailField>
        <DetailField label="Requirement">
          {request.quantityRequired} {request.requirementTitle}
        </DetailField>
        <DetailField label="Sector">{request.sector}</DetailField>
        <DetailField label="Location">{request.location}</DetailField>
        <DetailField label="Quantity required">
          {request.quantityRequired}
        </DetailField>
        <DetailField label="Needed by">
          {request.neededBy ?? "No date set"}
        </DetailField>
        <DetailField label="Urgency">{request.urgency}</DetailField>
        <DetailField label="Submitted">{request.submittedAt}</DetailField>
        <DetailField label="Source">{source}</DetailField>
      </dl>

      <div className="flex flex-col gap-3 border-t border-surface-secondary pt-4">
        <span className="text-sm font-medium text-fg">Client contact</span>
        {clientContact ? (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailField label="Contact name">{clientContact.name}</DetailField>
            {clientContact.jobTitle ? (
              <DetailField label="Job title">{clientContact.jobTitle}</DetailField>
            ) : null}
            <DetailField label="Email">
              {clientContact.email ? (
                <a href={`mailto:${clientContact.email}`} className={linkClass}>
                  {clientContact.email}
                </a>
              ) : (
                "—"
              )}
            </DetailField>
            <DetailField label="Phone">
              {clientContact.phone ? (
                <a
                  href={`tel:${clientContact.phone.replace(/\s+/g, "")}`}
                  className={linkClass}
                >
                  {clientContact.phone}
                </a>
              ) : (
                "—"
              )}
            </DetailField>
          </dl>
        ) : (
          <p className="text-sm text-fg-muted">No contact provided.</p>
        )}
      </div>
    </DetailCard>
  );
}
