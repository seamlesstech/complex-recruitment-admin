import { requireActiveProfile } from "@/lib/auth/profile";
import { getEmployerOptions, getOwnerOptions, getSectorOptions } from "@/lib/jobs/queries";
import { JobEditor } from "@/components/admin/jobs/editor/JobEditor";
import { initialJobDraft } from "@/lib/mock/job-editor";

export default async function NewJobPage() {
  const [profile, sectorOptions, employerOptions, ownerOptions] = await Promise.all([
    requireActiveProfile(),
    getSectorOptions(),
    getEmployerOptions(),
    getOwnerOptions(),
  ]);

  return (
    <JobEditor
      mode="create"
      initialDraft={{
        ...initialJobDraft,
        // The creator defaults to owning their own new job.
        owner: profile.id,
      }}
      status="Draft"
      applicationsCount={0}
      createdBy={profile.displayName}
      sectorOptions={sectorOptions}
      initialEmployerOptions={employerOptions}
      ownerOptions={ownerOptions}
    />
  );
}
