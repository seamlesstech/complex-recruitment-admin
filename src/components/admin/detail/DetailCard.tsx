import type { ReactNode } from "react";
import { SectionHeader } from "@/components/admin/SectionHeader";

interface DetailCardProps {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  children: ReactNode;
}

export function DetailCard({
  title,
  actionLabel,
  actionHref,
  children,
}: DetailCardProps) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-surface-secondary bg-card p-6">
      <SectionHeader
        title={title}
        actionLabel={actionLabel}
        actionHref={actionHref}
      />
      {children}
    </section>
  );
}
