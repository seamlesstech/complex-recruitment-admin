import Link from "next/link";
import { EnquiryDetailView } from "@/components/admin/enquiries/detail/EnquiryDetailView";
import { getEnquiryDetailById } from "@/lib/mock/enquiry-details";

export default async function EnquiryDetailPage({
  params,
}: PageProps<"/enquiries/[id]">) {
  const { id } = await params;
  const detail = getEnquiryDetailById(id);

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-surface-secondary bg-card px-6 py-20 text-center">
        <p className="text-sm font-semibold text-fg">Enquiry not found</p>
        <p className="text-sm text-fg-muted">
          The enquiry you&rsquo;re looking for could not be found.
        </p>
        <Link
          href="/enquiries"
          className="mt-2 rounded text-sm font-medium text-complex-red outline-none transition-colors duration-150 hover:text-complex-red/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Back to enquiries
        </Link>
      </div>
    );
  }

  return <EnquiryDetailView detail={detail} />;
}
