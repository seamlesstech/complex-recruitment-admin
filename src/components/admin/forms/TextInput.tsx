import type { InputHTMLAttributes } from "react";
import { fieldBaseClass, fieldBorderClass } from "./styles";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export function TextInput({
  hasError,
  className = "",
  ...props
}: TextInputProps) {
  return (
    <input
      className={`${fieldBaseClass} ${fieldBorderClass(hasError)} h-10 px-3 placeholder:text-fg-muted/70 ${className}`}
      {...props}
    />
  );
}
