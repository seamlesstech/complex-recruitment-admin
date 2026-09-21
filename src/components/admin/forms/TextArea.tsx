import type { TextareaHTMLAttributes } from "react";
import { fieldBaseClass, fieldBorderClass } from "./styles";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

export function TextArea({
  hasError,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <textarea
      className={`${fieldBaseClass} ${fieldBorderClass(hasError)} resize-y px-3 py-2.5 ${className}`}
      {...props}
    />
  );
}
