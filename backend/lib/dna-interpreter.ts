// ═══════════════════════════════════════════════════════════════
// SVARNEX — DNA Interpreter
// Pure functions: parseDNATree, applyMutation (immutable), diffDNATrees
// ═══════════════════════════════════════════════════════════════

import type { DNANode, DNAMutation, DNADiff, DNADiffType, DNABlockType } from "@/types/dna.types";
import { DNANodeSchema } from "@/types/dna.types";
import { z } from "zod";

// ─── Parse raw JSON into validated DNANode[] ─────────────────

const DNATreeSchema = z.array(DNANodeSchema);

/**
 * Validates `raw` against the Zod DNANode[] schema.
 * Throws ZodError on invalid input instead of silently coercing.
 */
export function parseDNATree(raw: unknown): DNANode[] {
  return DNATreeSchema.parse(raw);
}

// ─── Apply Mutation (immutable) ──────────────────────────────

export function applyMutation(tree: DNANode[], mutation: DNAMutation): DNANode[] {
  return tree.map((node) => applyMutationToNode(node, mutation));
}

function applyMutationToNode(node: DNANode, mutation: DNAMutation): DNANode {
  if (node.id === mutation.nodeId) {
    return {
      ...node,
      props: { ...node.props, ...mutation.newProps },
      children: node.children.map((c) => applyMutationToNode(c, mutation)),
      metadata: {
        ...node.metadata,
        mutatedAt: mutation.appliedAt,
      },
    };
  }

  if (node.children.length > 0) {
    return {
      ...node,
      children: node.children.map((c) => applyMutationToNode(c, mutation)),
    };
  }

  return node;
}

// ─── Apply multiple mutations sequentially ───────────────────

export function applyMutations(tree: DNANode[], mutations: DNAMutation[]): DNANode[] {
  return mutations.reduce((acc, mutation) => applyMutation(acc, mutation), tree);
}

// ─── Diff two DNA trees ──────────────────────────────────────

export function diffDNATrees(oldTree: DNANode[], newTree: DNANode[]): DNADiff[] {
  const diffs: DNADiff[] = [];
  const oldMap = flattenToMap(oldTree);
  const newMap = flattenToMap(newTree);

  // Check for added and updated nodes
  for (const [id, newNode] of newMap.entries()) {
    const oldNode = oldMap.get(id);
    if (!oldNode) {
      diffs.push({ nodeId: id, type: "added" });
    } else if (!nodesEqual(oldNode, newNode)) {
      diffs.push({ nodeId: id, type: "updated" });
    }
  }

  // Check for removed nodes
  for (const id of oldMap.keys()) {
    if (!newMap.has(id)) {
      diffs.push({ nodeId: id, type: "removed" });
    }
  }

  return diffs;
}

// ─── Helpers ─────────────────────────────────────────────────

function flattenToMap(tree: DNANode[]): Map<string, DNANode> {
  const map = new Map<string, DNANode>();

  function walk(nodes: DNANode[]) {
    for (const node of nodes) {
      map.set(node.id, node);
      if (node.children.length > 0) {
        walk(node.children);
      }
    }
  }

  walk(tree);
  return map;
}

function nodesEqual(a: DNANode, b: DNANode): boolean {
  if (a.type !== b.type) return false;
  if (a.metadata.mutatedAt !== b.metadata.mutatedAt) return false;
  // Shallow props comparison
  const aKeys = Object.keys(a.props);
  const bKeys = Object.keys(b.props);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a.props[key] !== b.props[key]) return false;
  }
  // Children count check
  if (a.children.length !== b.children.length) return false;
  return true;
}

// ─── Find a node by ID in the tree ───────────────────────────

export function findNodeById(tree: DNANode[], nodeId: string): DNANode | null {
  for (const node of tree) {
    if (node.id === nodeId) return node;
    if (node.children.length > 0) {
      const found = findNodeById(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

// ─── Remove a node by ID ────────────────────────────────────

export function removeNode(tree: DNANode[], nodeId: string): DNANode[] {
  return tree
    .filter((node) => node.id !== nodeId)
    .map((node) => ({
      ...node,
      children: removeNode(node.children, nodeId),
    }));
}

// ─── Insert a new node ──────────────────────────────────────

export function insertNode(
  tree: DNANode[],
  parentId: string | null,
  newNode: DNANode,
  position: "before" | "after" | "inside" = "inside",
  targetId?: string
): DNANode[] {
  // Insert at root level
  if (parentId === null) {
    if (!targetId) return [...tree, newNode];
    const idx = tree.findIndex((n) => n.id === targetId);
    if (idx === -1) return [...tree, newNode];
    const copy = [...tree];
    copy.splice(position === "before" ? idx : idx + 1, 0, newNode);
    return copy;
  }

  return tree.map((node) => {
    if (node.id === parentId && position === "inside") {
      return { ...node, children: [...node.children, newNode] };
    }
    return {
      ...node,
      children: insertNode(node.children, parentId, newNode, position, targetId),
    };
  });
}

// ─── Create a blank DNA node ─────────────────────────────────

export function createBlankNode(type: DNABlockType = "custom"): DNANode {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    type,
    props: {},
    children: [],
    metadata: {
      createdAt: now,
      mutatedAt: now,
      confidence: 0,
    },
  };
}

// ─── SDF → GLTF Asset Swap for Export (Gap Fix 2) ───────────
// Walk all blocks; replace SDF-specific props with GLTF fallback.
// Must be called at the START of any export pipeline.

const SDF_BLOCK_TYPES = new Set(["sdf_constants", "holographic", "sdf"]);
const SDF_PROP_KEYS = new Set([
  "sdf_constants",
  "wgsl_shader",
  "webgpu_pipeline",
]);

function swapNodeSDF(node: DNANode): DNANode {
  const isSdfBlock = SDF_BLOCK_TYPES.has(node.type);
  let props = { ...node.props };

  if (isSdfBlock) {
    // Swap to GLTF fallback
    const fallbackUrl =
      typeof props["gltf_fallback_url"] === "string"
        ? props["gltf_fallback_url"]
        : "";

    // Remove SDF-specific keys
    for (const key of SDF_PROP_KEYS) {
      delete props[key];
    }

    props = {
      ...props,
      renderer: "webgl",
      render_mode: "gltf",
      gltf_url: fallbackUrl,
    };
  }

  return {
    ...node,
    props,
    children: node.children.map(swapNodeSDF),
  };
}

/**
 * Replaces all SDF / holographic / WebGPU blocks with their GLTF fallback.
 * Sets renderer="webgl", render_mode="gltf", removes sdf_constants/wgsl_shader/webgpu_pipeline.
 * Call at the START of the export pipeline.
 */
export function swapSDFAssetsForExport(genome: DNANode[]): DNANode[] {
  return genome.map(swapNodeSDF);
}

// ─── Built-with-Svarnex Badge Injection (Section 3D) ────────
// PRESENCE tier users get an unremovable "Built with Svarnex" badge
// appended as the LAST child of the root array.

const BADGE_NODE_ID = "__svarnex_badge__";

function createBadgeNode(): DNANode {
  const now = new Date().toISOString();
  return {
    id: BADGE_NODE_ID,
    type: "built-with-badge" as DNABlockType,
    props: {
      text: "Built with Svarnex",
      href: "https://svarnex.com",
      position: "bottom-right",
      removable: false,
    },
    children: [],
    metadata: {
      createdAt: now,
      mutatedAt: now,
      confidence: 1,
    },
  };
}

/**
 * Injects or preserves a "Built with Svarnex" badge for PRESENCE tier.
 * Returns tree unchanged for BUSINESS / SCALE tiers.
 */
export function injectBuiltWithBadge(
  tree: DNANode[],
  tier: "PRESENCE" | "BUSINESS" | "SCALE"
): DNANode[] {
  // Only PRESENCE tier gets the badge
  if (tier !== "PRESENCE") {
    // Strip badge if it somehow exists on a paid tier
    return tree.filter((node) => node.id !== BADGE_NODE_ID);
  }

  // Check if badge already exists
  const existing = tree.find((node) => node.id === BADGE_NODE_ID);
  if (existing) return tree;

  return [...tree, createBadgeNode()];
}

// ─── RTL text direction support (Section 5B placeholder) ─────

/**
 * Walks the tree and injects `dir="rtl"` prop on every node
 * when the project's `interface_language` is an RTL language.
 */
export function applyRTLDirection(
  tree: DNANode[],
  dir: "ltr" | "rtl"
): DNANode[] {
  if (dir === "ltr") return tree;
  return tree.map((node) => injectDir(node, dir));
}

function injectDir(node: DNANode, dir: "rtl" | "ltr"): DNANode {
  return {
    ...node,
    props: { ...node.props, dir },
    children: node.children.map((c) => injectDir(c, dir)),
  };
}
