import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/admin/SectionHeader";
import { attentionItems } from "@/lib/mock/attention";

export function AttentionList() {
  return (
    <section className="flex flex-col gap-3">
      <SectionHeader title="Needs your attention" />
      <div className="overflow-hidden rounded-lg border border-surface-secondary bg-card">
        <ul className="divide-y divide-surface-secondary">
          {attentionItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="group flex items-center gap-3 px-4 py-3.5 transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-complex-red"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    item.urgent ? "bg-complex-red" : "bg-marker-neutral"
                  }`}
                  aria-hidden="true"
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
                  <span className="text-sm font-medium text-fg">
                    {item.title}
                  </span>
                  <span className="text-xs text-fg-muted">
                    {item.context}
                  </span>
                </span>
                <ChevronRight
                  size={16}
                  className="shrink-0 text-fg-muted/50 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-fg"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
