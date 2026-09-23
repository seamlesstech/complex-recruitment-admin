"use client";

import { useState } from "react";
import { EmptyState } from "@/components/admin/EmptyState";
import { ActivityToolbar } from "@/components/admin/activity/ActivityToolbar";
import { ActivityFeed } from "@/components/admin/activity/ActivityFeed";
import {
  activityEvents,
  groupActivityByDate,
  isWithinDateFilter,
  resolveActivityDateTime,
  resolveEntityTypeFilter,
} from "@/lib/mock/activity";

const DEFAULT_ENTITY_TYPE = "All records";
const DEFAULT_USER = "All users";
const DEFAULT_DATE = "All time";

export default function ActivityPage() {
  const [search, setSearch] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState(
    DEFAULT_ENTITY_TYPE,
  );
  const [userFilter, setUserFilter] = useState(DEFAULT_USER);
  const [dateFilter, setDateFilter] = useState(DEFAULT_DATE);

  const filtered = activityEvents.filter((event) => {
    const resolvedType = resolveEntityTypeFilter(entityTypeFilter);
    if (resolvedType && event.entityType !== resolvedType) return false;

    if (userFilter !== DEFAULT_USER && event.actor !== userFilter) {
      return false;
    }

    if (!isWithinDateFilter(event.timestamp, dateFilter)) return false;

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const haystack = `${event.actor} ${event.action} ${event.entityLabel} ${event.entityReference} ${event.detail ?? ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) =>
      resolveActivityDateTime(b.timestamp) -
      resolveActivityDateTime(a.timestamp),
  );

  const groups = groupActivityByDate(sorted);

  const hasActiveFilters =
    search.trim() !== "" ||
    entityTypeFilter !== DEFAULT_ENTITY_TYPE ||
    userFilter !== DEFAULT_USER ||
    dateFilter !== DEFAULT_DATE;

  function handleReset() {
    setSearch("");
    setEntityTypeFilter(DEFAULT_ENTITY_TYPE);
    setUserFilter(DEFAULT_USER);
    setDateFilter(DEFAULT_DATE);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Activity
        </h1>
        <p className="text-sm text-fg-muted">
          Review operational activity across Complex Recruitment.
        </p>
      </div>

      <div className="flex max-w-4xl flex-col gap-6">
        <ActivityToolbar
          search={search}
          onSearchChange={setSearch}
          entityTypeValue={entityTypeFilter}
          onEntityTypeChange={setEntityTypeFilter}
          userValue={userFilter}
          onUserChange={setUserFilter}
          dateValue={dateFilter}
          onDateChange={setDateFilter}
          resultCount={sorted.length}
          hasActiveFilters={hasActiveFilters}
          onReset={handleReset}
        />

        {sorted.length > 0 ? (
          <ActivityFeed groups={groups} />
        ) : (
          <EmptyState
            title="No activity found"
            message="Try adjusting your search or filters."
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
