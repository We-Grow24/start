// ═══════════════════════════════════════════════════════════════
// SVARNEX — DNA Parser  (SVX-014)
// Zod-validated recursive DNANode parser
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ─── Recursive DNANode Zod Schema ─────────────────────────────

export interface DNANode {
  type: string;
  props: Record<string, unknown>;
  children: DNANode[];
}

export const DNANodeSchema: z.ZodType<DNANode> = z.lazy(() =>
  z.object({
    type: z.string(),
    props: z.record(z.string(), z.unknown()),
    children: z.array(DNANodeSchema),
  })
);

// ─── Parse & validate a DNANode tree ──────────────────────────

/**
 * Validates `json` against DNANodeSchema.
 * Returns a typed DNANode on success; throws ZodError on invalid input.
 */
export function parseDNATree(json: unknown): DNANode {
  return DNANodeSchema.parse(json);
}
