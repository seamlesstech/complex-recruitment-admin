import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/admin/table";
import type { Job } from "@/lib/mock/types";
import { OwnerDisplay } from "@/components/admin/OwnerDisplay";
import { RowActionMenu } from "./RowActionMenu";

export function JobsTable({ jobs }: { jobs: Job[] }) {
  return (
    <div className="rounded-lg border border-surface-secondary bg-card p-4">
      <Table minWidthClassName="min-w-[920px]">
        <TableHead>
          <TableHeaderCell>Job</TableHeaderCell>
          <TableHeaderCell className="whitespace-nowrap">
            Client
          </TableHeaderCell>
          <TableHeaderCell>Sector</TableHeaderCell>
          <TableHeaderCell>Location</TableHeaderCell>
          <TableHeaderCell>Owner</TableHeaderCell>
          <TableHeaderCell className="whitespace-nowrap">
            Applications
          </TableHeaderCell>
          <TableHeaderCell>Closing</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="w-10">
            <span className="sr-only">Actions</span>
          </TableHeaderCell>
        </TableHead>
        <TableBody>
          {jobs.map((job) => (
            <TableRow key={job.id}>
              <TableCell className="whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="font-semibold text-fg">{job.title}</span>
                  <span className="text-xs text-fg-muted">
                    {job.reference}
                  </span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg">
                {job.client}
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {job.sector}
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {job.location}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <OwnerDisplay owner={job.owner} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span
                  className={
                    job.applicationsCount === 0
                      ? "text-fg-muted"
                      : "font-medium text-fg"
                  }
                >
                  {job.applicationsCount}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {job.closingDate ? (
                  <span
                    className={`flex items-center gap-1.5 ${
                      job.closingSoon
                        ? "font-medium text-complex-red"
                        : "text-fg"
                    }`}
                  >
                    {job.closingSoon ? (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-complex-red"
                        aria-hidden="true"
                      />
                    ) : null}
                    {job.closingDate}
                  </span>
                ) : (
                  <span className="text-fg-muted">No closing date</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <StatusBadge status={job.status} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <RowActionMenu status={job.status} jobId={job.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
