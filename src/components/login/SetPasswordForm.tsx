"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { FormField } from "@/components/admin/forms/FormField";
import { PasswordInput } from "@/components/admin/forms/PasswordInput";
import { PasswordChecklist } from "@/components/admin/forms/PasswordChecklist";
import { completeInvitationAction } from "@/lib/auth/invite-actions";
import { isPasswordCompliant } from "@/lib/auth/password-policy";

export function SetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const compliant = isPasswordCompliant(password);
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!compliant) {
      setError("Your password does not meet the strength requirements below.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await completeInvitationAction(password, confirmPassword);
    setIsSubmitting(false);

    // completeInvitationAction redirects on success, so any result reaching
    // here is a failure.
    if (result && !result.ok) {
      setError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-red-line bg-red-tint px-4 py-3 text-sm font-medium text-complex-red"
        >
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      ) : null}

      <FormField label="New password" htmlFor="set-password-new">
        <PasswordInput
          id="set-password-new"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoFocus
          required
        />
      </FormField>

      <PasswordChecklist password={password} />

      <FormField
        label="Confirm password"
        htmlFor="set-password-confirm"
        error={confirmMismatch ? "Passwords do not match." : undefined}
      >
        <PasswordInput
          id="set-password-confirm"
          autoComplete="new-password"
          hasError={confirmMismatch}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
      </FormField>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-10 items-center justify-center rounded-md bg-complex-red text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Setting password…" : "Set password and continue"}
      </button>
    </form>
  );
}
