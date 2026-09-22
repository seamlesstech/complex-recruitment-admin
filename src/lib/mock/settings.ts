import { teamMembers } from "./team";
import { currentUser } from "./user";
import type {
  NotificationPreferenceChannels,
  NotificationPreferenceDefinition,
  NotificationPreferenceKey,
  UserProfileSettings,
} from "./types";

const currentTeamMember = teamMembers.find((member) => member.isCurrentUser);

/** Seeds the Settings "My profile" form — reuses the Team record's email so the two screens stay coherent. */
export const initialProfileSettings: UserProfileSettings = {
  name: currentUser.name,
  email: currentTeamMember?.email ?? "moremi.molai@complexrecruitment.co.uk",
  role: currentUser.role,
  initials: currentUser.initials,
};

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
