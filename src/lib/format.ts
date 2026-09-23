/**
 * Small, pure display formatters shared by the live data layers
 * (Applications, Staff Requests). Server-rendered, en-GB, no locale state.
 */

/** "23 Sept 2026" */
export function formatFullDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** "23 Sept 2026 · 13:43" */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${formatFullDate(iso)} · ${timePart}`;
}

/** "5 Oct" — for a plain `date` column (no time/zone), e.g. needed_by. */
export function formatShortDate(dateOnly: string): string {
  const date = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateOnly;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/** Strict UUID shape check — used to reject non-UUID route ids (e.g. old
 * mock `capp-…`/`sr-…` links) before they reach a uuid column. */
export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
