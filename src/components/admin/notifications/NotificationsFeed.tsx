import Link from "next/link";
import { entityHref, entityTypeLabels } from "@/lib/mock/activity";
import type { NotificationGroup } from "@/lib/mock/notifications";
import type { Notification } from "@/lib/mock/types";

function NotificationListItem({
  notification,
  onOpen,
  onMarkAsRead,
}: {
  notification: Notification;
  onOpen: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}) {
  const isUnread = !notification.read;

  return (
    <li className="flex items-start gap-3 px-4 py-3.5">
      <span
        className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
          isUnread ? "bg-complex-red" : "bg-transparent"
        }`}
        aria-hidden="true"
      />
      <Link
        href={entityHref(notification.entityType, notification.entityId)}
        onClick={() => onOpen(notification.id)}
        className="flex min-w-0 flex-1 flex-col gap-1 rounded outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
      >
        <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span
            className={`text-sm text-fg ${
              isUnread ? "font-semibold" : "font-medium"
            }`}
          >
            {notification.title}
            {isUnread ? (
              <span className="sr-only"> (unread)</span>
            ) : null}
          </span>
          <span className="shrink-0 text-xs text-fg-muted">
            {notification.timestamp}
          </span>
        </span>
        <span className="text-sm text-fg-muted">{notification.message}</span>
        <span className="flex items-center gap-1.5 text-xs text-fg-muted">
          <span>{entityTypeLabels[notification.entityType]}</span>
          <span aria-hidden="true">&middot;</span>
          <span className="font-medium">{notification.entityReference}</span>
        </span>
      </Link>
      {isUnread ? (
        <button
          type="button"
          onClick={() => onMarkAsRead(notification.id)}
          className="shrink-0 rounded px-2 py-1 text-xs font-medium text-fg-muted outline-none transition-colors duration-150 hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Mark as read
          <span className="sr-only"> — {notification.title}</span>
        </button>
      ) : null}
    </li>
  );
}

export function NotificationsFeed({
  groups,
  onOpen,
  onMarkAsRead,
}: {
  groups: NotificationGroup[];
  onOpen: (id: string) => void;
  onMarkAsRead: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.heading} className="flex flex-col gap-2">
          <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-fg-muted/80">
            {group.heading}
          </h2>
          <ul className="divide-y divide-surface-secondary rounded-lg border border-surface-secondary bg-card">
            {group.notifications.map((notification) => (
              <NotificationListItem
                key={notification.id}
                notification={notification}
                onOpen={onOpen}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
