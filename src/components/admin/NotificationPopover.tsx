"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { entityHref } from "@/lib/mock/activity";
import { recentNotifications } from "@/lib/mock/notifications";
import type { ActivityEntityType } from "@/lib/mock/types";
import { useNotifications } from "./notifications/NotificationsProvider";

const DROPDOWN_PREVIEW_COUNT = 5;

export function NotificationPopover() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { notifications, unreadCount, markAsRead } = useNotifications();

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const preview = recentNotifications(notifications, DROPDOWN_PREVIEW_COUNT);

  function openNotification(
    id: string,
    entityType: ActivityEntityType,
    entityId: string,
  ) {
    markAsRead(id);
    setOpen(false);
    router.push(entityHref(entityType, entityId));
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className={`relative flex h-9 w-9 items-center justify-center rounded-md border outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red ${
          open
            ? "border-red-line bg-red-tint text-fg"
            : "border-transparent text-fg-muted hover:bg-hover hover:text-fg"
        }`}
      >
        <Bell size={19} strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-complex-red px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-surface-secondary bg-elevated shadow-md"
        >
          <div className="flex items-center justify-between border-b border-surface-secondary px-4 py-3">
            <h2 className="text-sm font-semibold text-fg">Notifications</h2>
          </div>
          <ul className="max-h-80 divide-y divide-surface-secondary overflow-y-auto">
            {preview.map((notification) => (
              <li key={notification.id}>
                <button
                  type="button"
                  onClick={() =>
                    openNotification(
                      notification.id,
                      notification.entityType,
                      notification.entityId,
                    )
                  }
                  className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 hover:bg-hover"
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      notification.read ? "bg-transparent" : "bg-complex-red"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="flex flex-1 flex-col gap-0.5">
                    <span
                      className={`text-sm text-fg ${
                        notification.read ? "font-medium" : "font-semibold"
                      }`}
                    >
                      {notification.title}
                    </span>
                    <span className="text-xs text-fg-muted">
                      {notification.message}
                    </span>
                    <span className="mt-0.5 text-[11px] text-fg-muted/70">
                      {notification.timestamp}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-surface-secondary p-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block w-full rounded-md px-3 py-2 text-center text-sm font-medium text-fg outline-none transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
            >
              View all notifications
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
