import type {
  ApplicationStatus,
  JobStatus,
  StaffRequestStatus,
} from "@/lib/mock/types";

type Status = ApplicationStatus | StaffRequestStatus | JobStatus;

const statusStyles: Record<Status, string> = {
  New: "bg-red-tint text-complex-red",
  Reviewing: "bg-surface-secondary text-fg",
  Shortlisted: "border border-contrast bg-surface-secondary text-fg",
  Interview: "border border-surface-secondary bg-elevated text-fg",
  Offered: "border border-contrast bg-chip-strong/10 text-fg",
  Placed: "bg-chip-strong text-chip-strong-fg",
  Rejected: "bg-surface-secondary text-fg-muted",
  Withdrawn: "bg-surface-secondary text-fg-muted",
  "In progress": "bg-surface-secondary text-fg",
  Open: "bg-chip-strong text-chip-strong-fg",
  Draft: "bg-surface-secondary text-fg-muted",
  Closed: "border border-surface-secondary bg-card text-fg-muted",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
