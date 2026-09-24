import { getEnquiries } from "@/lib/enquiries/queries";
import { getOwnerOptions } from "@/lib/lookups/queries";
import { EnquiriesPageClient } from "@/components/admin/enquiries/EnquiriesPageClient";

export default async function EnquiriesPage() {
  const [enquiries, ownerOptions] = await Promise.all([
    getEnquiries(),
    getOwnerOptions(),
  ]);

  return (
    <EnquiriesPageClient enquiries={enquiries} ownerOptions={ownerOptions} />
  );
}
