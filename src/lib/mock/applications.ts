import type { Application } from "./types";

export const recentApplications: Application[] = [
  {
    id: "app-1",
    candidate: "Tendai Moyo",
    role: "HGV Class 1 Driver",
    sector: "Driving & Transport",
    applied: "Today · 09:42",
    status: "New",
    assignee: "Taurai",
  },
  {
    id: "app-2",
    candidate: "Sarah Jones",
    role: "Warehouse Operative",
    sector: "Industrial & Warehouse",
    applied: "Today · 08:16",
    status: "Reviewing",
    assignee: "Moremi",
  },
  {
    id: "app-3",
    candidate: "Ravi Patel",
    role: "Site Engineer",
    sector: "Construction & Engineering",
    applied: "Yesterday · 15:10",
    status: "Shortlisted",
    assignee: "Shingi",
  },
  {
    id: "app-4",
    candidate: "Amelia Brown",
    role: "Transport Administrator",
    sector: "Business & Operational Support",
    applied: "Yesterday · 16:45",
    status: "New",
    assignee: null,
  },
];
