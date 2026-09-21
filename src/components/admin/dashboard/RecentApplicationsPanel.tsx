import { SectionHeader } from "@/components/admin/SectionHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Avatar } from "@/components/admin/Avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/admin/table";
import { recentApplications } from "@/lib/mock/applications";

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function RecentApplicationsPanel() {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Recent applications"
        actionLabel="View all"
        actionHref="/applications"
      />
      <div className="rounded-lg border border-surface-secondary bg-card p-4">
        <Table>
          <TableHead>
            <TableHeaderCell className="whitespace-nowrap">
              Candidate
            </TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Sector</TableHeaderCell>
            <TableHeaderCell className="whitespace-nowrap">
              Applied
            </TableHeaderCell>
            <TableHeaderCell className="whitespace-nowrap">
              Status
            </TableHeaderCell>
            <TableHeaderCell className="whitespace-nowrap">
              Assignee
            </TableHeaderCell>
          </TableHead>
          <TableBody>
            {recentApplications.map((application) => (
              <TableRow key={application.id}>
                <TableCell className="whitespace-nowrap font-semibold text-fg">
                  {application.candidate}
                </TableCell>
                <TableCell className="text-fg">{application.role}</TableCell>
                <TableCell className="text-fg-muted">
                  {application.sector}
                </TableCell>
                <TableCell className="whitespace-nowrap text-fg-muted">
                  {application.applied}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={application.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {application.assignee ? (
                    <span className="flex items-center gap-2">
                      <Avatar
                        initials={initialsFor(application.assignee)}
                        size="sm"
                      />
                      <span className="text-fg">{application.assignee}</span>
                    </span>
                  ) : (
                    <span className="text-fg-muted">Unassigned</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
