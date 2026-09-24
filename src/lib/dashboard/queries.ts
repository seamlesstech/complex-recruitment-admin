import "server-only";
import { getNewApplicationCount, getRecentApplications } from "@/lib/applications/queries";
import {
  getCandidateCount,
  getCandidatesRegisteredThisMonthCount,
} from "@/lib/candidates/queries";
import { getNewEnquiryCount } from "@/lib/enquiries/queries";
import { getOpenJobsSummary } from "@/lib/jobs/queries";
import {
  getRecentStaffRequests,
  getStaffRequestDashboardCounts,
} from "@/lib/staff-requests/queries";
import type { RecentApplication } from "@/lib/applications/types";
import type { AttentionItem, Metric, StaffRequest } from "@/lib/mock/types";

/**
 * Composes the Dashboard purely from the live domain queries (each still
 * RLS-scoped to the viewer). No business logic lives here beyond turning
 * real counts into the existing Metric / AttentionItem display shapes —
 * nothing is invented to fill the panels. Enquiries feed only the
 * "Needs your attention" panel (the approved metrics row has no Enquiries
 * card).
 */

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count === 1 ? singular : pluralForm;
}

export interface DashboardData {
  metrics: Metric[];
  attentionItems: AttentionItem[];
  recentApplications: RecentApplication[];
  recentStaffRequests: StaffRequest[];
}

export async function getDashboardData(): Promise<DashboardData> {
  const [
    jobs,
    newApplications,
    staffRequestCounts,
    registeredCandidates,
    registeredThisMonth,
    recentApplications,
    recentStaffRequests,
    newEnquiries,
  ] = await Promise.all([
    getOpenJobsSummary(),
    getNewApplicationCount(),
    getStaffRequestDashboardCounts(),
    getCandidateCount(),
    getCandidatesRegisteredThisMonthCount(),
    getRecentApplications(),
    getRecentStaffRequests(),
    getNewEnquiryCount(),
  ]);

  const closingSoonCount = jobs.closingSoon.length;

  const metrics: Metric[] = [
    {
      id: "open-jobs",
      label: "Open jobs",
      value: jobs.openCount,
      context:
        closingSoonCount > 0
          ? `${closingSoonCount} closing within 7 days`
          : "None closing within 7 days",
      href: "/jobs",
    },
    {
      id: "new-applications",
      label: "New applications",
      value: newApplications,
      context: "Awaiting review",
      href: "/applications",
      needsAttention: newApplications > 0,
    },
    {
      id: "new-staff-requests",
      label: "New staff requests",
      value: staffRequestCounts.newCount,
      context: `${staffRequestCounts.newUnassignedCount} unassigned`,
      href: "/staff-requests",
      needsAttention: staffRequestCounts.newCount > 0,
    },
    {
      id: "registered-candidates",
      label: "Registered candidates",
      value: registeredCandidates,
      context: `${registeredThisMonth} registered this month`,
      href: "/candidates",
    },
  ];

  // Each item appears only when its real underlying condition holds.
  const attentionItems: AttentionItem[] = [];

  if (newApplications > 0) {
    attentionItems.push({
      id: "new-applications",
      title: `${newApplications} new ${plural(newApplications, "application")} awaiting review`,
      context: "Still at status New",
      href: "/applications",
      urgent: true,
    });
  }

  const unassigned = staffRequestCounts.activeUnassignedCount;
  if (unassigned > 0) {
    attentionItems.push({
      id: "unassigned-staff-requests",
      title: `${unassigned} ${plural(unassigned, "staff request")} not yet assigned`,
      context: "Waiting on an owner",
      href: "/staff-requests",
      urgent: true,
    });
  }

  if (newEnquiries > 0) {
    attentionItems.push({
      id: "new-enquiries",
      title: `${newEnquiries} new ${plural(newEnquiries, "enquiry", "enquiries")} to triage`,
      context: "Still at status New",
      href: "/enquiries",
    });
  }

  if (closingSoonCount > 0) {
    const [first] = jobs.closingSoon;
    const more = closingSoonCount > 1 ? ` and ${closingSoonCount - 1} more` : "";
    attentionItems.push({
      id: "jobs-closing-soon",
      title: `${closingSoonCount} ${plural(closingSoonCount, "vacancy", "vacancies")} closing within 7 days`,
      context: `${first.title} — ${first.employer}${more}`,
      href: "/jobs",
    });
  }

  return { metrics, attentionItems, recentApplications, recentStaffRequests };
}
