"use client";

import { useState } from "react";
import {
  SummaryFilters,
  type SummaryFilterItem,
} from "@/components/admin/SummaryFilters";
import { EmptyState } from "@/components/admin/EmptyState";
import { CandidatesToolbar } from "@/components/admin/candidates/CandidatesToolbar";
import { CandidatesTable } from "@/components/admin/candidates/CandidatesTable";
import {
  candidateSummaryDisplayCounts,
  candidates,
} from "@/lib/mock/candidates";
import type { CandidateAvailability } from "@/lib/mock/types";

type CandidatesAvailabilityFilter = "All" | CandidateAvailability;

const DEFAULT_AVAILABILITY_SELECT = "All availability";
const DEFAULT_OWNER = "All owners";
const DEFAULT_SECTOR = "All sectors";

export default function CandidatesPage() {
  const [availabilityFilter, setAvailabilityFilter] =
    useState<CandidatesAvailabilityFilter>("All");
  const [ownerFilter, setOwnerFilter] = useState(DEFAULT_OWNER);
  const [sectorFilter, setSectorFilter] = useState(DEFAULT_SECTOR);
  const [search, setSearch] = useState("");

  const summaryItems: SummaryFilterItem<CandidatesAvailabilityFilter>[] = [
    { value: "All", label: "All", count: candidateSummaryDisplayCounts.all },
    {
      value: "Available",
      label: "Available",
      count: candidateSummaryDisplayCounts.available,
    },
    {
      value: "Working",
      label: "Working",
      count: candidateSummaryDisplayCounts.working,
    },
    {
      value: "Unavailable",
      label: "Unavailable",
      count: candidateSummaryDisplayCounts.unavailable,
    },
    {
      value: "Inactive",
      label: "Inactive",
      count: candidateSummaryDisplayCounts.inactive,
    },
  ];

  const filteredCandidates = candidates.filter((candidate) => {
    if (
      availabilityFilter !== "All" &&
      candidate.availability !== availabilityFilter
    ) {
      return false;
    }

    if (ownerFilter !== DEFAULT_OWNER) {
      const ownerValue = candidate.owner ?? "Unassigned";
      if (ownerValue !== ownerFilter) return false;
    }

    if (sectorFilter !== DEFAULT_SECTOR && candidate.sector !== sectorFilter) {
      return false;
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const haystack = `${candidate.name} ${candidate.reference} ${candidate.email} ${candidate.phone} ${candidate.location} ${candidate.sector}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  const availabilitySelectValue =
    availabilityFilter === "All"
      ? DEFAULT_AVAILABILITY_SELECT
      : availabilityFilter;

  function handleAvailabilitySelectChange(value: string) {
    setAvailabilityFilter(
      value === DEFAULT_AVAILABILITY_SELECT
        ? "All"
        : (value as CandidatesAvailabilityFilter),
    );
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    availabilityFilter !== "All" ||
    ownerFilter !== DEFAULT_OWNER ||
    sectorFilter !== DEFAULT_SECTOR;

  function handleReset() {
    setAvailabilityFilter("All");
    setOwnerFilter(DEFAULT_OWNER);
    setSectorFilter(DEFAULT_SECTOR);
    setSearch("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Candidates
        </h1>
        <p className="text-sm text-fg-muted">
          Manage registered candidates, availability and recruiter ownership.
        </p>
      </div>

      <SummaryFilters
        items={summaryItems}
        active={availabilityFilter}
        onChange={setAvailabilityFilter}
      />

      <CandidatesToolbar
        search={search}
        onSearchChange={setSearch}
        availabilityValue={availabilitySelectValue}
        onAvailabilityChange={handleAvailabilitySelectChange}
        ownerValue={ownerFilter}
        onOwnerChange={setOwnerFilter}
        sectorValue={sectorFilter}
        onSectorChange={setSectorFilter}
        resultCount={filteredCandidates.length}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
      />

      {filteredCandidates.length > 0 ? (
        <CandidatesTable candidates={filteredCandidates} />
      ) : (
        <EmptyState
          title="No candidates found"
          message="Try adjusting your search or filters."
          onReset={handleReset}
        />
      )}
    </div>
  );
}
