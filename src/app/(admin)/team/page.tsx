import { TeamPageClient } from "@/components/admin/team/TeamPageClient";
import { getTeamMembers, getTeamWorkloadByMemberId } from "@/lib/team/queries";

export default async function TeamPage() {
  const teamMembers = await getTeamMembers();
  const workloadByMemberId = await getTeamWorkloadByMemberId(teamMembers);

  return (
    <TeamPageClient
      teamMembers={teamMembers}
      workloadByMemberId={workloadByMemberId}
    />
  );
}
