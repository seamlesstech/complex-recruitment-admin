import { getJobs, getOwnerOptions, getSectorOptions } from "@/lib/jobs/queries";
import { JobsPageClient } from "@/components/admin/jobs/JobsPageClient";

export default async function JobsPage() {
  const [jobs, sectorOptions, ownerOptions] = await Promise.all([
    getJobs(),
    getSectorOptions(),
    getOwnerOptions(),
  ]);

  return (
    <JobsPageClient
      jobs={jobs}
      sectorOptions={sectorOptions}
      ownerOptions={ownerOptions}
    />
  );
}
