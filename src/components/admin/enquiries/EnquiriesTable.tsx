"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { OwnerDisplay } from "@/components/admin/OwnerDisplay";
import { StatusBadge } from "@/components/admin/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/admin/table";
import type { Enquiry } from "@/lib/mock/types";

/** Elements that should handle their own clicks instead of triggering row navigation. */
const INTERACTIVE_SELECTOR = "a, button, input, select, textarea";

export function EnquiriesTable({ enquiries }: { enquiries: Enquiry[] }) {
  const router = useRouter();

  function handleRowClick(
    event: MouseEvent<HTMLTableRowElement>,
    id: string,
  ) {
    // Let nested interactive elements (the contact link today, any future
    // in-row controls) handle their own click instead of double-firing.
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    router.push(`/enquiries/${id}`);
  }

  return (
    <div className="rounded-lg border border-surface-secondary bg-card p-4">
      <Table minWidthClassName="min-w-[1040px]">
        <TableHead>
          <TableHeaderCell>Contact</TableHeaderCell>
          <TableHeaderCell>Enquiry</TableHeaderCell>
          <TableHeaderCell>Type</TableHeaderCell>
          <TableHeaderCell className="whitespace-nowrap">
            Received
          </TableHeaderCell>
          <TableHeaderCell>Owner</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="w-8">
            <span className="sr-only">Open</span>
          </TableHeaderCell>
        </TableHead>
        <TableBody>
          {enquiries.map((enquiry) => (
            <TableRow
              key={enquiry.id}
              onClick={(event) => handleRowClick(event, enquiry.id)}
              className="group cursor-pointer"
            >
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {enquiry.unread ? (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-complex-red"
                      aria-hidden="true"
                    />
                  ) : (
                    <span className="w-1.5 shrink-0" aria-hidden="true" />
                  )}
                  <Link
                    href={`/enquiries/${enquiry.id}`}
                    className="flex flex-col rounded outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
                  >
                    <span
                      className={`text-fg group-hover:text-complex-red ${
                        enquiry.unread ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {enquiry.contactName}
                    </span>
                    <span className="text-xs text-fg-muted">
                      {enquiry.company ?? enquiry.reference}
                    </span>
                  </Link>
                </div>
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="flex flex-col">
                  <span className="text-fg">{enquiry.subject}</span>
                  <span className="truncate text-xs text-fg-muted">
                    {enquiry.message}
                  </span>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {enquiry.type}
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {enquiry.receivedAt}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <OwnerDisplay owner={enquiry.owner} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <StatusBadge status={enquiry.status} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-right">
                <ChevronRight
                  size={16}
                  className="ml-auto text-fg-muted/60 transition-colors duration-150 group-hover:text-fg-muted"
                  aria-hidden="true"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
