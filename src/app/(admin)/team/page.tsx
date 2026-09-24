import { TeamPageClient } from "@/components/admin/team/TeamPageClient";
import { teamMembers } from "@/lib/mock/team";
import { getTeamWorkloadByMemberId } from "@/lib/team/queries";

export default async function TeamPage() {
  const workloadByMemberId = await getTeamWorkloadByMemberId(teamMembers);

  return (
    <TeamPageClient
      teamMembers={teamMembers}
      workloadByMemberId={workloadByMemberId}
    />
  );
}
