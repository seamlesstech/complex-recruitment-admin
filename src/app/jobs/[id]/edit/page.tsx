import Link from "next/link";
import { JobEditor } from "@/components/admin/jobs/editor/JobEditor";
import { buildJobDraftFromJob } from "@/lib/mock/job-details";
import { jobs } from "@/lib/mock/jobs";

export default async function EditJobPage({
  params,
}: PageProps<"/jobs/[id]/edit">) {
  const { id } = await params;
  const job = jobs.find((candidate) => candidate.id === id);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-surface-secondary bg-card px-6 py-20 text-center">
        <p className="text-sm font-semibold text-fg">Job not found</p>
        <p className="text-sm text-fg-muted">
          The vacancy you&rsquo;re looking for could not be found.
        </p>
        <Link
          href="/jobs"
          className="mt-2 rounded text-sm font-medium text-complex-red outline-none transition-colors duration-150 hover:text-complex-red/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Back to jobs
        </Link>
      </div>
    );
  }

  const { draft, createdBy } = buildJobDraftFromJob(job);

  return (
    <JobEditor
      mode="edit"
      initialDraft={draft}
      status={job.status}
      applicationsCount={job.applicationsCount}
      createdBy={createdBy}
    />
  );
}
