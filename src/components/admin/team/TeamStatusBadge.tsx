import type { TeamMemberStatus } from "@/lib/mock/types";

/**
 * Restrained neutral treatment — deliberately not green/orange/red so this
 * doesn't read as a success/warning/danger signal ahead of real account
 * consequences being designed.
 */
const statusStyles: Record<TeamMemberStatus, string> = {
  Active: "bg-chip-strong text-chip-strong-fg",
  Invited: "border border-contrast bg-surface-secondary text-fg",
  Disabled: "bg-surface-secondary text-fg-muted",
};

export function TeamStatusBadge({ status }: { status: TeamMemberStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
