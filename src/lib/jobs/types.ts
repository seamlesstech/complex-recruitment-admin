import type { JobDraft } from "@/lib/mock/job-editor";
import type { JobStatus } from "@/lib/mock/types";

/** id + display label — the only shape the editor's <select> options need. */
export interface OptionItem {
  id: string;
  name: string;
}

/** Everything the Job Editor needs for one job, already in UI vocabulary. */
export interface JobEditorData {
  draft: JobDraft;
  status: JobStatus;
  applicationsCount: number;
  createdBy: string;
}

export type JobEditorResult =
  | { ok: true; id: string; reference: string }
  | { ok: false; error: string };

export type CreateEmployerResult =
  | { ok: true; employer: OptionItem }
  | { ok: false; error: string };
