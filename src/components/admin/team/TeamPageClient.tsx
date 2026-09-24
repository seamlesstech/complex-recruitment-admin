"use client";

import { useState } from "react";
import {
  SummaryFilters,
  type SummaryFilterItem,
} from "@/components/admin/SummaryFilters";
import { EmptyState } from "@/components/admin/EmptyState";
import { TeamToolbar } from "@/components/admin/team/TeamToolbar";
import { TeamTable } from "@/components/admin/team/TeamTable";
import { useCurrentUser } from "@/components/admin/CurrentUserProvider";
import { teamSummaryDisplayCounts } from "@/lib/mock/team";
import type { TeamMember, TeamMemberStatus } from "@/lib/mock/types";
import type { TeamWorkload } from "@/lib/team/types";

type TeamStatusFilter = "All" | TeamMemberStatus;

const DEFAULT_STATUS_SELECT = "All statuses";
const DEFAULT_ROLE = "All roles";

interface TeamPageClientProps {
  /** Preview-only roster (Team management isn't migrated yet). */
  teamMembers: TeamMember[];
  /** Real workload per roster entry — see lib/team/queries.ts. */
  workloadByMemberId: Record<string, TeamWorkload>;
}

export function TeamPageClient({
  teamMembers,
  workloadByMemberId,
}: TeamPageClientProps) {
  const { email: currentUserEmail } = useCurrentUser();
  const [statusFilter, setStatusFilter] = useState<TeamStatusFilter>("All");
  const [roleFilter, setRoleFilter] = useState(DEFAULT_ROLE);
  const [search, setSearch] = useState("");

  const summaryItems: SummaryFilterItem<TeamStatusFilter>[] = [
    { value: "All", label: "All", count: teamSummaryDisplayCounts.all },
    {
      value: "Active",
      label: "Active",
      count: teamSummaryDisplayCounts.active,
    },
    {
      value: "Invited",
      label: "Invited",
      count: teamSummaryDisplayCounts.invited,
    },
    {
      value: "Disabled",
      label: "Disabled",
      count: teamSummaryDisplayCounts.disabled,
    },
  ];

  const filteredMembers = teamMembers.filter((member) => {
    if (statusFilter !== "All" && member.status !== statusFilter) {
      return false;
    }

    if (roleFilter !== DEFAULT_ROLE && member.role !== roleFilter) {
      return false;
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase();
      const haystack = `${member.name} ${member.email} ${member.role}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  const statusSelectValue =
    statusFilter === "All" ? DEFAULT_STATUS_SELECT : statusFilter;

  function handleStatusSelectChange(value: string) {
    setStatusFilter(
      value === DEFAULT_STATUS_SELECT ? "All" : (value as TeamStatusFilter),
    );
  }

  const hasActiveFilters =
    search.trim() !== "" || statusFilter !== "All" || roleFilter !== DEFAULT_ROLE;

  function handleReset() {
    setStatusFilter("All");
    setRoleFilter(DEFAULT_ROLE);
    setSearch("");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Team</h1>
        <p className="text-sm text-fg-muted">
          Review team access, roles and operational ownership.
        </p>
      </div>

      <SummaryFilters
        items={summaryItems}
        active={statusFilter}
        onChange={setStatusFilter}
      />

      <TeamToolbar
        search={search}
        onSearchChange={setSearch}
        roleValue={roleFilter}
        onRoleChange={setRoleFilter}
        statusValue={statusSelectValue}
        onStatusChange={handleStatusSelectChange}
        resultCount={filteredMembers.length}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
      />

      {filteredMembers.length > 0 ? (
        <TeamTable
          members={filteredMembers}
          currentUserEmail={currentUserEmail}
          workloadByMemberId={workloadByMemberId}
        />
      ) : (
        <EmptyState
          title="No team members found"
          message="Try adjusting your search or filters."
          onReset={handleReset}
        />
      )}
    </div>
  );
}
