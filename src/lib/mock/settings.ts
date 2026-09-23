import type {
  NotificationPreferenceChannels,
  NotificationPreferenceDefinition,
  NotificationPreferenceKey,
} from "./types";

// The Settings "My profile" form now seeds from the real authenticated
// profile (see src/app/(admin)/settings/page.tsx), not from mock data —
// there is deliberately no mock currentUser/team-derived export here
// anymore, since that was the source of the shell-vs-Team/Settings
// current-user inconsistency.

export const notificationPreferenceEvents: NotificationPreferenceDefinition[] = [
  {
    key: "newJobApplication",
    label: "New job application",
    description: "When a candidate submits an application.",
  },
  {
    key: "newStaffRequest",
    label: "New staff request",
    description: "When an employer submits a staffing request.",
  },
  {
    key: "newCandidateRegistration",
    label: "New candidate registration",
    description: "When a new candidate registers with Complex Recruitment.",
  },
  {
    key: "newEnquiry",
    label: "New enquiry",
    description: "When a new enquiry is received.",
  },
  {
    key: "assignedToMe",
    label: "Assigned to me",
    description:
      "When a job, application, staff request or other record is assigned to you.",
  },
  {
    key: "importantStatusChanges",
    label: "Important status changes",
    description: "When important recruitment records change status.",
  },
];

/** Mock defaults only — not a final product decision. */
export const initialNotificationPreferences: Record<
  NotificationPreferenceKey,
  NotificationPreferenceChannels
> = {
  newJobApplication: { inApp: true, email: true },
  newStaffRequest: { inApp: true, email: true },
  newCandidateRegistration: { inApp: true, email: false },
  newEnquiry: { inApp: true, email: false },
  assignedToMe: { inApp: true, email: true },
  importantStatusChanges: { inApp: true, email: false },
};
