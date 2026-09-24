"use client";

import { useState } from "react";
import { AppearanceSection } from "@/components/admin/settings/AppearanceSection";
import { NotificationsSection } from "@/components/admin/settings/NotificationsSection";
import { ProfileSection } from "@/components/admin/settings/ProfileSection";
import { SecuritySection } from "@/components/admin/settings/SecuritySection";
import { SettingsNav, type SettingsSection } from "@/components/admin/settings/SettingsNav";
import { useCurrentUser } from "@/components/admin/CurrentUserProvider";
import { initialNotificationPreferences } from "@/lib/mock/settings";
import type {
  NotificationPreferenceChannels,
  NotificationPreferenceKey,
  UserProfileSettings,
} from "@/lib/mock/types";

export default function SettingsPage() {
  const currentUser = useCurrentUser();
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");

  const [profile, setProfile] = useState<UserProfileSettings>(() => ({
    name: currentUser.displayName,
    email: currentUser.email,
    role: currentUser.roleLabel,
    initials: currentUser.initials,
  }));
  const [profileSaved, setProfileSaved] = useState(false);

  const [preferences, setPreferences] = useState<
    Record<NotificationPreferenceKey, NotificationPreferenceChannels>
  >(initialNotificationPreferences);
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  function handleProfileFieldChange(key: "name" | "email", value: string) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setProfileSaved(false);
  }

  function handlePreferenceToggle(
    key: NotificationPreferenceKey,
    channel: "inApp" | "email",
    value: boolean,
  ) {
    setPreferences((prev) => ({
      ...prev,
      [key]: { ...prev[key], [channel]: value },
    }));
    setPreferencesSaved(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          Settings
        </h1>
        <p className="text-sm text-fg-muted">
          Manage your profile, appearance and notification preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_minmax(0,1fr)] lg:items-start">
        <SettingsNav active={activeSection} onChange={setActiveSection} />

        <div className="flex flex-col gap-6">
          {activeSection === "profile" ? (
            <ProfileSection
              profile={profile}
              onFieldChange={handleProfileFieldChange}
              onSave={() => setProfileSaved(true)}
              showSavedFeedback={profileSaved}
            />
          ) : null}

          {activeSection === "appearance" ? <AppearanceSection /> : null}

          {activeSection === "notifications" ? (
            <NotificationsSection
              preferences={preferences}
              onToggle={handlePreferenceToggle}
              onSave={() => setPreferencesSaved(true)}
              showSavedFeedback={preferencesSaved}
            />
          ) : null}

          {activeSection === "security" ? <SecuritySection /> : null}
        </div>
      </div>
    </div>
  );
}
