"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { DetailCard } from "@/components/admin/detail/DetailCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { OwnerDisplay } from "@/components/admin/OwnerDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "@/components/admin/table";
import type { CandidateApplication } from "@/lib/mock/types";

const INTERACTIVE_SELECTOR = "a, button, input, select, textarea";

export function ApplicationHistorySection({
  applications,
}: {
  applications: CandidateApplication[];
}) {
  const router = useRouter();

  function handleRowClick(
    event: MouseEvent<HTMLTableRowElement>,
    id: string,
  ) {
    if ((event.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) return;
    router.push(`/applications/${id}`);
  }

  return (
    <DetailCard title="Applications">
      {applications.length > 0 ? (
        <Table minWidthClassName="min-w-[640px]">
          <TableHead>
            <TableHeaderCell>Job</TableHeaderCell>
            <TableHeaderCell>Client</TableHeaderCell>
            <TableHeaderCell className="whitespace-nowrap">
              Applied
            </TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Owner</TableHeaderCell>
            <TableHeaderCell className="w-8">
              <span className="sr-only">Open</span>
            </TableHeaderCell>
          </TableHead>
          <TableBody>
            {applications.map((application) => (
              <TableRow
                key={application.id}
                onClick={(event) => handleRowClick(event, application.id)}
                className="group cursor-pointer"
              >
                <TableCell className="whitespace-nowrap">
                  <Link
                    href={`/applications/${application.id}`}
                    className="flex flex-col rounded outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
                  >
                    <span className="font-medium text-fg group-hover:text-complex-red">
                      {application.jobTitle}
                    </span>
                    <span className="text-xs text-fg-muted">
                      {application.jobReference}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap text-fg-muted">
                  {application.client}
                </TableCell>
                <TableCell className="whitespace-nowrap text-fg-muted">
                  {application.appliedAt}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={application.status} />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <OwnerDisplay owner={application.owner} />
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
      ) : (
        <div className="flex flex-col items-center justify-center gap-1 rounded-md border border-dashed border-surface-secondary bg-surface px-6 py-10 text-center">
          <p className="text-sm font-semibold text-fg">No applications yet</p>
          <p className="text-sm text-fg-muted">
            This candidate has not applied for a vacancy yet.
          </p>
        </div>
      )}
    </DetailCard>
  );
}
