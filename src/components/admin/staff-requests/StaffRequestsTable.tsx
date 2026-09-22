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
import type { StaffRequest } from "@/lib/mock/types";

/** Elements that should handle their own clicks instead of triggering row navigation. */
const INTERACTIVE_SELECTOR = "a, button, input, select, textarea";

export function StaffRequestsTable({
  requests,
}: {
  requests: StaffRequest[];
}) {
  const router = useRouter();

  function handleRowClick(
    event: MouseEvent<HTMLTableRowElement>,
    id: string,
  ) {
    // Let nested interactive elements (the client link today, any future
    // in-row controls) handle their own click instead of double-firing.
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    router.push(`/staff-requests/${id}`);
  }

  return (
    <div className="rounded-lg border border-surface-secondary bg-card p-4">
      <Table minWidthClassName="min-w-[1040px]">
        <TableHead>
          <TableHeaderCell>Request</TableHeaderCell>
          <TableHeaderCell>Requirement</TableHeaderCell>
          <TableHeaderCell>Sector</TableHeaderCell>
          <TableHeaderCell>Location</TableHeaderCell>
          <TableHeaderCell className="whitespace-nowrap">
            Needed by
          </TableHeaderCell>
          <TableHeaderCell>Owner</TableHeaderCell>
          <TableHeaderCell>Filled</TableHeaderCell>
          <TableHeaderCell>Status</TableHeaderCell>
          <TableHeaderCell className="w-8">
            <span className="sr-only">Open</span>
          </TableHeaderCell>
        </TableHead>
        <TableBody>
          {requests.map((request) => (
            <TableRow
              key={request.id}
              onClick={(event) => handleRowClick(event, request.id)}
              className="group cursor-pointer"
            >
              <TableCell className="whitespace-nowrap">
                <Link
                  href={`/staff-requests/${request.id}`}
                  className="flex flex-col rounded outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
                >
                  <span className="font-semibold text-fg group-hover:text-complex-red">
                    {request.client}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {request.reference}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg">
                {request.quantityRequired} {request.requirementTitle}
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {request.sector}
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {request.location}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {request.neededBy ? (
                  <span
                    className={`flex items-center gap-1.5 ${
                      request.urgency === "Urgent"
                        ? "font-medium text-complex-red"
                        : "text-fg"
                    }`}
                  >
                    {request.urgency === "Urgent" ? (
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-complex-red"
                        aria-hidden="true"
                      />
                    ) : null}
                    {request.neededBy}
                  </span>
                ) : (
                  <span className="text-fg-muted">No date set</span>
                )}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <OwnerDisplay owner={request.owner} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span
                  className={
                    request.quantityFilled === 0
                      ? "text-fg-muted"
                      : "font-medium text-fg"
                  }
                >
                  {request.quantityFilled} / {request.quantityRequired}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <StatusBadge status={request.status} />
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
