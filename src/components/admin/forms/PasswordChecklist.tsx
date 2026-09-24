import { Check, X } from "lucide-react";
import { passwordRequirements } from "@/lib/auth/password-policy";

export function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="flex flex-col gap-1" aria-label="Password requirements">
      {passwordRequirements.map((requirement) => {
        const met = password.length > 0 && requirement.test(password);
        return (
          <li
            key={requirement.key}
            className={`flex items-center gap-1.5 text-xs ${
              met ? "text-fg" : "text-fg-muted"
            }`}
          >
            {met ? (
              <Check size={13} className="shrink-0 text-chip-strong" aria-hidden="true" />
            ) : (
              <X size={13} className="shrink-0 text-fg-muted/60" aria-hidden="true" />
            )}
            {requirement.label}
          </li>
        );
      })}
    </ul>
  );
}
