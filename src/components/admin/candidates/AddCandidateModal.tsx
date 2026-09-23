"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, X } from "lucide-react";
import { FormField } from "@/components/admin/forms/FormField";
import { TextInput } from "@/components/admin/forms/TextInput";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import { createCandidateAction } from "@/lib/candidates/actions";
import type { OptionItem } from "@/lib/candidates/types";
import type { CandidateAvailability } from "@/lib/mock/types";

const availabilityOptions: CandidateAvailability[] = [
  "Available",
  "Working",
  "Unavailable",
  "Inactive",
];

/**
 * The minimal, least-intrusive Candidate creation path (approved architecture
 * §"Candidate creation") — there is no approved full Candidate editor yet,
 * and the real long-term creation path is the public registration/
 * application workflow. This exists only so a real Candidate can be created
 * for testing and internal registration before that's wired up.
 */
export function AddCandidateModal({
  sectorOptions,
  ownerOptions,
  onClose,
}: {
  sectorOptions: OptionItem[];
  ownerOptions: OptionItem[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [sectorId, setSectorId] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [availability, setAvailability] = useState<CandidateAvailability>("Available");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleCreate() {
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const result = await createCandidateAction({
      fullName,
      email,
      phone,
      location,
      sectorId,
      ownerId,
      availability,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/candidates/${result.id}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-candidate-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-lg flex-col gap-4 rounded-lg border border-surface-secondary bg-elevated p-6 shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="add-candidate-title" className="text-base font-semibold text-fg">
            Add candidate
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-fg-muted outline-none transition-colors duration-150 hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
          >
            <X size={18} />
          </button>
        </div>

        {error ? (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md border border-red-line bg-red-tint px-4 py-3 text-sm font-medium text-complex-red"
          >
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        ) : null}

        <FormField label="Full name" htmlFor="add-candidate-name" required>
          <TextInput
            id="add-candidate-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Jordan Smith"
            autoFocus
          />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Email" htmlFor="add-candidate-email">
            <TextInput
              id="add-candidate-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="jordan.smith@example.com"
            />
          </FormField>
          <FormField label="Phone" htmlFor="add-candidate-phone">
            <TextInput
              id="add-candidate-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="07700 900000"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Location" htmlFor="add-candidate-location">
            <TextInput
              id="add-candidate-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Birmingham"
            />
          </FormField>
          <FormField label="Primary sector" htmlFor="add-candidate-sector">
            <SelectInput
              id="add-candidate-sector"
              value={sectorId}
              onChange={(event) => setSectorId(event.target.value)}
            >
              <option value="">No sector set</option>
              {sectorOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Assigned recruiter" htmlFor="add-candidate-owner">
            <SelectInput
              id="add-candidate-owner"
              value={ownerId}
              onChange={(event) => setOwnerId(event.target.value)}
            >
              <option value="">Unassigned</option>
              {ownerOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Availability" htmlFor="add-candidate-availability">
            <SelectInput
              id="add-candidate-availability"
              value={availability}
              onChange={(event) =>
                setAvailability(event.target.value as CandidateAvailability)
              }
            >
              {availabilityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectInput>
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-surface-secondary pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium text-fg-muted transition-colors duration-150 hover:text-fg disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isSubmitting}
            className="flex h-10 items-center justify-center rounded-md bg-complex-red px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Creating…" : "Create candidate"}
          </button>
        </div>
      </div>
    </div>
  );
}
