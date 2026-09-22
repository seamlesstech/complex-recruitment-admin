/**
 * Deterministic mock-identity helpers shared by every screen that shows a
 * candidate's contact details (the Candidates list, and the candidate
 * profile shown inside Application Detail) so the same candidate always
 * resolves to the same reference/email/phone across the app.
 */

export function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function candidateReferenceFromSeed(seed: number): string {
  return `CAN-${String(1000 + (seed % 9000))}`;
}

export function emailFromName(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, "")
    .trim()
    .split(/\s+/)
    .join(".");
  return `${slug}@example.com`;
}

export function phoneFromSeed(seed: number): string {
  const digits = String(100000000 + (seed % 900000000));
  return `07${digits.slice(0, 3)} ${digits.slice(3)}`;
}

/** Maps a raw stored owner value (e.g. "Moremi") to its display name. */
export function resolveOwnerDisplayName(owner: string | null): string {
  if (!owner) return "Unassigned";
  if (owner === "Moremi") return "Moremi Molai";
  return owner;
}
