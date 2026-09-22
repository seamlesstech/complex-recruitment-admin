import { Info } from "lucide-react";
import { Avatar } from "@/components/admin/Avatar";
import { FormField } from "@/components/admin/forms/FormField";
import { FormSection } from "@/components/admin/forms/FormSection";
import { TextInput } from "@/components/admin/forms/TextInput";
import type { UserProfileSettings } from "@/lib/mock/types";

interface ProfileSectionProps {
  profile: UserProfileSettings;
  onFieldChange: (key: "name" | "email", value: string) => void;
  onSave: () => void;
  showSavedFeedback: boolean;
}

export function ProfileSection({
  profile,
  onFieldChange,
  onSave,
  showSavedFeedback,
}: ProfileSectionProps) {
  return (
    <FormSection
      title="My profile"
      description="Your identity within Complex Admin."
    >
      <div className="flex items-center gap-3">
        <Avatar initials={profile.initials} />
        <div className="flex flex-col">
          <span className="text-sm font-medium text-fg">{profile.name}</span>
          <span className="text-xs text-fg-muted">{profile.role}</span>
        </div>
      </div>

      <FormField label="Full name" htmlFor="profile-name">
        <TextInput
          id="profile-name"
          value={profile.name}
          onChange={(event) => onFieldChange("name", event.target.value)}
        />
      </FormField>

      <FormField label="Email" htmlFor="profile-email">
        <TextInput
          id="profile-email"
          type="email"
          value={profile.email}
          onChange={(event) => onFieldChange("email", event.target.value)}
        />
      </FormField>

      <FormField
        label="Role"
        htmlFor="profile-role"
        helper="Roles and permissions will be managed separately."
      >
        <TextInput
          id="profile-role"
          value={profile.role}
          readOnly
          className="cursor-default bg-surface font-medium text-fg"
        />
      </FormField>

      <div className="flex flex-col gap-2 border-t border-surface-secondary pt-5">
        {showSavedFeedback ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-md bg-surface px-3 py-2 text-xs text-fg-muted"
          >
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Preview only — profile changes have not been persisted.
            </span>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onSave}
          className="flex h-10 w-fit items-center justify-center rounded-md bg-complex-red px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Save profile
        </button>
      </div>
    </FormSection>
  );
}
