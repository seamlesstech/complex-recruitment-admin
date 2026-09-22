import { Search } from "lucide-react";
import { FilterSelect } from "@/components/admin/FilterSelect";
import { staffRequestStatusFilterOptions } from "@/lib/mock/staff-requests";
import { jobOwnerFilterOptions, jobSectorFilterOptions } from "@/lib/mock/jobs";

interface StaffRequestsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  ownerValue: string;
  onOwnerChange: (value: string) => void;
  sectorValue: string;
  onSectorChange: (value: string) => void;
  resultCount: number;
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function StaffRequestsToolbar({
  search,
  onSearchChange,
  statusValue,
  onStatusChange,
  ownerValue,
  onOwnerChange,
  sectorValue,
  onSectorChange,
  resultCount,
  hasActiveFilters,
  onReset,
}: StaffRequestsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <Search
          size={15}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search staff requests"
          aria-label="Search staff requests"
          className="h-9 w-56 rounded-md border border-surface-secondary bg-input pl-8 pr-3 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-fg-muted hover:border-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        />
      </div>

      <FilterSelect value={statusValue} onChange={onStatusChange} label="Status">
        {staffRequestStatusFilterOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect value={ownerValue} onChange={onOwnerChange} label="Owner">
        {jobOwnerFilterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect value={sectorValue} onChange={onSectorChange} label="Sector">
        {jobSectorFilterOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FilterSelect>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-fg-muted">
          {resultCount} {resultCount === 1 ? "staff request" : "staff requests"}
        </span>
        <button
          type="button"
          onClick={onReset}
          disabled={!hasActiveFilters}
          className={`rounded text-xs font-medium outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red ${
            hasActiveFilters
              ? "text-fg-muted hover:text-fg"
              : "cursor-default text-fg-muted/40"
          }`}
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
