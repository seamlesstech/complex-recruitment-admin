"use client";

import { useState } from "react";
import {
  SummaryFilters,
  type SummaryFilterItem,
} from "@/components/admin/SummaryFilters";
import { EmptyState } from "@/components/admin/EmptyState";
import { ApplicationsToolbar } from "@/components/admin/applications/ApplicationsToolbar";
import { ApplicationsTable } from "@/components/admin/applications/ApplicationsTable";
import {
  applicationSummaryDisplayCounts,
  candidateApplications,
} from "@/lib/mock/candidate-applications";
import type { ApplicationStatus } from "@/lib/mock/types";

type ApplicationsStatusFilter = "All" | ApplicationStatus;

const DEFAULT_STATUS_SELECT = "All statuses";
const DEFAULT_OWNER = "All owners";
const DEFAULT_JOB = "All jobs";

export default function ApplicationsPage() {
  const [statusFilter, setStatusFilter] =
    useState<ApplicationsStatusFilter>("All");
  const [ownerFilter, setOwnerFilter] = useState(DEFAULT_OWNER);
  const [jobFilter, setJobFilter] = useState(DEFAULT_JOB);
  const [search, setSearch] = useState("");

  const summaryItems: SummaryFilterItem<ApplicationsStatusFilter>[] = [
    { value: "All", label: "All", count: applicationSummaryDisplayCounts.all },
    {
      value: "New",
      label: "New",
      count: applicationSummaryDisplayCounts.new,
      flag: applicationSummaryDisplayCounts.new > 0,
    },
    {
      value: "Reviewing",
      label: "Reviewing",
      count: applicationSummaryDisplayCounts.reviewing,
    },
    {
      value: "Shortlisted",
      label: "Shortlisted",
      count: applicationSummaryDisplayCounts.shortlisted,
    },
    {
      value: "Interview",
      label: "Interview",
      count: applicationSummaryDisplayCounts.interview,
    },
    {
      value: "Placed",
      label: "Placed",
      count: applicationSummaryDisplayCounts.placed,
    },
  ];

  const filteredApplications = candidateApplications.filter((application) => {
    if (statusFilter !== "All" && application.status !== statusFilter) {
      return false;
    }

    if (ownerFilter !== DEFAULT_OWNER) {
      const ownerValue = application.owner ?? "Unassigned";
      if (ownerValue !== ownerFilter) return false;
    }

    if (jobFilter !== DEFAULT_JOB && application.jobId !== jobFilter) {
      return false;
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const haystack = `${application.candidateName} ${application.reference} ${application.jobTitle} ${application.jobReference} ${application.client}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  const statusSelectValue =
    statusFilter === "All" ? DEFAULT_STATUS_SELECT : statusFilter;

  function handleStatusSelectChange(value: string) {
    setStatusFilter(
      value === DEFAULT_STATUS_SELECT
        ? "All"
        : (value as ApplicationsStatusFilter),
    );
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    ownerFilter !== DEFAULT_OWNER ||
    jobFilter !== DEFAULT_JOB;

  function handleReset() {
    setStatusFilter("All");
    setOwnerFilter(DEFAULT_OWNER);
    setJobFilter(DEFAULT_JOB);
    setSearch("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Applications
        </h1>
        <p className="text-sm text-fg-muted">
          Review and progress candidate applications across active vacancies.
        </p>
      </div>

      <SummaryFilters
        items={summaryItems}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <ApplicationsToolbar
        search={search}
        onSearchChange={setSearch}
        statusValue={statusSelectValue}
        onStatusChange={handleStatusSelectChange}
        ownerValue={ownerFilter}
        onOwnerChange={setOwnerFilter}
        jobValue={jobFilter}
        onJobChange={setJobFilter}
        resultCount={filteredApplications.length}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
      />

      {filteredApplications.length > 0 ? (
        <ApplicationsTable applications={filteredApplications} />
      ) : (
        <EmptyState
          title="No applications found"
          message="Try adjusting your search or filters."
          onReset={handleReset}
        />
      )}
    </div>
  );
}
