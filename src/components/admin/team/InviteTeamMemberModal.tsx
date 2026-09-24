"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, X } from "lucide-react";
import { FormField } from "@/components/admin/forms/FormField";
import { TextInput } from "@/components/admin/forms/TextInput";
import { SelectInput } from "@/components/admin/forms/SelectInput";
import { inviteTeamMemberAction } from "@/lib/team/actions";
import { getRoleLabel, type ProfileRole } from "@/lib/auth/roles";
import { useToast } from "@/components/ui/Toast";

const ROLE_OPTIONS: ProfileRole[] = ["super_admin", "admin_manager", "recruiter", "viewer"];

export function InviteTeamMemberModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProfileRole>("recruiter");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleInvite() {
    if (!fullName.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!email.trim()) {
      setError("Email address is required.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const result = await inviteTeamMemberAction({ fullName, email, role });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    showToast("success", "Team member invited.");
    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/60 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-team-member-title"
        onClick={(event) => event.stopPropagation()}
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-surface-secondary bg-elevated p-6 shadow-md"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="invite-team-member-title" className="text-base font-semibold text-fg">
            Invite team member
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

        <FormField label="Full name" htmlFor="invite-team-name" required>
          <TextInput
            id="invite-team-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            placeholder="Jordan Smith"
            autoFocus
          />
        </FormField>

        <FormField label="Email address" htmlFor="invite-team-email" required>
          <TextInput
            id="invite-team-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="jordan.smith@complexrecruitment.co.uk"
          />
        </FormField>

        <FormField label="Role" htmlFor="invite-team-role" required>
          <SelectInput
            id="invite-team-role"
            value={role}
            onChange={(event) => setRole(event.target.value as ProfileRole)}
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {getRoleLabel(option)}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <p className="text-xs text-fg-muted">
          They&apos;ll receive an email invitation to set their own password. They
          won&apos;t be able to choose their own role.
        </p>

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
            onClick={handleInvite}
            disabled={isSubmitting}
            className="flex h-10 items-center justify-center rounded-md bg-complex-red px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending invitation…" : "Send invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
