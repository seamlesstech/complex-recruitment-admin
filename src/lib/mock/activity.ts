import type { ActivityEntityType, ActivityEvent } from "./types";

/**
 * System-wide operational history. Newest first, grouped contiguously by
 * day so the Activity page can group by date without re-sorting. Every
 * event references a real, existing mock record (job/application/
 * candidate/staff request/enquiry id) — nothing here is a dead link.
 */
export const activityEvents: ActivityEvent[] = [
  // ---- Today ----
  {
    id: "act-001",
    actor: "Moremi Molai",
    action: "added an internal note to",
    entityType: "candidate",
    entityId: "cand-sarah-thompson",
    entityReference: "CAN-6767",
    entityLabel: "Sarah Thompson",
    timestamp: "Today · 11:50",
  },
  {
    id: "act-002",
    actor: "Taurai",
    action: "assigned",
    entityType: "application",
    entityId: "capp-1067",
    entityReference: "APP-1067",
    entityLabel: "Sarah Thompson's application",
    detail: "to Taurai",
    timestamp: "Today · 11:28",
  },
  {
    id: "act-003",
    actor: "System",
    action: "received",
    entityType: "application",
    entityId: "capp-1067",
    entityReference: "APP-1067",
    entityLabel: "Sarah Thompson's application",
    detail: "for HGV Class 1 Driver",
    timestamp: "Today · 11:20",
  },
  {
    id: "act-004",
    actor: "System",
    action: "received a new enquiry from",
    entityType: "enquiry",
    entityId: "enq-0142",
    entityReference: "ENQ-0142",
    entityLabel: "Rachel Evans",
    timestamp: "Today · 10:42",
  },
  {
    id: "act-005",
    actor: "Taurai",
    action: "changed",
    entityType: "candidate",
    entityId: "cand-kwame-asante",
    entityReference: "CAN-5833",
    entityLabel: "Kwame Asante's availability",
    detail: "to Available",
    timestamp: "Today · 10:20",
  },
  {
    id: "act-006",
    actor: "Taurai",
    action: "changed",
    entityType: "application",
    entityId: "capp-1065",
    entityReference: "APP-1065",
    entityLabel: "Tendai Moyo's application",
    detail: "from New to Reviewing",
    timestamp: "Today · 10:15",
  },
  {
    id: "act-007",
    actor: "System",
    action: "received",
    entityType: "application",
    entityId: "capp-1066",
    entityReference: "APP-1066",
    entityLabel: "Kwame Asante's application",
    detail: "for Warehouse Operative",
    timestamp: "Today · 10:05",
  },
  {
    id: "act-008",
    actor: "Taurai",
    action: "changed",
    entityType: "candidate",
    entityId: "cand-tendai-moyo",
    entityReference: "CAN-8245",
    entityLabel: "Tendai Moyo's availability",
    detail: "to Available",
    timestamp: "Today · 09:50",
  },
  {
    id: "act-009",
    actor: "System",
    action: "received",
    entityType: "application",
    entityId: "capp-1065",
    entityReference: "APP-1065",
    entityLabel: "Tendai Moyo's application",
    detail: "for HGV Class 1 Driver",
    timestamp: "Today · 09:42",
  },
  {
    id: "act-010",
    actor: "System",
    action: "received a new enquiry from",
    entityType: "enquiry",
    entityId: "enq-0141",
    entityReference: "ENQ-0141",
    entityLabel: "Marcus Green",
    timestamp: "Today · 09:15",
  },
  {
    id: "act-011",
    actor: "System",
    action: "received a new staff request from",
    entityType: "staff-request",
    entityId: "sr-0128",
    entityReference: "REQ-0128",
    entityLabel: "ABC Logistics",
    detail: "for 12 Warehouse Operatives",
    timestamp: "Today · 08:40",
  },
  {
    id: "act-012",
    actor: "System",
    action: "received a new staff request from",
    entityType: "staff-request",
    entityId: "sr-0127",
    entityReference: "REQ-0127",
    entityLabel: "Metro Distribution",
    detail: "for 4 HGV Class 1 Drivers",
    timestamp: "Today · 07:15",
  },

  // ---- Yesterday ----
  {
    id: "act-014",
    actor: "System",
    action: "received a new staff request from",
    entityType: "staff-request",
    entityId: "sr-0126",
    entityReference: "REQ-0126",
    entityLabel: "Westbridge Construction",
    detail: "for 6 Site Labourers",
    timestamp: "Yesterday · 16:50",
  },
  {
    id: "act-015",
    actor: "Taurai",
    action: "assigned",
    entityType: "application",
    entityId: "capp-1061",
    entityReference: "APP-1061",
    entityLabel: "James Carter's application",
    detail: "to Taurai",
    timestamp: "Yesterday · 15:20",
  },
  {
    id: "act-016",
    actor: "System",
    action: "received",
    entityType: "application",
    entityId: "capp-1061",
    entityReference: "APP-1061",
    entityLabel: "James Carter's application",
    detail: "for Van Driver",
    timestamp: "Yesterday · 15:05",
  },
  {
    id: "act-017",
    actor: "Taurai",
    action: "converted",
    entityType: "enquiry",
    entityId: "enq-0136",
    entityReference: "ENQ-0136",
    entityLabel: "ENQ-0136",
    detail: "to Staff Request REQ-0122",
    timestamp: "Yesterday · 10:05",
  },
  {
    id: "act-018",
    actor: "System",
    action: "received",
    entityType: "application",
    entityId: "capp-1058",
    entityReference: "APP-1058",
    entityLabel: "Chloe Robertson's application",
    detail: "for 7.5 Tonne Driver",
    timestamp: "Yesterday · 09:50",
  },

  // ---- 19 September ----
  {
    id: "act-019",
    actor: "System",
    action: "received",
    entityType: "application",
    entityId: "capp-1057",
    entityReference: "APP-1057",
    entityLabel: "Liam O'Connor's application",
    detail: "for Telehandler Operator",
    timestamp: "19 Sept · 17:10",
  },
  {
    id: "act-022",
    actor: "Moremi Molai",
    action: "changed",
    entityType: "application",
    entityId: "capp-1056",
    entityReference: "APP-1056",
    entityLabel: "Grace Chikwature's application",
    detail: "from Shortlisted to Offered",
    timestamp: "19 Sept · 14:00",
  },
  {
    id: "act-023",
    actor: "System",
    action: "received a new staff request from",
    entityType: "staff-request",
    entityId: "sr-0122",
    entityReference: "REQ-0122",
    entityLabel: "Westbridge Construction",
    detail: "for 10 Construction Labourers",
    timestamp: "19 Sept · 10:05",
  },

  // ---- 18 September ----
  {
    id: "act-024",
    actor: "Shingi",
    action: "converted",
    entityType: "enquiry",
    entityId: "enq-0131",
    entityReference: "ENQ-0131",
    entityLabel: "ENQ-0131",
    detail: "to Candidate CAN-2903",
    timestamp: "18 Sept · 16:50",
  },
  {
    id: "act-025",
    actor: "Shingi",
    action: "changed",
    entityType: "application",
    entityId: "capp-1055",
    entityReference: "APP-1055",
    entityLabel: "Ryan Mitchell's application",
    detail: "from Interview to Placed",
    timestamp: "18 Sept · 16:30",
  },
  {
    id: "act-026",
    actor: "System",
    action: "received",
    entityType: "application",
    entityId: "capp-1055",
    entityReference: "APP-1055",
    entityLabel: "Ryan Mitchell's application",
    detail: "for HGV Class 1 Driver",
    timestamp: "18 Sept · 16:00",
  },
  {
    id: "act-027",
    actor: "System",
    action: "received a new staff request from",
    entityType: "staff-request",
    entityId: "sr-0120",
    entityReference: "REQ-0120",
    entityLabel: "Northway Distribution",
    detail: "for 5 Site Operatives",
    timestamp: "18 Sept · 15:30",
  },
  {
    id: "act-028",
    actor: "Taurai",
    action: "updated fulfilment on",
    entityType: "staff-request",
    entityId: "sr-0119",
    entityReference: "REQ-0119",
    entityLabel: "Staff Request REQ-0119",
    detail: "from 0 / 4 to 2 / 4",
    timestamp: "18 Sept · 14:00",
  },
  {
    id: "act-029",
    actor: "System",
    action: "received a new staff request from",
    entityType: "staff-request",
    entityId: "sr-0119",
    entityReference: "REQ-0119",
    entityLabel: "Prime Haulage",
    detail: "for 4 Class 2 Drivers",
    timestamp: "18 Sept · 09:10",
  },

  // ---- 17 September ----
  {
    id: "act-030",
    actor: "Moremi Molai",
    action: "converted",
    entityType: "enquiry",
    entityId: "enq-0128",
    entityReference: "ENQ-0128",
    entityLabel: "ENQ-0128",
    detail: "to Staff Request REQ-0117",
    timestamp: "17 Sept · 15:45",
  },
  {
    id: "act-031",
    actor: "System",
    action: "received a new enquiry from",
    entityType: "enquiry",
    entityId: "enq-0128",
    entityReference: "ENQ-0128",
    entityLabel: "Peter Nkomo",
    timestamp: "17 Sept · 15:20",
  },
  {
    id: "act-032",
    actor: "Shingi",
    action: "changed",
    entityType: "staff-request",
    entityId: "sr-0117",
    entityReference: "REQ-0117",
    entityLabel: "Staff Request REQ-0117",
    detail: "from Sourcing to Filled",
    timestamp: "17 Sept · 10:00",
  },
  {
    id: "act-033",
    actor: "Taurai",
    action: "changed",
    entityType: "enquiry",
    entityId: "enq-0126",
    entityReference: "ENQ-0126",
    entityLabel: "Enquiry ENQ-0126",
    detail: "from New to Responded",
    timestamp: "17 Sept · 09:00",
  },
  {
    id: "act-034",
    actor: "System",
    action: "received a new staff request from",
    entityType: "staff-request",
    entityId: "sr-0117",
    entityReference: "REQ-0117",
    entityLabel: "Trident Industrial Services",
    detail: "for 3 Telehandler Operators",
    timestamp: "17 Sept · 08:20",
  },

  // ---- 16 September ----
  {
    id: "act-035",
    actor: "System",
    action: "received",
    entityType: "application",
    entityId: "capp-1051",
    entityReference: "APP-1051",
    entityLabel: "Sophie Turner's application",
    detail: "for Van Driver",
    timestamp: "16 Sept · 15:30",
  },
  {
    id: "act-036",
    actor: "System",
    action: "received a new enquiry from",
    entityType: "enquiry",
    entityId: "enq-0125",
    entityReference: "ENQ-0125",
    entityLabel: "Laura Mitchell",
    timestamp: "16 Sept · 14:00",
  },

  // ---- 15 September ----
  {
    id: "act-037",
    actor: "System",
    action: "received a new staff request from",
    entityType: "staff-request",
    entityId: "sr-0114",
    entityReference: "REQ-0114",
    entityLabel: "Metro Distribution",
    detail: "for 6 Warehouse Operatives",
    timestamp: "15 Sept · 14:10",
  },
  {
    id: "act-038",
    actor: "Moremi Molai",
    action: "changed",
    entityType: "application",
    entityId: "capp-1048",
    entityReference: "APP-1048",
    entityLabel: "Tendai Moyo's application",
    detail: "from Interview to Placed",
    timestamp: "15 Sept · 10:30",
  },

  // ---- Earlier this month ----
  {
    id: "act-039",
    actor: "Shingi",
    action: "closed",
    entityType: "job",
    entityId: "job-0195",
    entityReference: "JOB-0195",
    entityLabel: "HGV Class 1 Driver",
    timestamp: "12 Sept · 11:00",
  },
  {
    id: "act-040",
    actor: "Moremi Molai",
    action: "closed",
    entityType: "job",
    entityId: "job-0183",
    entityReference: "JOB-0183",
    entityLabel: "Construction Labourer",
    timestamp: "10 Sept · 09:30",
  },
  {
    id: "act-042",
    actor: "Moremi Molai",
    action: "created",
    entityType: "job",
    entityId: "job-0229",
    entityReference: "JOB-0229",
    entityLabel: "Construction Labourer",
    detail: "as a draft",
    timestamp: "15 Sept · 08:00",
  },
  {
    id: "act-043",
    actor: "Shingi",
    action: "registered",
    entityType: "candidate",
    entityId: "cand-connor-walsh",
    entityReference: "CAN-7626",
    entityLabel: "Connor Walsh",
    timestamp: "2 Sept · 10:00",
  },
  {
    id: "act-044",
    actor: "Taurai",
    action: "published",
    entityType: "job",
    entityId: "job-0241",
    entityReference: "JOB-0241",
    entityLabel: "HGV Class 1 Driver",
    timestamp: "28 Aug · 09:00",
  },
];

export const entityTypeLabels: Record<ActivityEntityType, string> = {
  job: "Job",
  application: "Application",
  candidate: "Candidate",
  "staff-request": "Staff Request",
  enquiry: "Enquiry",
};

export function entityHref(
  entityType: ActivityEntityType,
  entityId: string,
): string {
  switch (entityType) {
    case "job":
      return `/jobs/${entityId}/edit`;
    case "application":
      return `/applications/${entityId}`;
    case "candidate":
      return `/candidates/${entityId}`;
    case "staff-request":
      return `/staff-requests/${entityId}`;
    case "enquiry":
      return `/enquiries/${entityId}`;
  }
}

export const activityEntityTypeFilterOptions = [
  "All records",
  "Jobs",
  "Applications",
  "Candidates",
  "Staff Requests",
  "Enquiries",
] as const;

const entityTypeFilterToType: Record<
  Exclude<(typeof activityEntityTypeFilterOptions)[number], "All records">,
  ActivityEntityType
> = {
  Jobs: "job",
  Applications: "application",
  Candidates: "candidate",
  "Staff Requests": "staff-request",
  Enquiries: "enquiry",
};

export function resolveEntityTypeFilter(
  option: string,
): ActivityEntityType | null {
  if (option === "All records") return null;
  return (
    entityTypeFilterToType[
      option as keyof typeof entityTypeFilterToType
    ] ?? null
  );
}

export const activityUserFilterOptions = [
  "All users",
  "Moremi Molai",
  "Taurai",
  "Shingi",
  "System",
] as const;

export const activityDateFilterOptions = [
  "All time",
  "Today",
  "Yesterday",
  "Last 7 days",
  "Last 30 days",
] as const;

/** A short preview for the Dashboard's "Recent activity" panel. */
export const recentActivity: ActivityEvent[] = activityEvents.slice(0, 4);

// ---- Timestamp resolution -------------------------------------------------
// The mock dataset stores relative display strings ("Today · 10:42",
// "19 Sept · 11:05"), consistent with every other list in the app. These
// helpers resolve that string to a real Date (anchored to "today") so the
// page can sort chronologically and support the Date filter without
// depending on the array's own insertion order.

const TODAY_DATE = new Date(2026, 8, 22); // 22 September 2026

const MONTH_INDEX: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Sept: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
};

const MONTH_FULL_NAME: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Sept: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

function resolveActivityDate(timestamp: string): Date {
  const [dayPart] = timestamp.split(" · ");
  if (dayPart === "Today") return new Date(TODAY_DATE);
  if (dayPart === "Yesterday") {
    const date = new Date(TODAY_DATE);
    date.setDate(date.getDate() - 1);
    return date;
  }
  const [dayStr, monthStr] = dayPart.split(" ");
  const day = Number(dayStr);
  const month = MONTH_INDEX[monthStr];
  if (!Number.isNaN(day) && month !== undefined) {
    return new Date(TODAY_DATE.getFullYear(), month, day);
  }
  return new Date(TODAY_DATE);
}

export function resolveActivityDateTime(timestamp: string): number {
  const [, timePart] = timestamp.split(" · ");
  const date = resolveActivityDate(timestamp);
  if (timePart) {
    const [hours, minutes] = timePart.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
  return date.getTime();
}

export function activityDateHeading(timestamp: string): string {
  const [dayPart] = timestamp.split(" · ");
  if (dayPart === "Today" || dayPart === "Yesterday") return dayPart;
  const [dayStr, monthStr] = dayPart.split(" ");
  return `${dayStr} ${MONTH_FULL_NAME[monthStr] ?? monthStr}`;
}

export function isWithinDateFilter(timestamp: string, filter: string): boolean {
  if (filter === "All time") return true;
  const diffDays = Math.round(
    (TODAY_DATE.getTime() - resolveActivityDate(timestamp).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  switch (filter) {
    case "Today":
      return diffDays === 0;
    case "Yesterday":
      return diffDays === 1;
    case "Last 7 days":
      return diffDays >= 0 && diffDays <= 6;
    case "Last 30 days":
      return diffDays >= 0 && diffDays <= 29;
    default:
      return true;
  }
}

export interface ActivityGroup {
  heading: string;
  events: ActivityEvent[];
}

/** Groups already-sorted (newest-first) events into contiguous date buckets. */
export function groupActivityByDate(events: ActivityEvent[]): ActivityGroup[] {
  const groups: ActivityGroup[] = [];
  for (const event of events) {
    const heading = activityDateHeading(event.timestamp);
    const currentGroup = groups[groups.length - 1];
    if (currentGroup && currentGroup.heading === heading) {
      currentGroup.events.push(event);
    } else {
      groups.push({ heading, events: [event] });
    }
  }
  return groups;
}
