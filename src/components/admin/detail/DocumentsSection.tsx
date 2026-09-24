import { FileText } from "lucide-react";
import { DetailCard } from "./DetailCard";
import type { DocumentRecord } from "@/lib/mock/detail-shared";

const actionClass =
  "shrink-0 rounded text-sm font-medium text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red";

/**
 * View / Download go through /api/documents/{id}, which re-authorizes the
 * current user and redirects to a short-lived signed URL. Links carry only the
 * document id; no Storage path or signed URL is ever rendered into the page.
 */
function documentHref(documentId: string, mode: "view" | "download") {
  return `/api/documents/${encodeURIComponent(documentId)}?mode=${mode}`;
}

export function DocumentsSection({
  documents,
}: {
  documents: DocumentRecord[];
}) {
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
              {doc.documentId ? (
                <div className="flex shrink-0 items-center gap-4">
                  {doc.previewable ? (
                    <a
                      href={documentHref(doc.documentId, "view")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={actionClass}
                      aria-label={`View ${doc.fileName}`}
                    >
                      View
                    </a>
                  ) : null}
                  <a
                    href={documentHref(doc.documentId, "download")}
                    rel="noopener noreferrer"
                    className={actionClass}
                    aria-label={`Download ${doc.fileName}`}
                  >
                    Download
                  </a>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-fg-muted">No documents on file yet.</p>
      )}
    </DetailCard>
  );
}
