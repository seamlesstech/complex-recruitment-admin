import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { fieldBaseClass, fieldBorderClass } from "./styles";

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

export function SelectInput({
  hasError,
  className = "",
  children,
  ...props
}: SelectInputProps) {
  return (
    <div className="relative">
      <select
        className={`${fieldBaseClass} ${fieldBorderClass(hasError)} h-10 appearance-none px-3 pr-9 ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-fg-muted"
      />
    </div>
  );
}
