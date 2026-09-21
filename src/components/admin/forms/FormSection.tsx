import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="rounded-lg border border-surface-secondary bg-card p-6">
      <div className="mb-5 flex flex-col gap-1 border-b border-surface-secondary pb-4">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        {description ? (
          <p className="text-xs text-fg-muted">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
