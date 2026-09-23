import type {
  EmploymentType,
  JobDraft,
  PayType,
  WorkPattern,
  WorkplaceType,
} from "@/lib/mock/job-editor";
import { formatPayPreview } from "@/lib/mock/job-editor";
import type { JobStatus } from "@/lib/mock/types";
import type { Database } from "@/lib/supabase/database.types";

/**
 * The approved Jobs UI speaks a display vocabulary ("On-site", "Annual
 * salary", "Open") that intentionally differs from the database's enum
 * vocabulary ("on_site", "annual_salary", "open"). Rather than change the
 * UI (job-editor.ts, StatusBadge, etc.) to match the database, every
 * conversion lives here, at the one boundary between them. Only server data
 * layers import this file: jobs/queries.ts, plus the Applications and Staff
 * Requests queries, which reuse the same employment/work-pattern/pay enums.
 */

type DbWorkplaceType = Database["public"]["Enums"]["workplace_type"];
type DbEmploymentType = Database["public"]["Enums"]["employment_type"];
type DbWorkPattern = Database["public"]["Enums"]["work_pattern"];
type DbPayType = Database["public"]["Enums"]["pay_type"];
type DbJobStatus = Database["public"]["Enums"]["job_status"];

export const workplaceTypeToDb: Record<WorkplaceType, DbWorkplaceType> = {
  "On-site": "on_site",
  Hybrid: "hybrid",
  Remote: "remote",
};
export const workplaceTypeFromDb: Record<DbWorkplaceType, WorkplaceType> = {
  on_site: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const employmentTypeToDb: Record<EmploymentType, DbEmploymentType> = {
  Temporary: "temporary",
  Permanent: "permanent",
  Contract: "contract",
};
export const employmentTypeFromDb: Record<DbEmploymentType, EmploymentType> = {
  temporary: "Temporary",
  permanent: "Permanent",
  contract: "Contract",
};

export const workPatternToDb: Record<WorkPattern, DbWorkPattern> = {
  "Full-time": "full_time",
  "Part-time": "part_time",
  "Shift work": "shift_work",
  Nights: "nights",
  Weekends: "weekends",
  Flexible: "flexible",
};
export const workPatternFromDb: Record<DbWorkPattern, WorkPattern> = {
  full_time: "Full-time",
  part_time: "Part-time",
  shift_work: "Shift work",
  nights: "Nights",
  weekends: "Weekends",
  flexible: "Flexible",
};

export const payTypeToDb: Record<PayType, DbPayType> = {
  Hourly: "hourly",
  Daily: "daily",
  "Annual salary": "annual_salary",
  Negotiable: "negotiable",
};
export const payTypeFromDb: Record<DbPayType, PayType> = {
  hourly: "Hourly",
  daily: "Daily",
  annual_salary: "Annual salary",
  negotiable: "Negotiable",
};

export const jobStatusToDb: Record<JobStatus, DbJobStatus> = {
  Open: "open",
  Draft: "draft",
  Closed: "closed",
};
export const jobStatusFromDb: Record<DbJobStatus, JobStatus> = {
  open: "Open",
  draft: "Draft",
  closed: "Closed",
};

/**
 * Pay fields are free-text in the approved UI (the placeholder even shows
 * "£17.50"), but the database column is `numeric(10,2)`. Parses out a plain
 * number, tolerating a leading currency symbol, thousands separators, or
 * surrounding whitespace; returns null for anything that isn't a real
 * number (including empty input).
 */
export function parsePayValue(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

export function formatPayValueForEditor(value: number | null): string {
  return value === null ? "" : value.toFixed(2);
}

/**
 * Read-only pay display from raw DB columns (shared by Application and Staff
 * Request detail): "£11.50–£12.75 per hour", "Negotiable", or
 * "Pay not yet specified" — never an invented figure.
 */
export function formatPayForDisplay(
  payType: DbPayType | null,
  payFrom: number | null,
  payTo: number | null,
): string {
  if (!payType) return "Pay not yet specified";
  const pounds = (value: number | null) => (value === null ? "" : `£${value.toFixed(2)}`);
  return formatPayPreview({
    payType: payTypeFromDb[payType],
    payFrom: pounds(payFrom),
    payTo: pounds(payTo),
  });
}

/** `<input type="date">` uses "" for empty; the database column uses null. */
export function closingDateToDb(draftValue: string): string | null {
  return draftValue.trim() === "" ? null : draftValue;
}
export function closingDateFromDb(dbValue: string | null): string {
  return dbValue ?? "";
}

export interface EditorEnumFields {
  workplaceType: JobDraft["workplaceType"];
  employmentType: JobDraft["employmentType"];
  workPattern: JobDraft["workPattern"];
  payType: JobDraft["payType"];
}

export function editorEnumFieldsFromDb(row: {
  workplace_type: DbWorkplaceType;
  employment_type: DbEmploymentType | null;
  work_pattern: DbWorkPattern | null;
  pay_type: DbPayType | null;
}): EditorEnumFields {
  return {
    workplaceType: workplaceTypeFromDb[row.workplace_type],
    employmentType: row.employment_type
      ? employmentTypeFromDb[row.employment_type]
      : "",
    workPattern: row.work_pattern ? workPatternFromDb[row.work_pattern] : "Full-time",
    payType: row.pay_type ? payTypeFromDb[row.pay_type] : "Hourly",
  };
}
