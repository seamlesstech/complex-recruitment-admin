"use client";

import { useState } from "react";
import {
  SummaryFilters,
  type SummaryFilterItem,
} from "@/components/admin/SummaryFilters";
import { EmptyState } from "@/components/admin/EmptyState";
import { StaffRequestsToolbar } from "@/components/admin/staff-requests/StaffRequestsToolbar";
import { StaffRequestsTable } from "@/components/admin/staff-requests/StaffRequestsTable";
import type { OptionItem } from "@/lib/staff-requests/types";
import type { StaffRequest, StaffRequestStatus } from "@/lib/mock/types";

type StaffRequestsStatusFilter = "All" | StaffRequestStatus;

const DEFAULT_STATUS_SELECT = "All statuses";
const DEFAULT_OWNER = "All owners";
const DEFAULT_SECTOR = "All sectors";

interface StaffRequestsPageClientProps {
  staffRequests: StaffRequest[];
  ownerOptions: OptionItem[];
  sectorOptions: OptionItem[];
}

/**
 * Same MVP filtering approach as Jobs/Candidates/Applications: the server
 * component fetches every non-archived staff request once; summary counts,
 * filters, search and reset all run client-side over that live array.
 */
export function StaffRequestsPageClient({
  staffRequests,
  ownerOptions,
  sectorOptions,
}: StaffRequestsPageClientProps) {
  const [statusFilter, setStatusFilter] =
    useState<StaffRequestsStatusFilter>("All");
  const [ownerFilter, setOwnerFilter] = useState(DEFAULT_OWNER);
  const [sectorFilter, setSectorFilter] = useState(DEFAULT_SECTOR);
  const [search, setSearch] = useState("");

  const summaryCounts = {
    all: staffRequests.length,
    new: staffRequests.filter((r) => r.status === "New").length,
    sourcing: staffRequests.filter((r) => r.status === "Sourcing").length,
    partiallyFilled: staffRequests.filter((r) => r.status === "Partially Filled").length,
    filled: staffRequests.filter((r) => r.status === "Filled").length,
  };

  const summaryItems: SummaryFilterItem<StaffRequestsStatusFilter>[] = [
    { value: "All", label: "All", count: summaryCounts.all },
    {
      value: "New",
      label: "New",
      count: summaryCounts.new,
      flag: summaryCounts.new > 0,
    },
    {
      value: "Sourcing",
      label: "Sourcing",
      count: summaryCounts.sourcing,
    },
    {
      value: "Partially Filled",
      label: "Partially Filled",
      count: summaryCounts.partiallyFilled,
    },
    {
      value: "Filled",
      label: "Filled",
      count: summaryCounts.filled,
    },
  ];

  const filteredRequests = staffRequests.filter((request) => {
    if (statusFilter !== "All" && request.status !== statusFilter) {
      return false;
    }

    if (ownerFilter !== DEFAULT_OWNER) {
      const ownerValue = request.owner ?? "Unassigned";
      if (ownerValue !== ownerFilter) return false;
    }

    if (sectorFilter !== DEFAULT_SECTOR && request.sector !== sectorFilter) {
      return false;
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const haystack = `${request.client} ${request.reference} ${request.requirementTitle} ${request.location} ${request.sector}`.toLowerCase();
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
        : (value as StaffRequestsStatusFilter),
    );
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    ownerFilter !== DEFAULT_OWNER ||
    sectorFilter !== DEFAULT_SECTOR;

  function handleReset() {
    setStatusFilter("All");
    setOwnerFilter(DEFAULT_OWNER);
    setSectorFilter(DEFAULT_SECTOR);
    setSearch("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Staff requests
        </h1>
        <p className="text-sm text-fg-muted">
          Manage employer staffing requirements, ownership and fulfilment.
        </p>
      </div>

      <SummaryFilters
        items={summaryItems}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <StaffRequestsToolbar
        search={search}
        onSearchChange={setSearch}
        statusValue={statusSelectValue}
        onStatusChange={handleStatusSelectChange}
        ownerValue={ownerFilter}
        onOwnerChange={setOwnerFilter}
        sectorValue={sectorFilter}
        onSectorChange={setSectorFilter}
        resultCount={filteredRequests.length}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
        ownerOptions={ownerOptions}
        sectorOptions={sectorOptions}
      />

      {filteredRequests.length > 0 ? (
        <StaffRequestsTable requests={filteredRequests} />
      ) : (
        <EmptyState
          title="No staff requests found"
          message="Try adjusting your search or filters."
          onReset={handleReset}
        />
      )}
    </div>
  );
}
