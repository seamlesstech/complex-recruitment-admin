export type ApplicationStatus =
  | "New"
  | "Reviewing"
  | "Shortlisted"
  | "Interview"
  | "Offered"
  | "Placed"
  | "Rejected"
  | "Withdrawn";

export type StaffRequestStatus = "New" | "In progress";

export type JobStatus = "Open" | "Draft" | "Closed";

export interface CurrentUser {
  name: string;
  role: string;
  initials: string;
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
  employer: string;
  request: string;
  timeframe: string;
  status: StaffRequestStatus;
  owner: string | null;
}

export interface ActivityEvent {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
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
