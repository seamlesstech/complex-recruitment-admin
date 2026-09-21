import { JobEditor } from "@/components/admin/jobs/editor/JobEditor";
import { initialJobDraft } from "@/lib/mock/job-editor";

export default function NewJobPage() {
  return (
    <JobEditor
      mode="create"
      initialDraft={initialJobDraft}
      status="Draft"
      applicationsCount={0}
      createdBy="Moremi Molai"
    />
  );
}
