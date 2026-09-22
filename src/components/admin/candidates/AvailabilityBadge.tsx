import type { CandidateAvailability } from "@/lib/mock/types";

/**
 * Deliberately neutral-only styling — availability is not a pipeline status
 * and must never borrow Complex red (which would read as a warning/error).
 * Available is the most common value in the list, so it stays a light,
 * bordered treatment rather than a solid fill — the solid `chip-strong`
 * treatment is reserved for Working so a repeated column of Available rows
 * doesn't read as heavier than the candidate name/ownership data beside it.
 */
const availabilityStyles: Record<CandidateAvailability, string> = {
  Available: "border border-contrast bg-surface-secondary text-fg",
  Working: "bg-chip-strong text-chip-strong-fg",
  Unavailable: "bg-surface-secondary text-fg-muted",
  Inactive: "border border-surface-secondary bg-transparent text-fg-muted/70",
};

export function AvailabilityBadge({
  availability,
}: {
  availability: CandidateAvailability;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${availabilityStyles[availability]}`}
    >
      {availability}
    </span>
  );
}
