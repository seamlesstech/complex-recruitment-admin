export type WorkplaceType = "On-site" | "Hybrid" | "Remote";
export type EmploymentType = "Temporary" | "Permanent" | "Contract";
export type WorkPattern =
  | "Full-time"
  | "Part-time"
  | "Shift work"
  | "Nights"
  | "Weekends"
  | "Flexible";
export type PayType = "Hourly" | "Daily" | "Annual salary" | "Negotiable";

export interface JobDraft {
  title: string;
  sector: string;
  client: string;
  reference: string;
  location: string;
  workplaceType: WorkplaceType;
  vacancies: number;
  employmentType: EmploymentType | "";
  workPattern: WorkPattern;
  payType: PayType;
  payFrom: string;
  payTo: string;
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  closingDate: string;
  applicationInstructions: string;
  owner: string;
  publishOnWebsite: boolean;
}

export type JobDraftErrors = Partial<Record<keyof JobDraft, string>>;

export type JobDraftUpdater = <K extends keyof JobDraft>(
  key: K,
  value: JobDraft[K],
) => void;

export interface JobDraftSectionProps {
  draft: JobDraft;
  errors: JobDraftErrors;
  onChange: JobDraftUpdater;
}

export const workplaceTypeOptions: WorkplaceType[] = [
  "On-site",
  "Hybrid",
  "Remote",
];

export const employmentTypeOptions: EmploymentType[] = [
  "Temporary",
  "Permanent",
  "Contract",
];

export const workPatternOptions: WorkPattern[] = [
  "Full-time",
  "Part-time",
  "Shift work",
  "Nights",
  "Weekends",
  "Flexible",
];

export const payTypeOptions: PayType[] = [
  "Hourly",
  "Daily",
  "Annual salary",
  "Negotiable",
];

/**
 * `reference` is empty — the database generates the real JOB-xxxx reference
 * on save, never the client — and `owner` is empty ("Unassigned") by
 * default; src/app/(admin)/jobs/new/page.tsx overrides it to the creating
 * profile's real id.
 */
export const initialJobDraft: JobDraft = {
  title: "",
  sector: "",
  client: "",
  reference: "",
  location: "",
  workplaceType: "On-site",
  vacancies: 1,
  employmentType: "",
  workPattern: "Full-time",
  payType: "Hourly",
  payFrom: "",
  payTo: "",
  summary: "",
  description: "",
  responsibilities: "",
  requirements: "",
  benefits: "",
  closingDate: "",
  applicationInstructions: "",
  owner: "",
  publishOnWebsite: true,
};

const payTypeSuffix: Record<PayType, string> = {
  Hourly: "per hour",
  Daily: "per day",
  "Annual salary": "per year",
  Negotiable: "",
};

export function formatDateDisplay(isoDate: string): string {
  if (!isoDate) return "";
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatPayPreview(
  draft: Pick<JobDraft, "payType" | "payFrom" | "payTo">,
): string {
  if (draft.payType === "Negotiable") {
    return "Negotiable";
  }

  const from = draft.payFrom.trim();
  const to = draft.payTo.trim();
  const suffix = payTypeSuffix[draft.payType];

  if (!from && !to) {
    return "Pay not yet specified";
  }

  if (from && to) {
    return `${from}–${to} ${suffix}`;
  }

  return `${from || to} ${suffix}`;
}
