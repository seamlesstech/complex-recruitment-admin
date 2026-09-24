import { Search } from "lucide-react";
import { FilterSelect } from "@/components/admin/FilterSelect";
import { enquiryStatuses, enquiryTypes } from "@/lib/enquiries/enums";
import type { OptionItem } from "@/lib/enquiries/types";

const enquiryStatusFilterOptions = ["All statuses", ...enquiryStatuses];
const enquiryTypeFilterOptions = ["All types", ...enquiryTypes];

interface EnquiriesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  typeValue: string;
  onTypeChange: (value: string) => void;
  ownerValue: string;
  onOwnerChange: (value: string) => void;
  resultCount: number;
  hasActiveFilters: boolean;
  onReset: () => void;
  /** Real active `profiles` — only `.name` is used (enquiries are filtered
   * by the already-resolved owner name string, same as the other lists). */
  ownerOptions: OptionItem[];
}

export function EnquiriesToolbar({
  search,
  onSearchChange,
  statusValue,
  onStatusChange,
  typeValue,
  onTypeChange,
  ownerValue,
  onOwnerChange,
  resultCount,
  hasActiveFilters,
  onReset,
  ownerOptions,
}: EnquiriesToolbarProps) {
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
          placeholder="Search enquiries"
          aria-label="Search enquiries"
          className="h-9 w-56 rounded-md border border-surface-secondary bg-input pl-8 pr-3 text-sm text-fg outline-none transition-colors duration-150 placeholder:text-fg-muted hover:border-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        />
      </div>

      <FilterSelect value={statusValue} onChange={onStatusChange} label="Status">
        {enquiryStatusFilterOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect value={typeValue} onChange={onTypeChange} label="Type">
        {enquiryTypeFilterOptions.map((option) => (
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

      <div className="ml-auto flex items-center gap-3">
        <span className="text-sm text-fg-muted">
          {resultCount} {resultCount === 1 ? "enquiry" : "enquiries"}
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
