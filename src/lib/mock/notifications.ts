import { activityDateHeading, resolveActivityDateTime } from "./activity";
import type { Notification, NotificationType } from "./types";

/**
 * Operational events that may need Moremi Molai's attention — a curated
 * subset, not one row per Activity event. Every notification references a
 * real, existing mock record so its link is never dead. Newest first.
 */
export const notifications: Notification[] = [
  // ---- Today ----
  {
    id: "notif-001",
    type: "new-enquiry",
    title: "New enquiry",
    message: "Rachel Evans from ABC Logistics submitted an enquiry.",
    timestamp: "Today · 10:42",
    read: false,
    recipient: "Moremi Molai",
    entityType: "enquiry",
    entityId: "enq-0142",
    entityReference: "ENQ-0142",
  },
  {
    id: "notif-002",
    type: "new-application",
    title: "New application",
    message: "Sarah Thompson applied for HGV Class 1 Driver.",
    timestamp: "Today · 11:20",
    read: false,
    recipient: "Moremi Molai",
    entityType: "application",
    entityId: "capp-1067",
    entityReference: "APP-1067",
  },
  {
    id: "notif-003",
    type: "new-application",
    title: "New application",
    message: "Kwame Asante applied for Warehouse Operative.",
    timestamp: "Today · 10:05",
    read: false,
    recipient: "Moremi Molai",
    entityType: "application",
    entityId: "capp-1066",
    entityReference: "APP-1066",
  },
  {
    id: "notif-004",
    type: "status-change",
    title: "Application status changed",
    message: "Tendai Moyo's application moved to Reviewing.",
    timestamp: "Today · 10:15",
    read: true,
    recipient: "Moremi Molai",
    entityType: "application",
    entityId: "capp-1065",
    entityReference: "APP-1065",
  },
  {
    id: "notif-005",
    type: "new-candidate",
    title: "New candidate",
    message: "Emily Foster completed registration.",
    timestamp: "Today · 09:15",
    read: false,
    recipient: "Moremi Molai",
    entityType: "candidate",
    entityId: "cand-emily-foster",
    entityReference: "CAN-2903",
  },
  {
    id: "notif-006",
    type: "new-candidate",
    title: "New candidate",
    message: "Kwame Asante completed registration.",
    timestamp: "Today · 08:50",
    read: true,
    recipient: "Moremi Molai",
    entityType: "candidate",
    entityId: "cand-kwame-asante",
    entityReference: "CAN-5833",
  },
  {
    id: "notif-007",
    type: "assignment",
    title: "Assigned to you",
    message: "Warehouse Operative has been assigned to you.",
    timestamp: "Today · 09:00",
    read: false,
    recipient: "Moremi Molai",
    entityType: "job",
    entityId: "job-0238",
    entityReference: "JOB-0238",
  },
  {
    id: "notif-008",
    type: "new-staff-request",
    title: "New staff request",
    message: "ABC Logistics submitted a request for 12 Warehouse Operatives.",
    timestamp: "Today · 08:40",
    read: false,
    recipient: "Moremi Molai",
    entityType: "staff-request",
    entityId: "sr-0128",
    entityReference: "REQ-0128",
  },
  {
    id: "notif-009",
    type: "new-staff-request",
    title: "New staff request",
    message: "Metro Distribution submitted a request for 4 HGV Class 1 Drivers.",
    timestamp: "Today · 07:15",
    read: true,
    recipient: "Moremi Molai",
    entityType: "staff-request",
    entityId: "sr-0127",
    entityReference: "REQ-0127",
  },

  // ---- Yesterday ----
  {
    id: "notif-010",
    type: "new-enquiry",
    title: "New enquiry",
    message: "Marcus Green submitted a question about current HGV vacancies.",
    timestamp: "Today · 09:15",
    read: true,
    recipient: "Moremi Molai",
    entityType: "enquiry",
    entityId: "enq-0141",
    entityReference: "ENQ-0141",
  },
  {
    id: "notif-011",
    type: "new-enquiry",
    title: "New enquiry",
    message: "Andrew Collins from Fleet Training UK submitted a partnership enquiry.",
    timestamp: "Yesterday · 16:40",
    read: true,
    recipient: "Moremi Molai",
    entityType: "enquiry",
    entityId: "enq-0139",
    entityReference: "ENQ-0139",
  },
  {
    id: "notif-012",
    type: "new-application",
    title: "New application",
    message: "James Carter applied for Van Driver.",
    timestamp: "Yesterday · 15:05",
    read: true,
    recipient: "Moremi Molai",
    entityType: "application",
    entityId: "capp-1061",
    entityReference: "APP-1061",
  },
  {
    id: "notif-013",
    type: "status-change",
    title: "Application status changed",
    message: "James Carter's application moved to Interview.",
    timestamp: "Yesterday · 18:00",
    read: true,
    recipient: "Moremi Molai",
    entityType: "application",
    entityId: "capp-1061",
    entityReference: "APP-1061",
  },
  {
    id: "notif-014",
    type: "new-staff-request",
    title: "New staff request",
    message: "Westbridge Construction submitted a request for 6 Site Labourers.",
    timestamp: "Yesterday · 16:50",
    read: true,
    recipient: "Moremi Molai",
    entityType: "staff-request",
    entityId: "sr-0126",
    entityReference: "REQ-0126",
  },
  {
    id: "notif-015",
    type: "new-enquiry",
    title: "New enquiry",
    message: "Chloe Adams from Westbridge Construction submitted an enquiry.",
    timestamp: "Yesterday · 09:30",
    read: true,
    recipient: "Moremi Molai",
    entityType: "enquiry",
    entityId: "enq-0136",
    entityReference: "ENQ-0136",
  },
  {
    id: "notif-016",
    type: "assignment",
    title: "Assigned to you",
    message: "Forklift Driver has been assigned to you.",
    timestamp: "Yesterday · 11:05",
    read: true,
    recipient: "Moremi Molai",
    entityType: "job",
    entityId: "job-0225",
    entityReference: "JOB-0225",
  },
  {
    id: "notif-017",
    type: "new-candidate",
    title: "New candidate",
    message: "Connor Walsh completed registration.",
    timestamp: "Yesterday · 10:00",
    read: true,
    recipient: "Moremi Molai",
    entityType: "candidate",
    entityId: "cand-connor-walsh",
    entityReference: "CAN-7626",
  },

  // ---- Earlier ----
  {
    id: "notif-018",
    type: "new-application",
    title: "New application",
    message: "Liam O'Connor applied for Telehandler Operator.",
    timestamp: "19 Sept · 17:10",
    read: true,
    recipient: "Moremi Molai",
    entityType: "application",
    entityId: "capp-1057",
    entityReference: "APP-1057",
  },
  {
    id: "notif-019",
    type: "new-staff-request",
    title: "New staff request",
    message: "Westbridge Construction submitted a request for 10 Construction Labourers.",
    timestamp: "19 Sept · 10:05",
    read: true,
    recipient: "Moremi Molai",
    entityType: "staff-request",
    entityId: "sr-0122",
    entityReference: "REQ-0122",
  },
  {
    id: "notif-020",
    type: "status-change",
    title: "Staff request status changed",
    message: "ABC Logistics' request for Loading Bay Operatives is now Filled.",
    timestamp: "19 Sept · 14:20",
    read: true,
    recipient: "Moremi Molai",
    entityType: "staff-request",
    entityId: "sr-0123",
    entityReference: "REQ-0123",
  },
  {
    id: "notif-021",
    type: "assignment",
    title: "Assigned to you",
    message: "Loading Bay Operative has been assigned to you.",
    timestamp: "19 Sept · 08:45",
    read: true,
    recipient: "Moremi Molai",
    entityType: "job",
    entityId: "job-0210",
    entityReference: "JOB-0210",
  },
  {
    id: "notif-022",
    type: "new-candidate",
    title: "New candidate",
    message: "Aisha Patel completed registration.",
    timestamp: "19 Sept · 14:30",
    read: true,
    recipient: "Moremi Molai",
    entityType: "candidate",
    entityId: "cand-aisha-patel",
    entityReference: "CAN-2536",
  },
  {
    id: "notif-023",
    type: "new-enquiry",
    title: "New enquiry",
    message: "Olivia Hart from Metro Distribution needs 4 forklift drivers urgently.",
    timestamp: "19 Sept · 08:40",
    read: true,
    recipient: "Moremi Molai",
    entityType: "enquiry",
    entityId: "enq-0132",
    entityReference: "ENQ-0132",
  },
];

export const notificationTypeLabels: Record<NotificationType, string> = {
  "new-application": "New application",
  "new-staff-request": "New staff request",
  "new-candidate": "New candidate",
  "new-enquiry": "New enquiry",
  assignment: "Assignment",
  "status-change": "Status change",
};

export const notificationTypeFilterOptions = [
  "All types",
  "New application",
  "New staff request",
  "New candidate",
  "New enquiry",
  "Assignment",
  "Status change",
] as const;

const notificationTypeFilterToType: Record<
  Exclude<(typeof notificationTypeFilterOptions)[number], "All types">,
  NotificationType
> = {
  "New application": "new-application",
  "New staff request": "new-staff-request",
  "New candidate": "new-candidate",
  "New enquiry": "new-enquiry",
  Assignment: "assignment",
  "Status change": "status-change",
};

export function resolveNotificationTypeFilter(
  option: string,
): NotificationType | null {
  if (option === "All types") return null;
  return (
    notificationTypeFilterToType[
      option as keyof typeof notificationTypeFilterToType
    ] ?? null
  );
}

export const notificationReadStatusFilterOptions = [
  "All",
  "Unread",
  "Read",
] as const;

/** A short preview for the topbar dropdown. */
export function recentNotifications(
  items: Notification[],
  count = 5,
): Notification[] {
  return sortNotificationsByRecency(items).slice(0, count);
}

export function sortNotificationsByRecency(
  items: Notification[],
): Notification[] {
  return [...items].sort(
    (a, b) =>
      resolveActivityDateTime(b.timestamp) -
      resolveActivityDateTime(a.timestamp),
  );
}

export interface NotificationGroup {
  heading: string;
  notifications: Notification[];
}

/** Groups already-sorted (newest-first) notifications into contiguous date buckets. */
export function groupNotificationsByDate(
  items: Notification[],
): NotificationGroup[] {
  const groups: NotificationGroup[] = [];
  for (const item of items) {
    const heading = activityDateHeading(item.timestamp);
    const currentGroup = groups[groups.length - 1];
    if (currentGroup && currentGroup.heading === heading) {
      currentGroup.notifications.push(item);
    } else {
      groups.push({ heading, notifications: [item] });
    }
  }
  return groups;
}
