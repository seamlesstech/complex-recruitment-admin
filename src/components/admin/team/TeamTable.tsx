"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { resendInvitationAction } from "@/lib/team/actions";
import { useToast } from "@/components/ui/Toast";
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
  currentUserId,
  workloadByMemberId,
  canManageTeam,
}: {
  members: TeamMember[];
  /**
   * The real authenticated profile's id — "You" is computed here by
   * identity (profiles.id) against the live session, never by matching
   * display name, email text, or row position, which could mislabel a
   * different person entirely if a name/email were ever reused.
   */
  currentUserId: string;
  /** Real per-member workload, computed server-side from live owner_id data. */
  workloadByMemberId: Record<string, TeamWorkload>;
  /** Super Admin only — gates the "Resend invitation" row action. */
  canManageTeam: boolean;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [resendingId, setResendingId] = useState<string | null>(null);

  async function handleResend(member: TeamMember) {
    setResendingId(member.id);
    const result = await resendInvitationAction(member.id);
    setResendingId(null);

    if (!result.ok) {
      showToast("error", result.error);
      return;
    }
    showToast("success", "Invitation resent.");
    router.refresh();
  }

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
          {canManageTeam ? (
            <TableHeaderCell className="whitespace-nowrap">Actions</TableHeaderCell>
          ) : null}
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
                      {member.id === currentUserId ? (
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
              {canManageTeam ? (
                <TableCell className="whitespace-nowrap">
                  {member.status === "Invited" ? (
                    <button
                      type="button"
                      onClick={() => handleResend(member)}
                      disabled={resendingId === member.id}
                      className="rounded text-xs font-medium text-complex-red outline-none transition-colors duration-150 hover:text-complex-red/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {resendingId === member.id ? "Resending…" : "Resend invitation"}
                    </button>
                  ) : null}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
