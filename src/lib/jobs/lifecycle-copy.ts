/**
 * Shared confirmation-dialog and toast copy for the two job-lifecycle
 * actions (close/reopen) — used identically by both entry points (Jobs
 * list three-dot menu and Job Detail CTA) so there is exactly one place
 * that defines what these dialogs say.
 */
export type JobLifecycleKind = "close" | "reopen";

export const jobLifecycleDialogCopy: Record<
  JobLifecycleKind,
  { title: string; description: string; confirmLabel: string; successMessage: string; destructive: boolean }
> = {
  close: {
    title: "Close this job?",
    description:
      "Closing the job will stop new applications and remove it from the public website. Existing applications will remain available.",
    confirmLabel: "Close job",
    successMessage: "Job closed.",
    destructive: true,
  },
  reopen: {
    title: "Reopen this job?",
    description:
      "This will return the job to Open status. It will remain hidden from the public website until you publish it.",
    confirmLabel: "Reopen job",
    successMessage: "Job reopened. It remains hidden from the website until you publish it.",
    destructive: false,
  },
};
