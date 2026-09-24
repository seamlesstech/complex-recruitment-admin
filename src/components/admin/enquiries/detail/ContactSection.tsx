import { DetailCard } from "@/components/admin/detail/DetailCard";
import { DetailField } from "@/components/admin/detail/DetailField";
import type { Enquiry } from "@/lib/mock/types";

const linkClass =
  "rounded text-fg outline-none transition-colors duration-150 hover:text-complex-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red";

export function ContactSection({ enquiry }: { enquiry: Enquiry }) {
  return (
    <DetailCard title="Contact">
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <DetailField label="Name">{enquiry.contactName}</DetailField>
        {enquiry.company ? (
          <DetailField label="Company">{enquiry.company}</DetailField>
        ) : null}
        <DetailField label="Email">
          {enquiry.email ? (
            <a href={`mailto:${enquiry.email}`} className={linkClass}>
              {enquiry.email}
            </a>
          ) : (
            "—"
          )}
        </DetailField>
        <DetailField label="Phone">
          {enquiry.phone ? (
            <a
              href={`tel:${enquiry.phone.replace(/\s+/g, "")}`}
              className={linkClass}
            >
              {enquiry.phone}
            </a>
          ) : (
            "—"
          )}
        </DetailField>
        <DetailField label="Enquiry type">{enquiry.type}</DetailField>
      </dl>
    </DetailCard>
  );
}
