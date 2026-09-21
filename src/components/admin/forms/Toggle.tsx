interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function Toggle({ id, label, checked, onChange }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-3"
    >
      <span className="text-sm text-fg">{label}</span>
      <span className="relative inline-flex h-5 w-9 shrink-0 items-center">
        <input
          id={id}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          className="peer sr-only"
        />
        <span
          className="absolute inset-0 rounded-full bg-surface-secondary transition-colors duration-150 peer-checked:bg-complex-red peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-complex-red"
          aria-hidden="true"
        />
        <span
          className="absolute left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-150 peer-checked:translate-x-4"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
