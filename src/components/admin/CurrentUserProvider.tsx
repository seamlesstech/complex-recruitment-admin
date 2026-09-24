"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getRoleLabel, type ProfileRole } from "@/lib/auth/roles";

export interface CurrentUser {
  id: string;
  displayName: string;
  email: string;
  initials: string;
  role: ProfileRole;
  roleLabel: string;
}

const CurrentUserContext = createContext<CurrentUser | null>(null);

/**
 * Makes the real authenticated profile — fetched once, server-side, by the
 * (admin) route group's layout — available to every Client Component under
 * AdminShell (Topbar, Sidebar, Team, Settings) without each of them doing
 * their own fetch or falling back to a hardcoded mock identity.
 */
export function CurrentUserProvider({
  profile,
  children,
}: {
  profile: {
    id: string;
    displayName: string;
    email: string;
    initials: string | null;
    role: ProfileRole;
  };
  children: ReactNode;
}) {
  const value = useMemo<CurrentUser>(
    () => ({
      id: profile.id,
      displayName: profile.displayName,
      email: profile.email,
      initials: profile.initials || profile.displayName.slice(0, 2).toUpperCase(),
      role: profile.role,
      roleLabel: getRoleLabel(profile.role),
    }),
    [profile.id, profile.displayName, profile.email, profile.initials, profile.role],
  );

  return (
    <CurrentUserContext.Provider value={value}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUser {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return context;
}
