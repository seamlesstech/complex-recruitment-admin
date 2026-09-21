export const THEME_STORAGE_KEY = "complex-admin-theme";
const THEME_CHANGE_EVENT = "complex-admin-theme-change";

export type Theme = "light" | "dark";

/**
 * Executed as an inline, beforeInteractive script so the correct theme
 * class is applied before first paint (no light -> dark flash) and
 * before React hydrates (no hydration mismatch).
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('${THEME_STORAGE_KEY}');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage unavailable — theme still applies for this session
  }
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export function readCurrentTheme(): Theme {
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

/** For useSyncExternalStore — subscribes to theme changes made via applyTheme. */
export function subscribeToTheme(onChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
}

export function getServerTheme(): Theme {
  return "light";
}
