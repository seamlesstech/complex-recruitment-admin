import type { AppNotification } from "./types";

export const notifications: AppNotification[] = [
  {
    id: "notif-1",
    title: "New application",
    description: "Sarah Thompson applied for HGV Class 1 Driver",
    timestamp: "6 mins ago",
    read: false,
  },
  {
    id: "notif-2",
    title: "Staff request",
    description: "Harrison Logistics submitted a request for 4 drivers",
    timestamp: "22 mins ago",
    read: false,
  },
  {
    id: "notif-3",
    title: "Assignment",
    description: "Warehouse Operative has been assigned to you",
    timestamp: "40 mins ago",
    read: false,
  },
  {
    id: "notif-4",
    title: "New candidate",
    description: "A new candidate completed registration",
    timestamp: "2 hrs ago",
    read: true,
  },
];

export const unreadNotificationCount = notifications.filter(
  (n) => !n.read,
).length;
