import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireActiveProfile } from "@/lib/auth/profile";

/**
 * Every route under this group requires a real, active Supabase profile.
 * Proxy (src/proxy.ts) already redirects unauthenticated requests to
 * /login on an optimistic, cookie-only basis; requireActiveProfile() is the
 * "secure" check — it hits public.profiles (RLS-gated to status = 'active')
 * and redirects to /login itself if that fails, so no protected content is
 * ever rendered before that decision is made.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireActiveProfile();

  return <AdminShell profile={profile}>{children}</AdminShell>;
}
