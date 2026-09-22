"use client";

import { useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import {
  SummaryFilters,
  type SummaryFilterItem,
} from "@/components/admin/SummaryFilters";
import { NotificationsFeed } from "@/components/admin/notifications/NotificationsFeed";
import { NotificationsToolbar } from "@/components/admin/notifications/NotificationsToolbar";
import { useNotifications } from "@/components/admin/notifications/NotificationsProvider";
import {
  groupNotificationsByDate,
  resolveNotificationTypeFilter,
  sortNotificationsByRecency,
} from "@/lib/mock/notifications";

type ReadStatusFilter = "All" | "Unread" | "Read";

const DEFAULT_TYPE = "All types";
const DEFAULT_READ_STATUS: ReadStatusFilter = "All";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState(DEFAULT_TYPE);
  const [readStatusFilter, setReadStatusFilter] = useState<ReadStatusFilter>(
    DEFAULT_READ_STATUS,
  );

  const filtered = notifications.filter((notification) => {
    const resolvedType = resolveNotificationTypeFilter(typeFilter);
    if (resolvedType && notification.type !== resolvedType) return false;

    if (readStatusFilter === "Unread" && notification.read) return false;
    if (readStatusFilter === "Read" && !notification.read) return false;

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const haystack = `${notification.title} ${notification.message} ${notification.entityReference}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  const sorted = sortNotificationsByRecency(filtered);
  const groups = groupNotificationsByDate(sorted);

  const summaryItems: SummaryFilterItem<ReadStatusFilter>[] = [
    { value: "All", label: "All", count: notifications.length },
    {
      value: "Unread",
      label: "Unread",
      count: unreadCount,
      flag: unreadCount > 0,
    },
  ];

  const hasActiveFilters =
    search.trim() !== "" ||
    typeFilter !== DEFAULT_TYPE ||
    readStatusFilter !== DEFAULT_READ_STATUS;

  function handleReset() {
    setSearch("");
    setTypeFilter(DEFAULT_TYPE);
    setReadStatusFilter(DEFAULT_READ_STATUS);
  }

  const isCaughtUp =
    sorted.length === 0 &&
    readStatusFilter === "Unread" &&
    search.trim() === "" &&
    typeFilter === DEFAULT_TYPE;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Notifications
        </h1>
        <p className="text-sm text-fg-muted">
          Review updates and activity that need your attention.
        </p>
      </div>

      <div className="flex max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SummaryFilters
            items={summaryItems}
            active={readStatusFilter}
            onChange={setReadStatusFilter}
          />
          {unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllAsRead}
              className="rounded text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
            >
              Mark all as read
            </button>
          ) : null}
        </div>

        <NotificationsToolbar
          search={search}
          onSearchChange={setSearch}
          typeValue={typeFilter}
          onTypeChange={setTypeFilter}
          readStatusValue={readStatusFilter}
          onReadStatusChange={(value) =>
            setReadStatusFilter(value as ReadStatusFilter)
          }
          resultCount={sorted.length}
          hasActiveFilters={hasActiveFilters}
          onReset={handleReset}
        />

        {sorted.length > 0 ? (
          <NotificationsFeed
            groups={groups}
            onOpen={markAsRead}
            onMarkAsRead={markAsRead}
          />
        ) : isCaughtUp ? (
          <EmptyState
            title="You're all caught up"
            message="There are no unread notifications right now."
            onReset={handleReset}
          />
        ) : (
          <EmptyState
            title="No notifications found"
            message="Try adjusting your search or filters."
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
