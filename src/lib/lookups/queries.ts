import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { OptionItem } from "@/lib/candidates/types";

/**
 * Small cross-domain lookups (active sectors, active team members) needed
 * by Jobs, Candidates and Applications alike. Extracted here once the third
 * domain needed them, as the note in candidates/queries.ts anticipated —
 * still plain "server-only" functions under the caller's own RLS session,
 * not a repository framework. jobs/queries.ts and candidates/queries.ts
 * re-export these so their existing import sites are unchanged.
 */

export async function getSectorOptions(): Promise<OptionItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sectors")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("getSectorOptions failed:", error);
    throw new Error("Could not load sectors.");
  }
  return data;
}

export async function getOwnerOptions(): Promise<OptionItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("status", "active")
    .order("display_name");

  if (error) {
    console.error("getOwnerOptions failed:", error);
    throw new Error("Could not load team members.");
  }
  return data.map((row) => ({ id: row.id, name: row.display_name }));
}
