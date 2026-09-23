import { getStaffRequests } from "@/lib/staff-requests/queries";
import { getOwnerOptions, getSectorOptions } from "@/lib/lookups/queries";
import { StaffRequestsPageClient } from "@/components/admin/staff-requests/StaffRequestsPageClient";

export default async function StaffRequestsPage() {
  const [staffRequests, ownerOptions, sectorOptions] = await Promise.all([
    getStaffRequests(),
    getOwnerOptions(),
    getSectorOptions(),
  ]);

  return (
    <StaffRequestsPageClient
      staffRequests={staffRequests}
      ownerOptions={ownerOptions}
      sectorOptions={sectorOptions}
    />
  );
}
