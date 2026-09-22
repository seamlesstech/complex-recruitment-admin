"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { OwnerDisplay } from "@/components/admin/OwnerDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/admin/table";
import { AvailabilityBadge } from "./AvailabilityBadge";
import type { Candidate } from "@/lib/mock/types";

const emailLinkClass =
  "rounded text-fg outline-none transition-colors duration-150 hover:text-complex-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red";

const phoneLinkClass =
  "rounded text-xs text-fg-muted outline-none transition-colors duration-150 hover:text-complex-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red";

/** Elements that should handle their own clicks instead of triggering row navigation. */
const INTERACTIVE_SELECTOR = "a, button, input, select, textarea";

export function CandidatesTable({ candidates }: { candidates: Candidate[] }) {
  const router = useRouter();

  function handleRowClick(
    event: MouseEvent<HTMLTableRowElement>,
    id: string,
  ) {
    // Let nested interactive elements (the candidate link, email/phone
    // links) handle their own click instead of double-firing.
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    router.push(`/candidates/${id}`);
  }

  return (
    <div className="rounded-lg border border-surface-secondary bg-card p-4">
      <Table minWidthClassName="min-w-[980px]">
        <TableHead>
          <TableHeaderCell>Candidate</TableHeaderCell>
          <TableHeaderCell>Contact</TableHeaderCell>
          <TableHeaderCell>Sector</TableHeaderCell>
          <TableHeaderCell>Location</TableHeaderCell>
          <TableHeaderCell>Owner</TableHeaderCell>
          <TableHeaderCell className="whitespace-nowrap">
            Applications
          </TableHeaderCell>
          <TableHeaderCell>Availability</TableHeaderCell>
          <TableHeaderCell className="whitespace-nowrap">
            Last activity
          </TableHeaderCell>
          <TableHeaderCell className="w-8">
            <span className="sr-only">Open</span>
          </TableHeaderCell>
        </TableHead>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow
              key={candidate.id}
              onClick={(event) => handleRowClick(event, candidate.id)}
              className="group cursor-pointer"
            >
              <TableCell className="whitespace-nowrap">
                <Link
                  href={`/candidates/${candidate.id}`}
                  className="flex flex-col rounded outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
                >
                  <span className="font-medium text-fg group-hover:text-complex-red">
                    {candidate.name}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {candidate.reference}
                  </span>
                </Link>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex flex-col">
                  <a
                    href={`mailto:${candidate.email}`}
                    className={emailLinkClass}
                  >
                    {candidate.email}
                  </a>
                  <a
                    href={`tel:${candidate.phone.replace(/\s+/g, "")}`}
                    className={phoneLinkClass}
                  >
                    {candidate.phone}
                  </a>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {candidate.sector}
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {candidate.location}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <OwnerDisplay owner={candidate.owner} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <span
                  className={
                    candidate.applicationCount === 0
                      ? "text-fg-muted"
                      : "font-medium text-fg"
                  }
                >
                  {candidate.applicationCount}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <AvailabilityBadge availability={candidate.availability} />
              </TableCell>
              <TableCell className="whitespace-nowrap text-fg-muted">
                {candidate.lastActivityAt}
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
