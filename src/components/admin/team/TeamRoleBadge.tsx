import type { TeamRole } from "@/lib/mock/types";

/**
 * Restrained neutral hierarchy — never colour-coded. Text carries the
 * meaning; the treatment only nudges Super Admin/Admin visual weight above
 * Recruiter/Viewer, the way StatusBadge nudges "resolved" states.
 */
const roleStyles: Record<TeamRole, string> = {
  "Super Admin": "bg-chip-strong text-chip-strong-fg",
  "Admin / Manager": "border border-contrast bg-surface-secondary text-fg",
  Recruiter: "bg-surface-secondary text-fg",
  Viewer: "border border-surface-secondary bg-card text-fg-muted",
};

export function TeamRoleBadge({ role }: { role: TeamRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}
