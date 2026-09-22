"use client";

import { useSyncExternalStore } from "react";
import { Check, Moon, Sun, type LucideIcon } from "lucide-react";
import { FormSection } from "@/components/admin/forms/FormSection";
import {
  applyTheme,
  getServerTheme,
  readCurrentTheme,
  subscribeToTheme,
  type Theme,
} from "@/lib/theme";

interface ThemeOption {
  value: Theme;
  label: string;
  description: string;
  icon: LucideIcon;
}

const themeOptions: ThemeOption[] = [
  {
    value: "light",
    label: "Light",
    description: "Use the light Complex Admin theme.",
    icon: Sun,
  },
  {
    value: "dark",
    label: "Dark",
    description: "Use the dark graphite Complex Admin theme.",
    icon: Moon,
  },
];

/**
 * Reads/writes the same theme store as the topbar ThemeToggle
 * (localStorage + a shared change event), so the two stay in sync without
 * a second implementation.
 */
export function AppearanceSection() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    readCurrentTheme,
    getServerTheme,
  );

  return (
    <FormSection
      title="Appearance"
      description="Choose how Complex Admin appears on this device."
    >
      <div
        role="radiogroup"
        aria-label="Theme"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {themeOptions.map((option) => {
          const isActive = theme === option.value;
          const Icon = option.icon;
          return (
            <label
              key={option.value}
              className={`relative flex cursor-pointer flex-col gap-3 rounded-lg border p-4 outline-none transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-complex-red ${
                isActive
                  ? "border-red-line bg-red-tint"
                  : "border-surface-secondary hover:border-contrast"
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={isActive}
                onChange={() => applyTheme(option.value)}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    isActive
                      ? "bg-complex-red text-white"
                      : "bg-surface-secondary text-fg-muted"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                {isActive ? (
                  <Check
                    size={16}
                    className="text-complex-red"
                    aria-hidden="true"
                  />
                ) : null}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-fg">
                  {option.label}
                </span>
                <span className="text-xs text-fg-muted">
                  {option.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </FormSection>
  );
}
