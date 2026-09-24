export type ApplicationStatus =
  | "New"
  | "Reviewing"
  | "Shortlisted"
  | "Interview"
  | "Offered"
  | "Placed"
  | "Rejected"
  | "Withdrawn";

/**
 * An employer/client asking Complex Recruitment to supply workers.
 * Deliberately separate from `Job` — a Staff Request represents demand from
 * a client and may later result in one or more Jobs, but is not itself a
 * vacancy.
 */
export type StaffRequestStatus =
  | "New"
  | "Assigned"
  | "Sourcing"
  | "Partially Filled"
  | "Filled"
  | "Closed";

/** Kept distinct from status — urgency is an attribute, not a lifecycle stage. */
export type StaffRequestUrgency = "Standard" | "Urgent";

export type JobStatus = "Open" | "Draft" | "Closed";

/**
 * A candidate's current working availability — deliberately separate from
 * `ApplicationStatus`. Availability describes the PERSON; ApplicationStatus
 * describes the state of one of their applications.
 */
export type CandidateAvailability =
  | "Available"
  | "Working"
  | "Unavailable"
  | "Inactive";

/** The Settings "My profile" section's locally-editable copy of the current user. */
export interface UserProfileSettings {
  name: string;
  email: string;
  /** Read-only in Settings — role changes are not designed yet. */
  role: string;
  initials: string;
}

/**
 * Notification concepts already established elsewhere in the product
 * (Recent Activity, the Notification dropdown) — deliberately not one row
 * per audit event.
 */
export type NotificationPreferenceKey =
  | "newJobApplication"
  | "newStaffRequest"
  | "newCandidateRegistration"
  | "newEnquiry"
  | "assignedToMe"
  | "importantStatusChanges";

export interface NotificationPreferenceChannels {
  inApp: boolean;
  email: boolean;
}

export interface NotificationPreferenceDefinition {
  key: NotificationPreferenceKey;
  label: string;
  description: string;
}

/**
 * UI display-label vocabulary for the Team screen — the same values as
 * public.profiles.role (see lib/auth/roles.ts's ROLE_LABELS), just under a
 * name that matches this screen's other UI-vocabulary types (JobStatus,
 * etc). Real data, sourced from lib/team/queries.ts.
 */
export type TeamRole = "Super Admin" | "Admin / Manager" | "Recruiter" | "Viewer";

/**
 * A team member's account state in Complex Admin itself — distinct from any
 * operational status (job/application/etc). Display-label equivalent of
 * public.profiles.status.
 */
export type TeamMemberStatus = "Active" | "Invited" | "Disabled";

/**
 * A real internal Complex Admin user, sourced from public.profiles (see
 * lib/team/queries.ts). `id` is the real profiles.id (= auth.users.id) —
 * used both to key real workload data and to determine "You" by identity,
 * never by matching name/email/position.
 */
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: TeamRole;
  status: TeamMemberStatus;
  /** Display string derived from real joined_at/invited_at — never fabricated. */
  lastActive: string;
  /** ISO date, e.g. "2026-08-28" — null if not yet joined. */
  joinedAt: string | null;
  /** ISO date, e.g. "2026-09-18" — null if not currently invited. */
  invitedAt: string | null;
}

export interface Metric {
  id: string;
  label: string;
  value: number;
  context: string;
  href: string;
  needsAttention?: boolean;
}

export interface AttentionItem {
  id: string;
  title: string;
  context: string;
  href: string;
  urgent?: boolean;
}

export interface Application {
  id: string;
  candidate: string;
  role: string;
  sector: string;
  applied: string;
  status: ApplicationStatus;
  assignee: string | null;
}

export interface StaffRequest {
  id: string;
  reference: string;
  client: string;
  requirementTitle: string;
  quantityRequired: number;
  quantityFilled: number;
  sector: string;
  location: string;
  /** Display string, e.g. "23 Sep", "Immediate" — null renders as "No date set". */
  neededBy: string | null;
  urgency: StaffRequestUrgency;
  owner: string | null;
  status: StaffRequestStatus;
  submittedAt: string;
}

/**
 * System-wide, human-readable operational history (distinct from the
 * future backend audit log, and from notifications). Kept structured
 * rather than one pre-written sentence so the UI can render a consistent
 * entity chip/link without parsing prose.
 */
export type ActivityEntityType =
  | "job"
  | "application"
  | "candidate"
  | "staff-request"
  | "enquiry";

export interface ActivityEvent {
  id: string;
  /** "Moremi Molai" | "Taurai" | "Shingi" | "System" */
  actor: string;
  /** Verb phrase spoken immediately after the actor, e.g. "published", "changed". */
  action: string;
  entityType: ActivityEntityType;
  /** Real mock record id, used to build the entity link. */
  entityId: string;
  entityReference: string;
  /** Human-readable name used in the sentence, e.g. "HGV Class 1 Driver". */
  entityLabel: string;
  /** Optional trailing context, e.g. "from New to Reviewing", "to Shingi". */
  detail?: string;
  timestamp: string;
}

/**
 * An operational event that may require the user's attention — distinct
 * from `ActivityEvent` (the full historical log, which includes many
 * events nobody needs to be notified about) and from the future backend
 * audit record. Deliberately not one type per Activity event.
 */
export type NotificationType =
  | "new-application"
  | "new-staff-request"
  | "new-candidate"
  | "new-enquiry"
  | "assignment"
  | "status-change";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  /** Mock-phase only — every notification currently belongs to "Moremi Molai". */
  recipient: string;
  entityType: ActivityEntityType;
  /** Real mock record id, used to build the entity link. */
  entityId: string;
  entityReference: string;
}

export interface Job {
  id: string;
  reference: string;
  title: string;
  client: string;
  sector: string;
  location: string;
  owner: string | null;
  applicationsCount: number;
  status: JobStatus;
  closingDate: string | null;
  closingSoon: boolean;
  createdAt: string;
}

/**
 * An inbound contact/message received by Complex Recruitment. Deliberately
 * distinct from Staff Request / Candidate / Application / Job — an enquiry
 * may later be converted into one of those records, but is not itself one.
 */
export type EnquiryType = "Employer" | "Candidate" | "General" | "Partnership";

export type EnquiryStatus =
  | "New"
  | "In Review"
  | "Responded"
  | "Converted"
  | "Closed";

export interface Enquiry {
  id: string;
  reference: string;
  contactName: string;
  company: string | null;
  email: string;
  phone: string;
  type: EnquiryType;
  subject: string;
  message: string;
  source: string;
  owner: string | null;
  status: EnquiryStatus;
  receivedAt: string;
  unread: boolean;
}

export interface CandidateApplication {
  id: string;
  reference: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobReference: string;
  jobTitle: string;
  client: string;
  appliedAt: string;
  owner: string | null;
  status: ApplicationStatus;
  unread: boolean;
}

/**
 * The persistent candidate (person) record. A candidate is distinct from an
 * `CandidateApplication` — they may exist before applying, and may go on to
 * make several applications over time.
 */
export interface Candidate {
  id: string;
  reference: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  sector: string;
  owner: string | null;
  availability: CandidateAvailability;
  applicationCount: number;
  lastActivityAt: string;
  registeredAt: string;
  source: string;
}
