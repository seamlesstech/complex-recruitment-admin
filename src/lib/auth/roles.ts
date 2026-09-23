/**
 * public.profiles.role values (see supabase/migrations/20260922120214_enums_and_lookups.sql)
 * mapped to their display label. Centralized so every screen shows the same
 * label for a given role — never hardcode this mapping elsewhere.
 */
export type ProfileRole =
  | "super_admin"
  | "admin_manager"
  | "recruiter"
  | "viewer";

export type ProfileStatus = "active" | "invited" | "disabled";

const ROLE_LABELS: Record<ProfileRole, string> = {
  super_admin: "Super Admin",
  admin_manager: "Admin / Manager",
  recruiter: "Recruiter",
  viewer: "Viewer",
};

export function getRoleLabel(role: ProfileRole): string {
  return ROLE_LABELS[role];
}
