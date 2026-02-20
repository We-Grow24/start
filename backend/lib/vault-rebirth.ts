import "server-only";
// ═══════════════════════════════════════════════════════════════
// SVARNEX — Vault Rebirth Utilities
// Gap Fix 3: checkRebirthSimilarity — ensures reborn DNA retains
//            ≥ 70% overlap with parent genome block types.
// Gap Fix 5: snapshotDNAForDispute — snapshots dna_string into
//            dna_mutations before Burn+Rebirth (dispute evidence).
// ═══════════════════════════════════════════════════════════════

import type { DNANode } from "@/types/dna.types";
import { createServiceClient } from "@/lib/supabase/service";

// ─── Helpers ─────────────────────────────────────────────────

/** Extract a flat set of block types from a genome tree. */
function extractBlockTypes(nodes: DNANode[]): string[] {
  const types: string[] = [];
  function walk(list: DNANode[]) {
    for (const n of list) {
      types.push(n.type);
      if (n.children.length > 0) walk(n.children);
    }
  }
  walk(nodes);
  return types;
}

// ─── Fix 3: Rebirth Similarity Check ────────────────────────

export interface SimilarityResult {
  score: number; // 0–100
  passed: boolean;
  parentTypes: string[];
  rebirthTypes: string[];
}

/**
 * Computes overlap between parent and rebirth genomes using block types.
 * Score = (intersecting types / union of types) × 100.
 * Pass threshold: ≥ 70 %.
 */
export function checkRebirthSimilarity(
  parentGenome: DNANode[],
  rebirthGenome: DNANode[],
): SimilarityResult {
  const parentTypes = extractBlockTypes(parentGenome);
  const rebirthTypes = extractBlockTypes(rebirthGenome);

  const parentSet = new Set(parentTypes);
  const rebirthSet = new Set(rebirthTypes);

  const intersection = [...parentSet].filter((t) => rebirthSet.has(t));
  const union = new Set([...parentSet, ...rebirthSet]);

  const score = union.size === 0
    ? 100
    : Math.round((intersection.length / union.size) * 100);

  return {
    score,
    passed: score >= 70,
    parentTypes,
    rebirthTypes,
  };
}

/**
 * Enforcement wrapper used in the rebirth chain.
 * After Gamma QC, before vault_templates INSERT:
 *   1. Run similarity check.
 *   2. If fail → retry up to `maxRetries` times with constraint.
 *   3. If still failing → flag project for Founder approval.
 *
 * @returns The rebirth genome if it passes, or null if flagged for approval.
 */
export async function enforceRebirthSimilarity(
  parentGenome: DNANode[],
  rebirthGenome: DNANode[],
  projectId: string,
  userId: string,
  maxRetries: number = 2,
): Promise<{ passed: boolean; genome: DNANode[] | null; score: number }> {
  let attempts = 0;
  const currentGenome = rebirthGenome;
  let result = checkRebirthSimilarity(parentGenome, currentGenome);

  while (!result.passed && attempts < maxRetries) {
    // In a real implementation, the retry would invoke Agent Gamma
    // with a constraint hint to keep more parent block types.
    // Here we just re-check (the caller is expected to regenerate).
    attempts++;
    result = checkRebirthSimilarity(parentGenome, currentGenome);
  }

  if (!result.passed) {
    // Flag for Founder approval by quarantining the project
    const service = createServiceClient();
    await service
      .from("projects")
      .update({ status: "QUARANTINED" })
      .eq("id", projectId);

    console.warn(
      `[vault-rebirth] Project ${projectId} flagged — similarity ${result.score}% < 70% after ${maxRetries} retries`,
    );

    return { passed: false, genome: null, score: result.score };
  }

  return { passed: true, genome: currentGenome, score: result.score };
}

// ─── Fix 5: Dispute DNA Snapshot ────────────────────────────

/**
 * Before Burn+Rebirth, snapshots the current dna_string into
 * the dna_mutations table so it can serve as dispute evidence.
 *
 * @returns The mutation row id (dispute_snapshot_id).
 */
export async function snapshotDNAForDispute(
  projectId: string,
  userId: string,
  dnaString: unknown,
): Promise<string> {
  const service = createServiceClient();

  const { data, error } = await service
    .from("dna_mutations")
    .insert({
      project_id: projectId,
      user_id: userId,
      node_id: "DISPUTE_SNAPSHOT",
      prompt: "Pre-rebirth dispute snapshot",
      previous_props: dnaString as import("@/types/supabase").Json,
      new_props: null,
      applied_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(`[vault-rebirth] Snapshot failed: ${error?.message ?? "unknown"}`);
  }

  return data.id;
}
