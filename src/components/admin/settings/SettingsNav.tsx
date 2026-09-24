export type SettingsSection = "profile" | "appearance" | "notifications" | "security";

interface SettingsNavItem {
  key: SettingsSection;
  label: string;
}

const settingsNavItems: SettingsNavItem[] = [
  { key: "profile", label: "My profile" },
  { key: "appearance", label: "Appearance" },
  { key: "notifications", label: "Notifications" },
  { key: "security", label: "Security" },
];

interface SettingsNavProps {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
}

export function SettingsNav({ active, onChange }: SettingsNavProps) {
  return (
    <nav
      aria-label="Settings sections"
      className="flex flex-row flex-wrap gap-1.5 lg:flex-col lg:gap-0.5"
    >
      {settingsNavItems.map((item) => {
        const isActive = item.key === active;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-2 text-left text-sm font-medium outline-none transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red ${
              isActive
                ? "bg-red-tint text-complex-red"
                : "text-fg-muted hover:bg-hover hover:text-fg"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
