import { initialJobDraft, type JobDraft } from "./job-editor";
import type { Job } from "./types";

type JobEditorOverrides = Partial<JobDraft> & { createdBy?: string };

/**
 * Editor-only content for a representative subset of jobs, keyed by job id.
 * Jobs without an entry fall back to sensible defaults in buildJobDraftFromJob.
 */
const jobEditorOverridesById: Record<string, JobEditorOverrides> = {
  "job-0241": {
    workplaceType: "On-site",
    employmentType: "Temporary",
    workPattern: "Shift work",
    payType: "Hourly",
    payFrom: "£17.50",
    payTo: "£19.00",
    summary:
      "Join Metro Distribution as an HGV Class 1 Driver, running scheduled trunk routes across the Midlands.",
    description:
      "You'll be responsible for the safe and timely delivery of goods across a mix of trunk and multi-drop routes, working closely with the depot team to keep operations running smoothly.",
    responsibilities:
      "Complete daily vehicle checks. Deliver goods safely and on schedule. Maintain accurate delivery records. Communicate professionally with clients on site.",
    requirements:
      "Valid UK Class 1 (C+E) licence. Current CPC and digital tachograph card. Minimum 12 months verifiable HGV experience.",
    benefits:
      "Weekly pay. Overtime available. Ongoing assignments with progression to permanent roles.",
    applicationInstructions:
      "Applicants must hold a valid UK Class 1 licence and CPC.",
    publishOnWebsite: true,
    createdBy: "Taurai",
  },
  "job-0229": {
    workplaceType: "On-site",
    employmentType: "Temporary",
    workPattern: "Full-time",
    payType: "Hourly",
    payFrom: "£12.50",
    payTo: "",
    summary:
      "General labouring support for a busy residential construction site in Leicester.",
    description:
      "Working as part of a small site team, assisting tradespeople and keeping the site safe, tidy and well organised.",
    responsibilities:
      "Support tradespeople with materials and equipment. Keep the site clean and safe. Assist with basic site preparation.",
    requirements:
      "CSCS card preferred. Comfortable working outdoors in all weather. Reliable and punctual.",
    publishOnWebsite: false,
    createdBy: "Moremi Molai",
  },
  "job-0195": {
    workplaceType: "On-site",
    employmentType: "Permanent",
    workPattern: "Full-time",
    payType: "Annual salary",
    payFrom: "£32,000",
    payTo: "£35,000",
    summary:
      "An experienced HGV Class 1 Driver role with Northway Distribution.",
    description:
      "This vacancy has now closed. It previously covered scheduled trunking routes for a long-standing client contract.",
    responsibilities:
      "Completed scheduled deliveries. Maintained vehicle safety checks. Liaised with the transport office.",
    requirements: "Valid UK Class 1 licence and CPC.",
    benefits: "Company pension. 28 days annual leave.",
    publishOnWebsite: false,
    createdBy: "Shingi",
  },
  "job-0179": {
    workplaceType: "On-site",
    employmentType: "Temporary",
    workPattern: "Shift work",
    payType: "Hourly",
    payFrom: "£11.75",
    payTo: "£13.00",
    summary:
      "Forklift Driver required for a fast-paced distribution centre in Nottingham.",
    description:
      "Operating counterbalance forklifts to load, unload and move stock efficiently and safely across the warehouse.",
    responsibilities:
      "Load and unload deliveries. Move stock to designated storage areas. Carry out routine equipment checks.",
    requirements:
      "Valid counterbalance forklift licence. Warehouse experience preferred.",
    benefits: "Weekly pay. Ongoing work available.",
    publishOnWebsite: true,
    createdBy: "Moremi Molai",
  },
};

function resolveOwnerForEditor(owner: string | null): string {
  if (!owner) return "Unassigned";
  if (owner === "Moremi") return "Moremi Molai";
  return owner;
}

function parseDisplayDateToISO(display: string | null): string {
  if (!display) return "";
  const parsed = new Date(`${display} 2026`);
  if (Number.isNaN(parsed.getTime())) return "";
  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function buildJobDraftFromJob(job: Job): {
  draft: JobDraft;
  createdBy: string;
} {
  const overrides = jobEditorOverridesById[job.id] ?? {};
  const { createdBy, ...draftOverrides } = overrides;

  const draft: JobDraft = {
    ...initialJobDraft,
    title: job.title,
    sector: job.sector,
    client: job.client,
    reference: job.reference,
    location: job.location,
    owner: resolveOwnerForEditor(job.owner),
    closingDate: parseDisplayDateToISO(job.closingDate),
    ...draftOverrides,
  };

  return { draft, createdBy: createdBy ?? "Moremi Molai" };
}
