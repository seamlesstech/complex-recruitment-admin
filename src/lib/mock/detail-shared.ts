/**
 * Shapes and helpers shared by every "detail" screen (Application Detail,
 * Candidate Detail, …) — documents, internal notes and activity are the
 * same kind of record regardless of which entity they're attached to.
 */

export interface DocumentRecord {
  id: string;
  label: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  context: string;
  /** Display-only, e.g. "Expires 12 Mar 2027" — relevant for licences etc. */
  expiryLabel?: string;
}

export interface NoteRecord {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface ActivityItem {
  id: string;
  description: string;
  timestamp: string;
}

export interface ParsedTimestamp {
  day: string;
  hour: number;
  minute: number;
}

/** Parses the app's "Today · 09:42" / "19 Sept · 11:20" mock timestamp format. */
export function parseRelativeTimestamp(value: string): ParsedTimestamp | null {
  const [day, time] = value.split(" · ");
  if (!day || !time) return null;
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { day, hour, minute };
}

export function addMinutesToTimestamp(
  base: ParsedTimestamp | null,
  minutes: number,
  fallback: string,
): string {
  if (!base) return fallback;
  const total = base.hour * 60 + base.minute + minutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const hour = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const minute = String(wrapped % 60).padStart(2, "0");
  return `${base.day} · ${hour}:${minute}`;
}
