export function fieldBorderClass(hasError?: boolean) {
  return hasError ? "border-complex-red/50" : "border-surface-secondary";
}

export const fieldBaseClass =
  "w-full rounded-md border bg-input text-sm text-fg outline-none transition-colors duration-150 hover:border-contrast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red";
