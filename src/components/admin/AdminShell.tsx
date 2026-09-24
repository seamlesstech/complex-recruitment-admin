"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NotificationsProvider } from "./notifications/NotificationsProvider";
import { CurrentUserProvider } from "./CurrentUserProvider";
import type { ProfileRole } from "@/lib/auth/roles";

interface AdminShellProfile {
  id: string;
  displayName: string;
  email: string;
  initials: string | null;
  role: ProfileRole;
}

export function AdminShell({
  children,
  profile,
}: {
  children: ReactNode;
  profile: AdminShellProfile;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <CurrentUserProvider profile={profile}>
      <NotificationsProvider>
        <div className="min-h-screen bg-surface">
          <Sidebar
            mobileOpen={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
          />
          <div className="flex min-h-screen flex-col lg:pl-64">
            <Topbar onMenuClick={() => setMobileNavOpen(true)} />
            <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </div>
      </NotificationsProvider>
    </CurrentUserProvider>
  );
}
