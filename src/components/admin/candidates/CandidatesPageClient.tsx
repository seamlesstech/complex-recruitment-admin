"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  SummaryFilters,
  type SummaryFilterItem,
} from "@/components/admin/SummaryFilters";
import { EmptyState } from "@/components/admin/EmptyState";
import { CandidatesToolbar } from "@/components/admin/candidates/CandidatesToolbar";
import { CandidatesTable } from "@/components/admin/candidates/CandidatesTable";
import { AddCandidateModal } from "@/components/admin/candidates/AddCandidateModal";
import type { OptionItem } from "@/lib/candidates/types";
import type { Candidate, CandidateAvailability } from "@/lib/mock/types";

type CandidatesAvailabilityFilter = "All" | CandidateAvailability;

const DEFAULT_AVAILABILITY_SELECT = "All availability";
const DEFAULT_OWNER = "All owners";
const DEFAULT_SECTOR = "All sectors";

interface CandidatesPageClientProps {
  candidates: Candidate[];
  sectorOptions: OptionItem[];
  ownerOptions: OptionItem[];
}

/**
 * Same MVP filtering approach as Jobs: the server component fetches every
 * non-archived candidate once; filter/search/reset run client-side over
 * that array. See lib/jobs/queries.ts's getJobs() doc comment for the
 * scale trade-off this accepts.
 */
export function CandidatesPageClient({
  candidates,
  sectorOptions,
  ownerOptions,
}: CandidatesPageClientProps) {
  const [availabilityFilter, setAvailabilityFilter] =
    useState<CandidatesAvailabilityFilter>("All");
  const [ownerFilter, setOwnerFilter] = useState(DEFAULT_OWNER);
  const [sectorFilter, setSectorFilter] = useState(DEFAULT_SECTOR);
  const [search, setSearch] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);

  const summaryCounts = {
    all: candidates.length,
    available: candidates.filter((c) => c.availability === "Available").length,
    working: candidates.filter((c) => c.availability === "Working").length,
    unavailable: candidates.filter((c) => c.availability === "Unavailable").length,
    inactive: candidates.filter((c) => c.availability === "Inactive").length,
  };

  const summaryItems: SummaryFilterItem<CandidatesAvailabilityFilter>[] = [
    { value: "All", label: "All", count: summaryCounts.all },
    { value: "Available", label: "Available", count: summaryCounts.available },
    { value: "Working", label: "Working", count: summaryCounts.working },
    { value: "Unavailable", label: "Unavailable", count: summaryCounts.unavailable },
    { value: "Inactive", label: "Inactive", count: summaryCounts.inactive },
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
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Candidates
          </h1>
          <p className="text-sm text-fg-muted">
            Manage registered candidates, availability and recruiter ownership.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-complex-red px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          <Plus size={16} strokeWidth={2.25} />
          Add candidate
        </button>
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
        sectorOptions={sectorOptions}
        ownerOptions={ownerOptions}
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

      {addModalOpen ? (
        <AddCandidateModal
          sectorOptions={sectorOptions}
          ownerOptions={ownerOptions}
          onClose={() => setAddModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
