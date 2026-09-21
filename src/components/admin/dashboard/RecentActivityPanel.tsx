import { SectionHeader } from "@/components/admin/SectionHeader";
import { recentActivity } from "@/lib/mock/activity";

export function RecentActivityPanel() {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader
        title="Recent activity"
        actionLabel="View all"
        actionHref="/activity"
      />
      <div className="rounded-lg border border-surface-secondary bg-card">
        <ul className="divide-y divide-surface-secondary">
          {recentActivity.map((event) => (
            <li key={event.id} className="flex items-start gap-3 px-4 py-3.5">
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marker-neutral"
                aria-hidden="true"
              />
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm text-fg">
                  <span className="font-medium">{event.actor}</span>{" "}
                  {event.action}{" "}
                  <span className="font-medium">{event.target}</span>
                </span>
                <span className="text-xs text-fg-muted">
                  {event.timestamp}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
