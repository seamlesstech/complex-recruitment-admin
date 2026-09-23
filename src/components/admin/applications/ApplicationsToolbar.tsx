import { Search } from "lucide-react";
import { FilterSelect } from "@/components/admin/FilterSelect";
import { applicationStatuses } from "@/lib/applications/enums";
import type { ApplicationJobOption, OptionItem } from "@/lib/applications/types";

const applicationStatusFilterOptions = ["All statuses", ...applicationStatuses];

interface ApplicationsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  ownerValue: string;
  onOwnerChange: (value: string) => void;
  jobValue: string;
  onJobChange: (value: string) => void;
  resultCount: number;
  hasActiveFilters: boolean;
  onReset: () => void;
  /** Real active `profiles` — only `.name` is used (Applications are filtered
   * by the already-resolved owner name string, same as Candidates). */
  ownerOptions: OptionItem[];
  /** Jobs present in the live application set; filtered by real job id. */
  jobOptions: ApplicationJobOption[];
}

export function ApplicationsToolbar({
  search,
  onSearchChange,
  statusValue,
  onStatusChange,
  ownerValue,
  onOwnerChange,
  jobValue,
  onJobChange,
  resultCount,
  hasActiveFilters,
  onReset,
  ownerOptions,
  jobOptions,
}: ApplicationsToolbarProps) {
  const ownerFilterOptions = [
    { label: "All owners", value: "All owners" },
    ...ownerOptions.map((owner) => ({ label: owner.name, value: owner.name })),
    { label: "Unassigned", value: "Unassigned" },
  ];

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
          placeholder="Search applications"
          aria-label="Search applications"
          className="h-9 w-56 rounded-md border border-surface-secondary bg-input pl-8 pr-3 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-fg-muted hover:border-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        />
      </div>

      <FilterSelect value={statusValue} onChange={onStatusChange} label="Status">
        {applicationStatusFilterOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect value={ownerValue} onChange={onOwnerChange} label="Owner">
        {ownerFilterOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect value={jobValue} onChange={onJobChange} label="Job">
        <option value="All jobs">All jobs</option>
        {jobOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </FilterSelect>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-fg-muted">
          {resultCount} {resultCount === 1 ? "application" : "applications"}
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
