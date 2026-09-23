import { getApplications } from "@/lib/applications/queries";
import { getOwnerOptions } from "@/lib/lookups/queries";
import { ApplicationsPageClient } from "@/components/admin/applications/ApplicationsPageClient";

export default async function ApplicationsPage() {
  const [applications, ownerOptions] = await Promise.all([
    getApplications(),
    getOwnerOptions(),
  ]);

  return (
    <ApplicationsPageClient
      applications={applications}
      ownerOptions={ownerOptions}
    />
  );
}
