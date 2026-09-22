import type { ReactNode } from "react";

export function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[10.5px] font-medium uppercase tracking-wide text-fg-muted/80">
        {label}
      </dt>
      <dd className="text-sm text-fg">{children}</dd>
    </div>
  );
}
