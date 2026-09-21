import { Search } from "lucide-react";
import { FilterSelect } from "@/components/admin/FilterSelect";
import {
  jobOwnerFilterOptions,
  jobSectorFilterOptions,
  jobStatusFilterOptions,
} from "@/lib/mock/jobs";

interface JobsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  ownerValue: string;
  onOwnerChange: (value: string) => void;
  sectorValue: string;
  onSectorChange: (value: string) => void;
  resultCount: number;
  onReset: () => void;
}

export function JobsToolbar({
  search,
  onSearchChange,
  statusValue,
  onStatusChange,
  ownerValue,
  onOwnerChange,
  sectorValue,
  onSectorChange,
  resultCount,
  onReset,
}: JobsToolbarProps) {
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
          placeholder="Search jobs"
          aria-label="Search jobs"
          className="h-9 w-56 rounded-md border border-surface-secondary bg-input pl-8 pr-3 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-fg-muted hover:border-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        />
      </div>

      <FilterSelect value={statusValue} onChange={onStatusChange} label="Status">
        {jobStatusFilterOptions.map((option) => (
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
          {resultCount} {resultCount === 1 ? "job" : "jobs"}
        </span>
        <button
          type="button"
          onClick={onReset}
          className="rounded text-xs font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Reset filters
        </button>
      </div>
    </div>
  );
}
