import Link from "next/link";
import { DetailCard } from "@/components/admin/detail/DetailCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Job } from "@/lib/mock/types";

export function RelatedJobsSection({ jobs }: { jobs: Job[] }) {
  return (
    <DetailCard title="Related jobs">
      {jobs.length > 0 ? (
        <ul className="divide-y divide-surface-secondary">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-fg">
                  {job.title}
                </span>
                <span className="text-xs text-fg-muted">
                  {job.reference} &middot; {job.applicationsCount}{" "}
                  {job.applicationsCount === 1
                    ? "application"
                    : "applications"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={job.status} />
                <Link
                  href={`/jobs/${job.id}/edit`}
                  className="shrink-0 rounded text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
                >
                  Open job
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-surface-secondary bg-surface px-6 py-10 text-center">
          <p className="text-sm font-semibold text-fg">No related jobs</p>
          <p className="text-sm text-fg-muted">
            No vacancy has been linked to this staff request yet.
          </p>
        </div>
      )}
    </DetailCard>
  );
}
