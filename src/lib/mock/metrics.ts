import type { Metric } from "./types";

export const dashboardMetrics: Metric[] = [
  {
    id: "open-jobs",
    label: "Open jobs",
    value: 12,
    context: "4 closing this week",
    href: "/jobs",
  },
  {
    id: "new-applications",
    label: "New applications",
    value: 8,
    context: "Since yesterday",
    href: "/applications",
    needsAttention: true,
  },
  {
    id: "new-staff-requests",
    label: "New staff requests",
    value: 3,
    context: "2 unassigned",
    href: "/staff-requests",
    needsAttention: true,
  },
  {
    id: "registered-candidates",
    label: "Registered candidates",
    value: 146,
    context: "+12 this month",
    href: "/candidates",
  },
];
