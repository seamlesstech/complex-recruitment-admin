import type { AttentionItem } from "./types";

export const attentionItems: AttentionItem[] = [
  {
    id: "attn-1",
    title: "3 new applications awaiting review",
    context: "Submitted in the last 24 hours",
    href: "/applications",
    urgent: true,
  },
  {
    id: "attn-2",
    title: "2 staff requests have not been assigned",
    context: "Waiting on an owner",
    href: "/staff-requests",
    urgent: true,
  },
  {
    id: "attn-3",
    title: "1 vacancy closes tomorrow",
    context: "HGV Class 1 Driver — Metro Distribution",
    href: "/jobs",
  },
];
