import { getCandidates, getOwnerOptions, getSectorOptions } from "@/lib/candidates/queries";
import { CandidatesPageClient } from "@/components/admin/candidates/CandidatesPageClient";

export default async function CandidatesPage() {
  const [candidates, sectorOptions, ownerOptions] = await Promise.all([
    getCandidates(),
    getSectorOptions(),
    getOwnerOptions(),
  ]);

  return (
    <CandidatesPageClient
      candidates={candidates}
      sectorOptions={sectorOptions}
      ownerOptions={ownerOptions}
    />
  );
}
