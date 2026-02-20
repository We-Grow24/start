// ═══════════════════════════════════════════════════════════════
// SVARNEX — Niche Seed (Section 3B)
// Seeds questionnaire_niche_map table from NICHE_MAP
// ═══════════════════════════════════════════════════════════════

import { NICHE_MAP } from "@/lib/niche-map";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Upserts all niches + sub-niches into `questionnaire_niche_map`.
 * Idempotent — safe to call on every deploy.
 */
export async function seedNicheMap(): Promise<{
  inserted: number;
  updated: number;
  errors: string[];
}> {
  const supabase = createServiceClient();
  let inserted = 0;
  const updated = 0;
  const errors: string[] = [];

  for (const niche of NICHE_MAP) {
    for (const subNiche of niche.subNiches) {
      const row = {
        niche: niche.id,
        sub_niche: subNiche,
        zone_type: "FORGE",
        block_types: niche.blockTypes,
        q1_default: niche.defaultQ1,
        vibe_default: niche.defaultVibe,
        priority_order: 0,
      };

      const { data, error } = await supabase
        .from("questionnaire_niche_map")
        .upsert(row, { onConflict: "niche,sub_niche,zone_type" })
        .select("id")
        .single();

      if (error) {
        errors.push(`${niche.id}/${subNiche}: ${error.message}`);
      } else if (data) {
        // Upsert doesn't distinguish insert vs update easily;
        // count everything as inserted for simplicity
        inserted++;
      }
    }
  }

  return { inserted, updated, errors };
}
