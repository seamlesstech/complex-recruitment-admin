import { SectionHeader } from "@/components/admin/SectionHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { recentStaffRequests } from "@/lib/mock/staff-requests";

export function StaffRequestsPanel() {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Recent staff requests"
        actionLabel="View all"
        actionHref="/staff-requests"
      />
      <div className="rounded-lg border border-surface-secondary bg-card">
        <ul className="divide-y divide-surface-secondary">
          {recentStaffRequests.map((request) => (
            <li key={request.id} className="flex flex-col gap-1.5 px-4 py-3.5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-fg">
                  {request.client}
                </span>
                <StatusBadge status={request.status} />
              </div>
              <span className="text-xs text-fg-muted">
                {request.quantityRequired} {request.requirementTitle}{" "}
                &middot; {request.neededBy ?? "No date set"}
              </span>
              <span className="text-[11px] text-fg-muted">
                Owner: {request.owner ?? "Unassigned"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
