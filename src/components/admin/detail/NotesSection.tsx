"use client";

import { useState } from "react";
import { DetailCard } from "./DetailCard";
import { TextArea } from "@/components/admin/forms/TextArea";
import type { NoteRecord } from "@/lib/mock/detail-shared";

const CURRENT_USER_NAME = "Moremi Molai";

export function NotesSection({
  entityId,
  initialNotes,
}: {
  entityId: string;
  initialNotes: NoteRecord[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");
  const textareaId = `${entityId}-new-note`;

  function handleAddNote() {
    const text = draft.trim();
    if (!text) return;

    setNotes((previous) => [
      ...previous,
      {
        id: `${entityId}-note-local-${previous.length + 1}`,
        author: CURRENT_USER_NAME,
        timestamp: "Just now",
        text,
      },
    ]);
    setDraft("");
  }

  return (
    <DetailCard title="Internal notes">
      {notes.length > 0 ? (
        <ul className="flex flex-col divide-y divide-surface-secondary">
          {notes.map((note) => (
            <li
              key={note.id}
              className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
            >
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-fg">{note.author}</span>
                <span className="text-fg-muted">{note.timestamp}</span>
              </div>
              <p className="text-sm text-fg">{note.text}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-fg-muted">No internal notes yet.</p>
      )}

      <div className="flex flex-col gap-2 border-t border-surface-secondary pt-4">
        <label htmlFor={textareaId} className="sr-only">
          Add an internal note
        </label>
        <TextArea
          id={textareaId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add an internal note…"
          rows={3}
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-fg-muted">
            Preview only — notes are kept for this session and are not
            persisted.
          </p>
          <button
            type="button"
            onClick={handleAddNote}
            disabled={!draft.trim()}
            className="flex h-9 shrink-0 items-center justify-center rounded-md border border-surface-secondary bg-card px-4 text-sm font-medium text-fg outline-none transition-colors duration-150 hover:border-contrast hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red disabled:cursor-default disabled:opacity-50 disabled:hover:border-surface-secondary disabled:hover:bg-card"
          >
            Add note
          </button>
        </div>
      </div>
    </DetailCard>
  );
}
