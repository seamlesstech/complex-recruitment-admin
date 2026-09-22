import { Info } from "lucide-react";
import { FormSection } from "@/components/admin/forms/FormSection";
import { Toggle } from "@/components/admin/forms/Toggle";
import { notificationPreferenceEvents } from "@/lib/mock/settings";
import type {
  NotificationPreferenceChannels,
  NotificationPreferenceKey,
} from "@/lib/mock/types";

interface NotificationsSectionProps {
  preferences: Record<NotificationPreferenceKey, NotificationPreferenceChannels>;
  onToggle: (
    key: NotificationPreferenceKey,
    channel: "inApp" | "email",
    value: boolean,
  ) => void;
  onSave: () => void;
  showSavedFeedback: boolean;
}

export function NotificationsSection({
  preferences,
  onToggle,
  onSave,
  showSavedFeedback,
}: NotificationsSectionProps) {
  return (
    <FormSection
      title="Notification preferences"
      description="Choose which operational events you want to be notified about."
    >
      <div className="flex flex-col">
        {notificationPreferenceEvents.map((event, index) => {
          const value = preferences[event.key];
          return (
            <div
              key={event.key}
              className={`flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6 ${
                index === 0 ? "" : "border-t border-surface-secondary"
              }`}
            >
              <div className="flex flex-col gap-0.5 sm:max-w-sm">
                <span className="text-sm font-medium text-fg">
                  {event.label}
                </span>
                <span className="text-xs text-fg-muted">
                  {event.description}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-6">
                <Toggle
                  id={`${event.key}-in-app`}
                  label="In-app"
                  checked={value.inApp}
                  onChange={(checked) => onToggle(event.key, "inApp", checked)}
                />
                <Toggle
                  id={`${event.key}-email`}
                  label="Email"
                  checked={value.email}
                  onChange={(checked) => onToggle(event.key, "email", checked)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-2 border-t border-surface-secondary pt-5">
        {showSavedFeedback ? (
          <div
            role="status"
            className="flex items-start gap-2 rounded-md bg-surface px-3 py-2 text-xs text-fg-muted"
          >
            <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Preview only — notification preferences have not been
              persisted.
            </span>
          </div>
        ) : null}
        <button
          type="button"
          onClick={onSave}
          className="flex h-10 w-fit items-center justify-center rounded-md bg-complex-red px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          Save preferences
        </button>
      </div>
    </FormSection>
  );
}
