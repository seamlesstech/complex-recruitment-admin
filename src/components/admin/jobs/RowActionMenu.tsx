"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MoreVertical } from "lucide-react";
import type { JobStatus } from "@/lib/mock/types";

interface MenuAction {
  label: string;
  href?: string;
}

function buildActionsByStatus(jobId: string): Record<JobStatus, MenuAction[]> {
  const editHref = `/jobs/${jobId}/edit`;
  return {
    Open: [
      { label: "View / Edit", href: editHref },
      { label: "Duplicate" },
      { label: "Close job" },
    ],
    Draft: [
      { label: "Edit", href: editHref },
      { label: "Duplicate" },
      { label: "Delete draft" },
    ],
    Closed: [
      { label: "View", href: editHref },
      { label: "Duplicate" },
      { label: "Reopen" },
    ],
  };
}

export function RowActionMenu({
  status,
  jobId,
}: {
  status: JobStatus;
  jobId: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const actions = buildActionsByStatus(jobId)[status];

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Job actions"
        className={`flex h-8 w-8 items-center justify-center rounded-md border outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red ${
          open
            ? "border-surface-secondary bg-hover text-fg"
            : "border-transparent text-fg-muted hover:bg-hover hover:text-fg"
        }`}
      >
        <MoreVertical size={16} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Job actions menu"
          className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-md border border-surface-secondary bg-elevated py-1 shadow-md"
        >
          {actions.map((action) =>
            action.href ? (
              <Link
                key={action.label}
                href={action.href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block w-full px-3 py-2 text-left text-sm text-fg transition-colors duration-150 hover:bg-hover"
              >
                {action.label}
              </Link>
            ) : (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="block w-full px-3 py-2 text-left text-sm text-fg transition-colors duration-150 hover:bg-hover"
              >
                {action.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}
