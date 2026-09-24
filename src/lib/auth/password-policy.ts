/**
 * The one shared strong-password policy — used by both Settings → Security
 * (change own password) and the invited-team-member first-password setup.
 * Enforced client-side here for immediate UX feedback, and independently
 * re-run server-side (see security-actions.ts / invite-actions.ts) before
 * any password is ever accepted — client validation alone is never trusted.
 */

export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72; // bcrypt's effective input limit (Supabase Auth uses bcrypt).

export interface PasswordRequirement {
  key: string;
  label: string;
  test: (password: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    key: "length",
    label: `At least ${PASSWORD_MIN_LENGTH} characters`,
    test: (password) => password.length >= PASSWORD_MIN_LENGTH,
  },
  {
    key: "uppercase",
    label: "One uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    key: "lowercase",
    label: "One lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    key: "number",
    label: "One number",
    test: (password) => /[0-9]/.test(password),
  },
  {
    key: "symbol",
    label: "One symbol",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function validatePassword(password: string): string | null {
  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be ${PASSWORD_MAX_LENGTH} characters or fewer.`;
  }
  const failed = passwordRequirements.find((requirement) => !requirement.test(password));
  if (failed) {
    return "Password does not meet the strength requirements below.";
  }
  return null;
}

export function isPasswordCompliant(password: string): boolean {
  return validatePassword(password) === null;
}
