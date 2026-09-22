import { Search } from "lucide-react";
import { FilterSelect } from "@/components/admin/FilterSelect";
import {
  teamRoleFilterOptions,
  teamStatusFilterOptions,
} from "@/lib/mock/team";

interface TeamToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleValue: string;
  onRoleChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  resultCount: number;
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function TeamToolbar({
  search,
  onSearchChange,
  roleValue,
  onRoleChange,
  statusValue,
  onStatusChange,
  resultCount,
  hasActiveFilters,
  onReset,
}: TeamToolbarProps) {
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
          placeholder="Search team"
          aria-label="Search team"
          className="h-9 w-56 rounded-md border border-surface-secondary bg-input pl-8 pr-3 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-fg-muted hover:border-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        />
      </div>

      <FilterSelect value={roleValue} onChange={onRoleChange} label="Role">
        {teamRoleFilterOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect value={statusValue} onChange={onStatusChange} label="Status">
        {teamStatusFilterOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FilterSelect>

      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-fg-muted">
          {resultCount} {resultCount === 1 ? "team member" : "team members"}
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
