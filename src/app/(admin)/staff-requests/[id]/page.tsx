import Link from "next/link";
import { StaffRequestDetailView } from "@/components/admin/staff-requests/detail/StaffRequestDetailView";
import { getStaffRequestDetailById } from "@/lib/mock/staff-request-details";

export default async function StaffRequestDetailPage({
  params,
}: PageProps<"/staff-requests/[id]">) {
  const { id } = await params;
  const detail = getStaffRequestDetailById(id);

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-surface-secondary bg-card px-6 py-20 text-center">
        <p className="text-sm font-semibold text-fg">
          Staff request not found
        </p>
        <p className="text-sm text-fg-muted">
          The staff request you&rsquo;re looking for could not be found.
        </p>
        <Link
          href="/staff-requests"
          className="mt-2 rounded text-sm font-medium text-complex-red outline-none transition-colors duration-150 hover:text-complex-red/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Back to staff requests
        </Link>
      </div>
    );
  }

  return <StaffRequestDetailView detail={detail} />;
}
