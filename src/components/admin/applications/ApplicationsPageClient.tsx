"use client";

import { useState } from "react";
import {
  SummaryFilters,
  type SummaryFilterItem,
} from "@/components/admin/SummaryFilters";
import { EmptyState } from "@/components/admin/EmptyState";
import { ApplicationsToolbar } from "@/components/admin/applications/ApplicationsToolbar";
import { ApplicationsTable } from "@/components/admin/applications/ApplicationsTable";
import type { ApplicationJobOption, OptionItem } from "@/lib/applications/types";
import type { ApplicationStatus, CandidateApplication } from "@/lib/mock/types";

type ApplicationsStatusFilter = "All" | ApplicationStatus;

const DEFAULT_STATUS_SELECT = "All statuses";
const DEFAULT_OWNER = "All owners";
const DEFAULT_JOB = "All jobs";

interface ApplicationsPageClientProps {
  applications: CandidateApplication[];
  ownerOptions: OptionItem[];
}

/**
 * Same MVP filtering approach as Jobs/Candidates: the server component
 * fetches every non-archived application once; summary counts, filters,
 * search and reset all run client-side over that live array.
 */
export function ApplicationsPageClient({
  applications,
  ownerOptions,
}: ApplicationsPageClientProps) {
  const [statusFilter, setStatusFilter] =
    useState<ApplicationsStatusFilter>("All");
  const [ownerFilter, setOwnerFilter] = useState(DEFAULT_OWNER);
  const [jobFilter, setJobFilter] = useState(DEFAULT_JOB);
  const [search, setSearch] = useState("");

  const summaryCounts = {
    all: applications.length,
    new: applications.filter((a) => a.status === "New").length,
    reviewing: applications.filter((a) => a.status === "Reviewing").length,
    shortlisted: applications.filter((a) => a.status === "Shortlisted").length,
    interview: applications.filter((a) => a.status === "Interview").length,
    placed: applications.filter((a) => a.status === "Placed").length,
  };

  // Only jobs that actually have (visible) applications, in first-seen
  // (newest-application) order — same behaviour as the old mock options.
  const jobOptions: ApplicationJobOption[] = Array.from(
    new Map(
      applications.map((application) => [
        application.jobId,
        {
          id: application.jobId,
          label: `${application.jobTitle} — ${application.client}`,
        },
      ]),
    ).values(),
  );

  const summaryItems: SummaryFilterItem<ApplicationsStatusFilter>[] = [
    { value: "All", label: "All", count: summaryCounts.all },
    {
      value: "New",
      label: "New",
      count: summaryCounts.new,
      flag: summaryCounts.new > 0,
    },
    {
      value: "Reviewing",
      label: "Reviewing",
      count: summaryCounts.reviewing,
    },
    {
      value: "Shortlisted",
      label: "Shortlisted",
      count: summaryCounts.shortlisted,
    },
    {
      value: "Interview",
      label: "Interview",
      count: summaryCounts.interview,
    },
    {
      value: "Placed",
      label: "Placed",
      count: summaryCounts.placed,
    },
  ];

  const filteredApplications = applications.filter((application) => {
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
        ownerOptions={ownerOptions}
        jobOptions={jobOptions}
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
