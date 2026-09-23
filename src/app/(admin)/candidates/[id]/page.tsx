import Link from "next/link";
import { CandidateDetailView } from "@/components/admin/candidates/detail/CandidateDetailView";
import { getCandidateForDetail, getOwnerOptions } from "@/lib/candidates/queries";

export default async function CandidateDetailPage({
  params,
}: PageProps<"/candidates/[id]">) {
  const { id } = await params;

  const [detail, ownerOptions] = await Promise.all([
    getCandidateForDetail(id),
    getOwnerOptions(),
  ]);

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-surface-secondary bg-card px-6 py-20 text-center">
        <p className="text-sm font-semibold text-fg">Candidate not found</p>
        <p className="text-sm text-fg-muted">
          The candidate you&rsquo;re looking for could not be found.
        </p>
        <Link
          href="/candidates"
          className="mt-2 rounded text-sm font-medium text-complex-red outline-none transition-colors duration-150 hover:text-complex-red/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Back to candidates
        </Link>
      </div>
    );
  }

  return <CandidateDetailView detail={detail} ownerOptions={ownerOptions} />;
}
