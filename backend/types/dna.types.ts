// ═══════════════════════════════════════════════════════════════
// SVARNEX — DNA Interpreter Types
// Additional types for DNA node tree, mutations, diffs
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ─── DNA Block Types ───────────────────────────────────────────

export const DNABlockTypeEnum = z.enum([
  "text",
  "image",
  "button",
  "form",
  "card",
  "nav",
  "hero",
  "footer",
  "payment",
  "video",
  "map",
  "chart",
  "list",
  "grid",
  "modal",
  "carousel",
  "accordion",
  "tabs",
  "custom",
]);
export type DNABlockType = z.infer<typeof DNABlockTypeEnum>;

// ─── DNA Node ──────────────────────────────────────────────────

export const DNANodeMetadataSchema = z.object({
  createdAt: z.string(),
  mutatedAt: z.string(),
  confidence: z.number().min(0).max(1),
});

export const DNANodeSchema: z.ZodType<DNANode> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    type: DNABlockTypeEnum,
    props: z.record(z.string(), z.unknown()),
    children: z.array(DNANodeSchema),
    metadata: DNANodeMetadataSchema,
  })
);

export interface DNANode {
  id: string;
  type: DNABlockType;
  props: Record<string, unknown>;
  children: DNANode[];
  metadata: {
    createdAt: string;
    mutatedAt: string;
    confidence: number;
  };
}

// ─── DNA Mutation ──────────────────────────────────────────────

export const DNAMutationSchema = z.object({
  nodeId: z.string().uuid(),
  prompt: z.string(),
  previousProps: z.record(z.string(), z.unknown()),
  newProps: z.record(z.string(), z.unknown()),
  appliedAt: z.string(),
});

export interface DNAMutation {
  nodeId: string;
  prompt: string;
  previousProps: Record<string, unknown>;
  newProps: Record<string, unknown>;
  appliedAt: string;
}

// ─── DNA Diff ──────────────────────────────────────────────────

export type DNADiffType = "added" | "removed" | "updated";

export interface DNADiff {
  nodeId: string;
  type: DNADiffType;
}

// ─── Zone / Carousel types ─────────────────────────────────────

export type ZoneId =
  | "FORGE"
  | "FOUNDRY"
  | "ENGINE"
  | "BAZAAR"
  | "LOGIC";

export interface ZoneDefinition {
  id: ZoneId;
  label: string;
  icon: string;
  description: string;
  color: string;
  tierRequired: "PRESENCE" | "BUSINESS" | "SCALE";
}

// ─── Oracle chat message ───────────────────────────────────────

export interface OracleChatMessage {
  id: string;
  role: "USER" | "ORACLE";
  content: string;
  timestamp: string;
  chipCost?: number;
  mutation?: Record<string, unknown>;
}

// ─── Conversion DNA block (analytics) ──────────────────────────

export interface ConversionDNABlock {
  blockId: string;
  blockType: DNABlockType;
  label: string;
  conversionRate: number;
  trend: "up" | "down" | "stable";
}

// ─── Sankey data (analytics) ───────────────────────────────────

export interface SankeyNode {
  id: string;
  label: string;
  value: number;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

// ─── Razorpay error ────────────────────────────────────────────

export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
}

// ─── Questionnaire ─────────────────────────────────────────────
// PRD §4.1.2 — Conversion Vault — exactly 6 questions + custom override

export interface QuestionnaireAnswers {
  /** Q1 — Objective (single select 4) */
  objective: "lead-gen" | "single-product" | "portfolio" | "inform-educate" | "";
  /** Q2 — Vibe DNA (single select 3) */
  vibeDNA: "minimalist" | "bold-dark" | "warm-organic" | "";
  /** Q3 — Content Volume (single select 2) */
  contentVolume: "single-page" | "multi-page" | "";
  /** Q4 — Social Proof (multi-select) */
  socialProof: Array<"testimonials" | "trust-badges" | "live-social-feed">;
  /** Q5 — Speed Priority (single select 2) */
  speedPriority: "high-res" | "lightning-fast" | "";
  /** Q6 — Interaction Level (single select 3) */
  interactionLevel: "parallax" | "mouse-tracking" | "static" | "";
  /** Custom Override — free text injected into DNA */
  customOverride: string;
}
