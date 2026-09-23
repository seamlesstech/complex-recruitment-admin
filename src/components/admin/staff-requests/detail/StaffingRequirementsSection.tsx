import { DetailCard } from "@/components/admin/detail/DetailCard";
import { DetailField } from "@/components/admin/detail/DetailField";
import type { StaffRequestRequirement } from "@/lib/staff-requests/types";
import type { StaffRequest } from "@/lib/mock/types";

export function StaffingRequirementsSection({
  request,
  requirement,
}: {
  request: StaffRequest;
  requirement: StaffRequestRequirement;
}) {
  return (
    <DetailCard title="Staffing requirements">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField label="Role">{request.requirementTitle}</DetailField>
        <DetailField label="Workers required">
          {request.quantityRequired}
        </DetailField>
        <DetailField label="Location">{request.location}</DetailField>
        <DetailField label="Start / needed by">
          {request.neededBy ?? "No date set"}
        </DetailField>
        <DetailField label="Employment type">
          {requirement.employmentType}
        </DetailField>
        <DetailField label="Work pattern">
          {requirement.workPattern}
        </DetailField>
        <DetailField label="Duration">{requirement.duration}</DetailField>
        <DetailField label="Pay / budget">{requirement.pay}</DetailField>
      </dl>
    </DetailCard>
  );
}
