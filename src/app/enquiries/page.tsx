"use client";

import { useState } from "react";
import {
  SummaryFilters,
  type SummaryFilterItem,
} from "@/components/admin/SummaryFilters";
import { EmptyState } from "@/components/admin/EmptyState";
import { EnquiriesToolbar } from "@/components/admin/enquiries/EnquiriesToolbar";
import { EnquiriesTable } from "@/components/admin/enquiries/EnquiriesTable";
import {
  enquirySummaryDisplayCounts,
  enquiries,
} from "@/lib/mock/enquiries";
import type { EnquiryStatus } from "@/lib/mock/types";

type EnquiriesStatusFilter = "All" | EnquiryStatus;

const DEFAULT_STATUS_SELECT = "All statuses";
const DEFAULT_TYPE = "All types";
const DEFAULT_OWNER = "All owners";

export default function EnquiriesPage() {
  const [statusFilter, setStatusFilter] =
    useState<EnquiriesStatusFilter>("All");
  const [typeFilter, setTypeFilter] = useState(DEFAULT_TYPE);
  const [ownerFilter, setOwnerFilter] = useState(DEFAULT_OWNER);
  const [search, setSearch] = useState("");

  const summaryItems: SummaryFilterItem<EnquiriesStatusFilter>[] = [
    { value: "All", label: "All", count: enquirySummaryDisplayCounts.all },
    {
      value: "New",
      label: "New",
      count: enquirySummaryDisplayCounts.new,
      flag: enquirySummaryDisplayCounts.new > 0,
    },
    {
      value: "In Review",
      label: "In Review",
      count: enquirySummaryDisplayCounts.inReview,
    },
    {
      value: "Responded",
      label: "Responded",
      count: enquirySummaryDisplayCounts.responded,
    },
    {
      value: "Converted",
      label: "Converted",
      count: enquirySummaryDisplayCounts.converted,
    },
  ];

  const filteredEnquiries = enquiries.filter((enquiry) => {
    if (statusFilter !== "All" && enquiry.status !== statusFilter) {
      return false;
    }

    if (typeFilter !== DEFAULT_TYPE && enquiry.type !== typeFilter) {
      return false;
    }

    if (ownerFilter !== DEFAULT_OWNER) {
      const ownerValue = enquiry.owner ?? "Unassigned";
      if (ownerValue !== ownerFilter) return false;
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const haystack = `${enquiry.contactName} ${enquiry.company ?? ""} ${enquiry.reference} ${enquiry.email} ${enquiry.subject} ${enquiry.message}`.toLowerCase();
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
        : (value as EnquiriesStatusFilter),
    );
  }

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "All" ||
    typeFilter !== DEFAULT_TYPE ||
    ownerFilter !== DEFAULT_OWNER;

  function handleReset() {
    setStatusFilter("All");
    setTypeFilter(DEFAULT_TYPE);
    setOwnerFilter(DEFAULT_OWNER);
    setSearch("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Enquiries
        </h1>
        <p className="text-sm text-fg-muted">
          Review and manage inbound enquiries across Complex Recruitment.
        </p>
      </div>

      <SummaryFilters
        items={summaryItems}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <EnquiriesToolbar
        search={search}
        onSearchChange={setSearch}
        statusValue={statusSelectValue}
        onStatusChange={handleStatusSelectChange}
        typeValue={typeFilter}
        onTypeChange={setTypeFilter}
        ownerValue={ownerFilter}
        onOwnerChange={setOwnerFilter}
        resultCount={filteredEnquiries.length}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
      />

      {filteredEnquiries.length > 0 ? (
        <EnquiriesTable enquiries={filteredEnquiries} />
      ) : (
        <EmptyState
          title="No enquiries found"
          message="Try adjusting your search or filters."
          onReset={handleReset}
        />
      )}
    </div>
  );
}
