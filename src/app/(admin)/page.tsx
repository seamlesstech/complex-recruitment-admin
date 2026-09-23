import Link from "next/link";
import { Plus } from "lucide-react";
import { MetricCard } from "@/components/admin/MetricCard";
import { AttentionList } from "@/components/admin/dashboard/AttentionList";
import { RecentApplicationsPanel } from "@/components/admin/dashboard/RecentApplicationsPanel";
import { StaffRequestsPanel } from "@/components/admin/dashboard/StaffRequestsPanel";
import { RecentActivityPanel } from "@/components/admin/dashboard/RecentActivityPanel";
import { getCandidateCount } from "@/lib/candidates/queries";
import {
  getNewApplicationCount,
  getRecentApplications,
} from "@/lib/applications/queries";
import { dashboardMetrics } from "@/lib/mock/metrics";

export default async function DashboardPage() {
  // Candidates and Applications metrics are real; Open jobs / Staff
  // Requests stay mock until their own Dashboard consolidation pass.
  const [registeredCandidates, newApplications, recentApplications] =
    await Promise.all([
      getCandidateCount(),
      getNewApplicationCount(),
      getRecentApplications(),
    ]);
  const metrics = dashboardMetrics.map((metric) => {
    if (metric.id === "registered-candidates") {
      return { ...metric, value: registeredCandidates };
    }
    if (metric.id === "new-applications") {
      return {
        ...metric,
        value: newApplications,
        context: "Awaiting review",
        needsAttention: newApplications > 0,
      };
    }
    return metric;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">
            Good morning, Moremi.
          </h1>
          <p className="text-sm text-fg-muted">
            Here&rsquo;s what needs your attention across Complex Recruitment
            today.
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="flex h-10 shrink-0 items-center gap-1.5 rounded-md bg-complex-red px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
        >
          <Plus size={16} strokeWidth={2.25} />
          Create job
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            label={metric.label}
            value={metric.value}
            context={metric.context}
            href={metric.href}
            needsAttention={metric.needsAttention}
          />
        ))}
      </div>

      <AttentionList />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentApplicationsPanel applications={recentApplications} />
        </div>
        <div className="flex flex-col gap-6">
          <StaffRequestsPanel />
          <RecentActivityPanel />
        </div>
      </div>
    </div>
  );
}
