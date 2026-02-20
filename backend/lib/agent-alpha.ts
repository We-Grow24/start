import "server-only";
// ═══════════════════════════════════════════════════════════════
// SVARNEX — Agent Alpha  (SVX-020)
// Asynchronous materialisation pipeline
// ═══════════════════════════════════════════════════════════════

import { redis, REDIS_KEYS, REDIS_TTL } from "@/lib/upstash";
import { createServiceClient } from "@/lib/supabase/service";
import { generateBlockCode } from "@/lib/openai";

// ─── Helpers ──────────────────────────────────────────────────

interface DNABlock {
  type: string;
  props: Record<string, unknown>;
  children?: DNABlock[];
  zone?: string;
}

/** Flatten a possibly-nested DNA tree into an ordered block list. */
function flattenDNA(tree: unknown): DNABlock[] {
  if (!tree) return [];
  if (Array.isArray(tree)) return tree.flatMap(flattenDNA);
  if (typeof tree === "string") {
    try {
      return flattenDNA(JSON.parse(tree));
    } catch {
      return [];
    }
  }
  if (typeof tree === "object" && tree !== null) {
    const node = tree as DNABlock;
    const self: DNABlock = {
      type: node.type ?? "custom",
      props: node.props ?? {},
      zone: node.zone ?? "default",
    };
    const children = Array.isArray(node.children)
      ? node.children.flatMap(flattenDNA)
      : [];
    return [self, ...children];
  }
  return [];
}

// ─── Redis status/progress writers ────────────────────────────

async function setStatus(jobId: string, status: string): Promise<void> {
  await redis.set(
    REDIS_KEYS.materialisationStatus(jobId),
    status,
    { ex: REDIS_TTL.MATERIALIZE_JOB }
  );
}

async function setProgress(jobId: string, progress: number): Promise<void> {
  await redis.set(
    REDIS_KEYS.materialisationProgress(jobId),
    String(progress),
    { ex: REDIS_TTL.MATERIALIZE_JOB }
  );
}

// ─── Main entry point ─────────────────────────────────────────

/**
 * Fire-and-forget entry point called from the POST handler.
 *
 * Lifecycle:
 *   PENDING → RUNNING → (iterate blocks, update progress 0→100)
 *     → success: PASSED  (commit ledger, write infinite_library_blocks)
 *     → error:   FAILED  (mark ledger + job as FAILED)
 */
export async function triggerAgentAlpha(
  jobId: string,
  projectId: string,
  dnaTree: unknown,
  userId: string,
  chipCost: number,
): Promise<void> {
  const supabase = createServiceClient();

  try {
    // ── 1. Mark RUNNING ───────────────────────────────────────
    await setStatus(jobId, "RUNNING");
    await setProgress(jobId, 0);

    await supabase
      .from("materialise_jobs")
      .update({ status: "RUNNING" })
      .eq("job_id", jobId);

    // ── 2. Flatten DNA blocks ─────────────────────────────────
    const blocks = flattenDNA(dnaTree);
    const total = blocks.length || 1; // avoid division-by-zero

    const generatedBlocks: Array<{
      block_type: string;
      zone: string;
      code: string;
    }> = [];

    // ── 3. Iterate & generate code per block ──────────────────
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i]!;
      const code = await generateBlockCode(
        block.type,
        block.props,
        block.zone ?? "default",
      );

      generatedBlocks.push({
        block_type: block.type,
        zone: block.zone ?? "default",
        code,
      });

      // Update progress incrementally (0 → 100)
      const pct = Math.round(((i + 1) / total) * 100);
      await setProgress(jobId, pct);
    }

    // If DNA had no blocks we still mark 100 %
    await setProgress(jobId, 100);

    // ── 4. Write infinite_library_blocks ──────────────────────
    const ZONE_MAP: Record<string, "FORGE" | "FOUNDRY" | "ENGINE" | "BAZAAR" | "LOGIC" | "UNIVERSAL"> = {
      forge: "FORGE",
      foundry: "FOUNDRY",
      engine: "ENGINE",
      bazaar: "BAZAAR",
      logic: "LOGIC",
      universal: "UNIVERSAL",
      default: "FORGE",
    };

    if (generatedBlocks.length > 0) {
      await supabase.from("infinite_library_blocks").insert(
        generatedBlocks.map((b) => ({
          block_type: b.block_type,
          zone_type: ZONE_MAP[b.zone.toLowerCase()] ?? "FORGE" as const,
          code_react: b.code,
        })),
      );
    }

    // ── 5. Commit casino_ledger row (RESERVED → COMMITTED) ───
    await supabase
      .from("casino_ledger")
      .update({ status: "COMMITTED" })
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .eq("transaction_type", "MATERIALISATION")
      .eq("status", "PENDING");

    // Debit chips now that the job succeeded (negative delta)
    await supabase.rpc("commit_chip_topup", {
      p_user_id: userId,
      p_chip_delta: -chipCost,
    });

    // ── 6. Mark job PASSED ────────────────────────────────────
    await supabase
      .from("materialise_jobs")
      .update({ status: "PASSED" })
      .eq("job_id", jobId);

    await setStatus(jobId, "PASSED");
  } catch (err) {
    // ── ERROR path ────────────────────────────────────────────
    console.error(`[Agent Alpha] Job ${jobId} failed:`, err);

    await setStatus(jobId, "FAILED");
    await setProgress(jobId, 0);

    await supabase
      .from("materialise_jobs")
      .update({ status: "FAILED" })
      .eq("job_id", jobId);

    // Release reserved ledger entry
    await supabase
      .from("casino_ledger")
      .update({ status: "FAILED" })
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .eq("transaction_type", "MATERIALISATION")
      .eq("status", "PENDING");
  }
}
