"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { FormField } from "@/components/admin/forms/FormField";
import { FormSection } from "@/components/admin/forms/FormSection";
import { PasswordInput } from "@/components/admin/forms/PasswordInput";
import { PasswordChecklist } from "@/components/admin/forms/PasswordChecklist";
import { changePasswordAction } from "@/lib/auth/actions";
import { isPasswordCompliant } from "@/lib/auth/password-policy";
import { useToast } from "@/components/ui/Toast";

export function SecuritySection() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const newPasswordCompliant = isPasswordCompliant(newPassword);
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;

  function reset() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit() {
    setError(null);

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (!newPasswordCompliant) {
      setError("Your new password does not meet the strength requirements below.");
      return;
    }
    if (confirmPassword !== newPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    const result = await changePasswordAction(currentPassword, newPassword);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    reset();
    showToast("success", "Password changed.");
  }

  return (
    <FormSection
      title="Security"
      description="Change your Complex Admin password."
    >
      {error ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-red-line bg-red-tint px-4 py-3 text-sm font-medium text-complex-red"
        >
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      ) : null}

      <FormField label="Current password" htmlFor="security-current-password">
        <PasswordInput
          id="security-current-password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </FormField>

      <FormField label="New password" htmlFor="security-new-password">
        <PasswordInput
          id="security-new-password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
      </FormField>

      <PasswordChecklist password={newPassword} />

      <FormField
        label="Confirm new password"
        htmlFor="security-confirm-password"
        error={confirmMismatch ? "Passwords do not match." : undefined}
      >
        <PasswordInput
          id="security-confirm-password"
          autoComplete="new-password"
          hasError={confirmMismatch}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      </FormField>

      <div className="flex flex-col gap-2 border-t border-surface-secondary pt-5">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex h-10 w-fit items-center justify-center rounded-md bg-complex-red px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Changing password…" : "Change password"}
        </button>
      </div>
    </FormSection>
  );
}
