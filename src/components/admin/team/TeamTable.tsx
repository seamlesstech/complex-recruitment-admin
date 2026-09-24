import { Avatar } from "@/components/admin/Avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/admin/table";
import type { TeamWorkload } from "@/lib/team/types";
import type { TeamMember } from "@/lib/mock/types";
import { TeamRoleBadge } from "./TeamRoleBadge";
import { TeamStatusBadge } from "./TeamStatusBadge";

function workloadLines(workload: TeamWorkload): [string | null, string | null] {
  if (workload.total === 0) return [null, null];

  const parts: string[] = [];
  if (workload.jobs > 0) parts.push(`${workload.jobs} job${workload.jobs === 1 ? "" : "s"}`);
  if (workload.applications > 0) {
    parts.push(
      `${workload.applications} application${workload.applications === 1 ? "" : "s"}`,
    );
  }

  const secondaryParts: string[] = [];
  if (workload.staffRequests > 0) {
    secondaryParts.push(
      `${workload.staffRequests} staff request${workload.staffRequests === 1 ? "" : "s"}`,
    );
  }
  if (workload.enquiries > 0) {
    secondaryParts.push(
      `${workload.enquiries} enquir${workload.enquiries === 1 ? "y" : "ies"}`,
    );
  }

  return [
    parts.length > 0 ? parts.join(" · ") : null,
    secondaryParts.length > 0 ? secondaryParts.join(" · ") : null,
  ];
}

function WorkloadCell({ workload }: { workload: TeamWorkload | undefined }) {
  if (!workload) {
    return <span className="text-fg-muted">No active assignments</span>;
  }
  const [primary, secondary] = workloadLines(workload);

  if (!primary && !secondary) {
    return <span className="text-fg-muted">No active assignments</span>;
  }

  return (
    <div className="flex flex-col">
      {primary ? <span className="text-fg">{primary}</span> : null}
      {secondary ? (
        <span className="text-xs text-fg-muted">{secondary}</span>
      ) : null}
    </div>
  );
}

export function TeamTable({
  members,
  currentUserEmail,
  workloadByMemberId,
}: {
  members: TeamMember[];
  /**
   * The real authenticated profile's email — the mock dataset's own
   * `isCurrentUser` flag is a static seed value and would silently go stale
   * the moment a different real account logs in, so "You" is computed here
   * against the live session instead of trusted from the mock record.
   */
  currentUserEmail: string;
  /** Real per-member workload, computed server-side from live owner_id data. */
  workloadByMemberId: Record<string, TeamWorkload>;
}) {
  return (
    <div className="rounded-lg border border-surface-secondary bg-card p-4">
      <Table minWidthClassName="min-w-[840px]">
        <TableHead>
          <TableHeaderCell>Member</TableHeaderCell>
          <TableHeaderCell>Role</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell>Workload</TableHeaderCell>
          <TableHeaderCell className="whitespace-nowrap">
            Last active
          </TableHeaderCell>
        </TableHead>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <Avatar initials={member.initials} size="sm" />
                  <div className="flex flex-col">
                    <span className="flex items-center gap-1.5 font-medium text-fg">
                      {member.name}
                      {member.email.toLowerCase() ===
                      currentUserEmail.toLowerCase() ? (
                        <span className="text-xs font-normal text-fg-muted">
                          · You
                        </span>
                      ) : null}
                    </span>
                    <span className="text-xs text-fg-muted">
                      {member.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <TeamRoleBadge role={member.role} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <TeamStatusBadge status={member.status} />
              </TableCell>
              <TableCell>
                <WorkloadCell workload={workloadByMemberId[member.id]} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {member.lastActive}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
