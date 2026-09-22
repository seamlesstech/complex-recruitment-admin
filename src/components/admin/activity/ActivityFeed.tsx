import Link from "next/link";
import { ActorAvatar } from "./ActorAvatar";
import { entityHref, entityTypeLabels, type ActivityGroup } from "@/lib/mock/activity";
import type { ActivityEvent } from "@/lib/mock/types";

function ActivityListItem({ event }: { event: ActivityEvent }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <ActorAvatar actor={event.actor} />
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-sm text-fg">
          <span className="font-medium">{event.actor}</span> {event.action}{" "}
          <span className="font-medium">{event.entityLabel}</span>
          {event.detail ? ` ${event.detail}` : ""}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-fg-muted">
          <span>{entityTypeLabels[event.entityType]}</span>
          <span aria-hidden="true">&middot;</span>
          <Link
            href={entityHref(event.entityType, event.entityId)}
            className="rounded font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-complex-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
          >
            {event.entityReference}
          </Link>
          <span aria-hidden="true">&middot;</span>
          <span>{event.timestamp}</span>
        </div>
      </div>
    </li>
  );
}

export function ActivityFeed({ groups }: { groups: ActivityGroup[] }) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.heading} className="flex flex-col gap-2">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-fg-muted/80">
            {group.heading}
          </h2>
          <ul className="divide-y divide-surface-secondary rounded-lg border border-surface-secondary bg-card">
            {group.events.map((event) => (
              <ActivityListItem key={event.id} event={event} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
