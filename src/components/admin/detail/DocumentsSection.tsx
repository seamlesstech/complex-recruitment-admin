"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { DetailCard } from "./DetailCard";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import type { DocumentRecord } from "@/lib/mock/detail-shared";

export function DocumentsSection({
  documents,
}: {
  documents: DocumentRecord[];
}) {
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  return (
    <DetailCard title="Documents">
      {documents.length > 0 ? (
        <ul className="divide-y divide-surface-secondary">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <FileText
                  size={16}
                  className="mt-0.5 shrink-0 text-fg-muted"
                  aria-hidden="true"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-fg">
                    {doc.label}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {doc.fileName}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {doc.fileType} · {doc.fileSize} · {doc.context}
                  </span>
                  {doc.expiryLabel ? (
                    <span className="text-xs text-fg-muted">
                      {doc.expiryLabel}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(doc)}
                className="shrink-0 rounded text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
              >
                Preview
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-fg-muted">No documents on file yet.</p>
      )}

      {previewDoc ? (
        <DocumentPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      ) : null}
    </DetailCard>
  );
}
