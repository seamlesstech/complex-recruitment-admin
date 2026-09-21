import { StatusBadge } from "@/components/admin/StatusBadge";
import { OwnerDisplay } from "@/components/admin/OwnerDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/admin/table";
import type { CandidateApplication } from "@/lib/mock/types";

export function ApplicationsTable({
  applications,
}: {
  applications: CandidateApplication[];
}) {
  return (
    <div className="rounded-lg border border-surface-secondary bg-card p-4">
      <Table minWidthClassName="min-w-[840px]">
        <TableHead>
          <TableHeaderCell>Candidate</TableHeaderCell>
          <TableHeaderCell>Applied for</TableHeaderCell>
          <TableHeaderCell className="whitespace-nowrap">
            Applied
          </TableHeaderCell>
          <TableHeaderCell>Owner</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
        </TableHead>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {application.unread ? (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-complex-red"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="w-1.5 shrink-0" aria-hidden="true" />
                  )}
                  <div className="flex flex-col">
                    <span
                      className={`text-fg ${
                        application.unread ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {application.candidateName}
                    </span>
                    <span className="text-xs text-fg-muted">
                      {application.reference}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex flex-col">
                  <span className="text-fg">{application.jobTitle}</span>
                  <span className="text-xs text-fg-muted">
                    {application.client}
                  </span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {application.appliedAt}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <OwnerDisplay owner={application.owner} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <StatusBadge status={application.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
