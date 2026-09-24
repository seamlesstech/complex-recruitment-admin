"use client";

import { useMemo, useState } from "react";
import { UserPlus } from "lucide-react";
import {
  SummaryFilters,
  type SummaryFilterItem,
} from "@/components/admin/SummaryFilters";
import { EmptyState } from "@/components/admin/EmptyState";
import { TeamToolbar } from "@/components/admin/team/TeamToolbar";
import { TeamTable } from "@/components/admin/team/TeamTable";
import { InviteTeamMemberModal } from "@/components/admin/team/InviteTeamMemberModal";
import { useCurrentUser } from "@/components/admin/CurrentUserProvider";
import type { TeamMember, TeamMemberStatus } from "@/lib/mock/types";
import type { TeamWorkload } from "@/lib/team/types";

type TeamStatusFilter = "All" | TeamMemberStatus;

const DEFAULT_STATUS_SELECT = "All statuses";
const DEFAULT_ROLE = "All roles";

interface TeamPageClientProps {
  /** Real roster, sourced from public.profiles — see lib/team/queries.ts. */
  teamMembers: TeamMember[];
  /** Real workload per roster entry — see lib/team/queries.ts. */
  workloadByMemberId: Record<string, TeamWorkload>;
}

export function TeamPageClient({
  teamMembers,
  workloadByMemberId,
}: TeamPageClientProps) {
  const currentUser = useCurrentUser();
  const [statusFilter, setStatusFilter] = useState<TeamStatusFilter>("All");
  const [roleFilter, setRoleFilter] = useState(DEFAULT_ROLE);
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const canManageTeam = currentUser.role === "super_admin";

  const summaryCounts = useMemo(
    () => ({
      all: teamMembers.length,
      active: teamMembers.filter((m) => m.status === "Active").length,
      invited: teamMembers.filter((m) => m.status === "Invited").length,
      disabled: teamMembers.filter((m) => m.status === "Disabled").length,
    }),
    [teamMembers],
  );

  const summaryItems: SummaryFilterItem<TeamStatusFilter>[] = [
    { value: "All", label: "All", count: summaryCounts.all },
    { value: "Active", label: "Active", count: summaryCounts.active },
    { value: "Invited", label: "Invited", count: summaryCounts.invited },
    { value: "Disabled", label: "Disabled", count: summaryCounts.disabled },
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
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">Team</h1>
          <p className="text-sm text-fg-muted">
            Review team access, roles and operational ownership.
          </p>
        </div>
        {canManageTeam ? (
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-md bg-complex-red px-4 text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
          >
            <UserPlus size={16} />
            Invite team member
          </button>
        ) : null}
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
          currentUserId={currentUser.id}
          workloadByMemberId={workloadByMemberId}
          canManageTeam={canManageTeam}
        />
      ) : (
        <EmptyState
          title="No team members found"
          message="Try adjusting your search or filters."
          onReset={handleReset}
        />
      )}

      {inviteOpen ? <InviteTeamMemberModal onClose={() => setInviteOpen(false)} /> : null}
    </div>
  );
}
