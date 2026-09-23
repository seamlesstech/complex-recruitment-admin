import { DetailCard } from "./DetailCard";
import type { ActivityItem } from "@/lib/mock/detail-shared";

export function ActivitySection({ activity }: { activity: ActivityItem[] }) {
  return (
    <DetailCard title="Activity">
      {activity.length === 0 ? (
        <p className="text-sm text-fg-muted">No activity recorded yet.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-surface-secondary">
          {activity.map((event) => (
            <li
              key={event.id}
              className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marker-neutral"
                aria-hidden="true"
              />
              <span className="flex flex-1 flex-col gap-0.5">
                <span className="text-sm text-fg">{event.description}</span>
                <span className="text-xs text-fg-muted">{event.timestamp}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </DetailCard>
  );
}
