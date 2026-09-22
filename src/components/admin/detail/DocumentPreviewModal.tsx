"use client";

import { useEffect } from "react";
import { FileText, X } from "lucide-react";
import type { DocumentRecord } from "@/lib/mock/detail-shared";

export function DocumentPreviewModal({
  doc,
  onClose,
}: {
  doc: DocumentRecord;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-preview-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-surface-secondary bg-elevated p-6 shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <h2
              id="document-preview-title"
              className="text-sm font-semibold text-fg"
            >
              {doc.label}
            </h2>
            <p className="text-xs text-fg-muted">{doc.fileName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-muted outline-none transition-colors duration-150 hover:bg-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-surface-secondary bg-surface px-6 py-10 text-center">
          <FileText size={28} className="text-fg-muted" aria-hidden="true" />
          <p className="text-sm font-medium text-fg">
            Preview not available yet
          </p>
          <p className="text-xs text-fg-muted">
            This document can&rsquo;t be previewed in the current build.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-9 items-center justify-center rounded-md border border-surface-secondary bg-card text-sm font-medium text-fg outline-none transition-colors duration-150 hover:border-contrast hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Close
        </button>
      </div>
    </div>
  );
}
