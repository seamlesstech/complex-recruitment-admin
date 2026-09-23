import { SectionHeader } from "@/components/admin/SectionHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { StaffRequest } from "@/lib/mock/types";

export function StaffRequestsPanel({ requests }: { requests: StaffRequest[] }) {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Recent staff requests"
        actionLabel="View all"
        actionHref="/staff-requests"
      />
      <div className="rounded-lg border border-surface-secondary bg-card">
        {requests.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-fg-muted">
            No staff requests yet.
          </p>
        ) : (
          <ul className="divide-y divide-surface-secondary">
            {requests.map((request) => (
              <li
                key={request.id}
                className="flex flex-col gap-1.5 px-4 py-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-fg">
                    {request.client}
                  </span>
                  <StatusBadge status={request.status} />
                </div>
                <span className="text-xs text-fg-muted">
                  {request.quantityRequired} {request.requirementTitle} &middot;{" "}
                  {request.neededBy ?? "No date set"}
                </span>
                <span className="text-[11px] text-fg-muted">
                  Owner: {request.owner ?? "Unassigned"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
