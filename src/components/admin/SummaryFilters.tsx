export interface SummaryFilterItem<T extends string> {
  value: T;
  label: string;
  count: number;
  flag?: boolean;
}

interface SummaryFiltersProps<T extends string> {
  items: SummaryFilterItem<T>[];
  active: T;
  onChange: (value: T) => void;
}

export function SummaryFilters<T extends string>({
  items,
  active,
  onChange,
}: SummaryFiltersProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items.map((item) => {
        const isActive = active === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            aria-pressed={isActive}
            className={`flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red ${
              isActive
                ? "border-red-line bg-red-tint text-complex-red"
                : "border-transparent text-fg-muted hover:bg-hover hover:text-fg"
            }`}
          >
            {item.flag ? (
              <span
                className="h-1.5 w-1.5 rounded-full bg-complex-red"
                aria-hidden="true"
              />
            ) : null}
            {item.label}
            <span
              className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                isActive
                  ? "bg-red-tint text-complex-red"
                  : "bg-surface-secondary text-fg-muted"
              }`}
            >
              {item.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
