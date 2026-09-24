"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive (red). Defaults to true. */
  destructive?: boolean;
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Shared branded confirmation dialog for consequential actions (Close Job,
 * etc) — the one reusable primitive in this app for that purpose, modeled on
 * the existing bespoke modal pattern in AddCandidateModal. Never uses
 * browser confirm().
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  destructive = true,
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isConfirming) onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, isConfirming]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/60 p-4"
      onClick={() => {
        if (!isConfirming) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-surface-secondary bg-elevated p-6 shadow-md"
      >
        <div className="flex items-start gap-3">
          {destructive ? (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-tint text-complex-red">
              <AlertTriangle size={18} aria-hidden="true" />
            </span>
          ) : null}
          <div className="flex flex-col gap-1 pt-1">
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-fg">
              {title}
            </h2>
            <p id="confirm-dialog-description" className="text-sm text-fg-muted">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-surface-secondary pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isConfirming}
            className="flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-fg-muted transition-colors duration-150 hover:text-fg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            autoFocus
            onClick={onConfirm}
            disabled={isConfirming}
            className={`flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-white transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-70 ${
              destructive
                ? "bg-complex-red hover:bg-complex-red/90"
                : "bg-chip-strong text-chip-strong-fg hover:opacity-90"
            }`}
          >
            {isConfirming ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
