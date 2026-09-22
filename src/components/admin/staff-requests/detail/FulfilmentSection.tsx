import { DetailCard } from "@/components/admin/detail/DetailCard";
import type { StaffRequest } from "@/lib/mock/types";

function fulfilmentSummary(filled: number, required: number): string {
  if (filled <= 0) return "No positions have been filled yet.";
  if (filled >= required) {
    return `All ${required} requested position${required === 1 ? "" : "s"} have been filled.`;
  }
  return `${filled} of ${required} requested workers have been filled.`;
}

export function FulfilmentSection({ request }: { request: StaffRequest }) {
  const { quantityRequired, quantityFilled } = request;
  const remaining = Math.max(quantityRequired - quantityFilled, 0);
  const percentFilled =
    quantityRequired > 0
      ? Math.min(100, Math.round((quantityFilled / quantityRequired) * 100))
      : 0;

  return (
    <DetailCard title="Fulfilment">
      <div className="flex flex-wrap items-center gap-8">
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted/80">
            Required
          </span>
          <span className="text-2xl font-semibold tracking-tight text-fg">
            {quantityRequired}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted/80">
            Filled
          </span>
          <span className="text-2xl font-semibold tracking-tight text-fg">
            {quantityFilled}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted/80">
            Remaining
          </span>
          <span className="text-2xl font-semibold tracking-tight text-fg">
            {remaining}
          </span>
        </div>
      </div>

      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-surface-secondary"
        role="progressbar"
        aria-valuenow={percentFilled}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Positions filled"
      >
        <div
          className="h-full rounded-full bg-chip-strong"
          style={{ width: `${percentFilled}%` }}
        />
      </div>

      <p className="text-sm text-fg-muted">
        {fulfilmentSummary(quantityFilled, quantityRequired)}
      </p>
    </DetailCard>
  );
}
