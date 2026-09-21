import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number;
  context: string;
  href: string;
  needsAttention?: boolean;
}

export function MetricCard({
  label,
  value,
  context,
  href,
  needsAttention,
}: MetricCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between rounded-lg border border-surface-secondary bg-card p-5 outline-none transition-colors duration-150 hover:border-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
    >
      <div className="flex items-start justify-between">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-fg-muted">
          {needsAttention ? (
            <span
              className="h-1.5 w-1.5 rounded-full bg-complex-red"
              aria-hidden="true"
            />
          ) : null}
          {label}
        </span>
        <ArrowUpRight
          size={16}
          strokeWidth={2}
          className="text-fg-muted/50 transition-colors duration-150 group-hover:text-fg"
        />
      </div>
      <div className="mt-4 flex flex-col gap-1">
        <span className="text-3xl font-semibold tracking-tight text-fg">
          {value}
        </span>
        <span className="text-xs text-fg-muted">{context}</span>
      </div>
    </Link>
  );
}
