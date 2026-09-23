"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import {
  SummaryFilters,
  type SummaryFilterItem,
} from "@/components/admin/SummaryFilters";
import { EmptyState } from "@/components/admin/EmptyState";
import { JobsToolbar } from "@/components/admin/jobs/JobsToolbar";
import { JobsTable } from "@/components/admin/jobs/JobsTable";
import type { OptionItem } from "@/lib/jobs/types";
import type { Job } from "@/lib/mock/types";

type JobsStatusFilter = "All" | "Open" | "Draft" | "ClosingSoon" | "Closed";

const DEFAULT_STATUS_SELECT = "All statuses";
const DEFAULT_OWNER = "All owners";
const DEFAULT_SECTOR = "All sectors";

interface JobsPageClientProps {
  jobs: Job[];
  sectorOptions: OptionItem[];
  ownerOptions: OptionItem[];
}

/**
 * MVP filtering approach: the server component (page.tsx) fetches every
 * non-archived job once; every filter/search/reset below runs client-side
 * over that already-fetched array. Acceptable while job volume is small —
 * move status/owner/sector/search to server-side query params once scale
 * warrants it (see lib/jobs/queries.ts's getJobs() doc comment).
 */
export function JobsPageClient({
  jobs,
  sectorOptions,
  ownerOptions,
}: JobsPageClientProps) {
  const [statusFilter, setStatusFilter] = useState<JobsStatusFilter>("All");
  const [ownerFilter, setOwnerFilter] = useState(DEFAULT_OWNER);
  const [sectorFilter, setSectorFilter] = useState(DEFAULT_SECTOR);
  const [search, setSearch] = useState("");

  const counts = {
    all: jobs.length,
    open: jobs.filter((job) => job.status === "Open").length,
    draft: jobs.filter((job) => job.status === "Draft").length,
    closingSoon: jobs.filter((job) => job.status === "Open" && job.closingSoon)
      .length,
    closed: jobs.filter((job) => job.status === "Closed").length,
  };

  const summaryItems: SummaryFilterItem<JobsStatusFilter>[] = [
    { value: "All", label: "All Jobs", count: counts.all },
    { value: "Open", label: "Open", count: counts.open },
    { value: "Draft", label: "Draft", count: counts.draft },
    {
      value: "ClosingSoon",
      label: "Closing Soon",
      count: counts.closingSoon,
      flag: counts.closingSoon > 0,
    },
    { value: "Closed", label: "Closed", count: counts.closed },
  ];

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter === "Open" && job.status !== "Open") return false;
    if (statusFilter === "Draft" && job.status !== "Draft") return false;
    if (statusFilter === "Closed" && job.status !== "Closed") return false;
    if (
      statusFilter === "ClosingSoon" &&
      !(job.status === "Open" && job.closingSoon)
    )
      return false;

    if (ownerFilter !== DEFAULT_OWNER) {
      const ownerValue = job.owner ?? "Unassigned";
      if (ownerValue !== ownerFilter) return false;
    }

    if (sectorFilter !== DEFAULT_SECTOR && job.sector !== sectorFilter) {
      return false;
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const haystack = `${job.title} ${job.client} ${job.reference} ${job.sector} ${job.location}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  const statusSelectValue =
    statusFilter === "All" || statusFilter === "ClosingSoon"
      ? DEFAULT_STATUS_SELECT
      : statusFilter;

  function handleStatusSelectChange(value: string) {
    setStatusFilter(
      value === DEFAULT_STATUS_SELECT ? "All" : (value as JobsStatusFilter),
    );
  }

  function handleReset() {
    setStatusFilter("All");
    setOwnerFilter(DEFAULT_OWNER);
    setSectorFilter(DEFAULT_SECTOR);
    setSearch("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Jobs
          </h1>
          <p className="text-sm text-fg-muted">
            Manage vacancies, ownership and recruitment activity.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-complex-red px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          <Plus size={16} strokeWidth={2.25} />
          Create job
        </Link>
      </div>

      <SummaryFilters
        items={summaryItems}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <JobsToolbar
        search={search}
        onSearchChange={setSearch}
        statusValue={statusSelectValue}
        onStatusChange={handleStatusSelectChange}
        ownerValue={ownerFilter}
        onOwnerChange={setOwnerFilter}
        sectorValue={sectorFilter}
        onSectorChange={setSectorFilter}
        resultCount={filteredJobs.length}
        onReset={handleReset}
        sectorOptions={sectorOptions}
        ownerOptions={ownerOptions}
      />

      {filteredJobs.length > 0 ? (
        <JobsTable jobs={filteredJobs} />
      ) : (
        <EmptyState
          title="No jobs found"
          message="Try adjusting your search or filters."
          onReset={handleReset}
        />
      )}
    </div>
  );
}
