import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════

export const ZoneTypeEnum = z.enum([
  "FORGE",
  "FOUNDRY",
  "ENGINE",
  "BAZAAR",
  "LOGIC",
]);
export type ZoneType = z.infer<typeof ZoneTypeEnum>;

export const AuthorEnum = z.enum(["USER", "ORACLE", "AGENT"]);
export type Author = z.infer<typeof AuthorEnum>;

export const ConditionTypeEnum = z.enum(["COUNTRY", "LANGUAGE"]);
export type ConditionType = z.infer<typeof ConditionTypeEnum>;

export const ActionTypeEnum = z.enum([
  "SHOW_PRICE_IN",
  "REDIRECT",
  "SHOW_VARIANT",
]);
export type ActionType = z.infer<typeof ActionTypeEnum>;

export const SegmentTypeEnum = z.enum([
  "DEVICE",
  "RETURN_VISITOR",
  "REFERRAL_SOURCE",
  "UTM_SOURCE",
]);
export type SegmentType = z.infer<typeof SegmentTypeEnum>;

export const SubscriptionTierEnum = z.enum([
  "PRESENCE",
  "BUSINESS",
  "SCALE",
]);
export type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;

export const TriggerTypeEnum = z.enum([
  "ON_CLICK",
  "ON_SUBMIT",
  "ON_HOVER",
  "ON_LOAD",
  "ON_SCROLL",
  "ON_CHANGE",
  "ON_FOCUS",
  "ON_BLUR",
  "ON_KEYPRESS",
  "ON_TIMER",
  "ON_CONDITION",
]);
export type TriggerType = z.infer<typeof TriggerTypeEnum>;

export const ActionNodeTypeEnum = z.enum([
  "NAVIGATE",
  "SUBMIT_FORM",
  "SEND_WHATSAPP",
  "TRIGGER_PAYMENT",
  "SHOW_BLOCK",
  "HIDE_BLOCK",
  "ANIMATE",
  "CALL_API",
  "SET_VARIABLE",
  "SEND_EMAIL",
  "OPEN_MODAL",
  "CLOSE_MODAL",
  "SPAWN_GAME_OBJECT",
  "PLAY_AUDIO",
  "CUSTOM_FUNCTION",
]);
export type ActionNodeType = z.infer<typeof ActionNodeTypeEnum>;

// ═══════════════════════════════════════════════════════════════
// LOGIC NODE — connects DNA blocks via event-driven wiring
// ═══════════════════════════════════════════════════════════════

export const LogicNodeSchema = z.object({
  /** Unique logic node ID (uuid v4) */
  id: z.string().uuid(),

  /** DOM or game event that fires this node */
  trigger: TriggerTypeEnum,

  /** What to do when trigger fires */
  action: ActionNodeTypeEnum,

  /** The receiving block's ID (null if action is global) */
  target_block_id: z.string().uuid().nullable(),

  /** Optional payload: API URL, message body, animation name, etc. */
  action_payload: z.record(z.string(), z.unknown()).optional(),

  /** Optional condition guard: action fires only if this evaluates true */
  condition: z
    .object({
      variable: z.string(),
      operator: z.enum(["eq", "neq", "gt", "lt", "gte", "lte", "contains"]),
      value: z.unknown(),
    })
    .optional(),
});
export type LogicNode = z.infer<typeof LogicNodeSchema>;

// ═══════════════════════════════════════════════════════════════
// DNA BLOCK — atomic unit of every project
// ═══════════════════════════════════════════════════════════════

export const DNABlockPositionSchema = z.object({
  /** Horizontal grid position or pixel x-coordinate */
  x: z.number(),

  /** Vertical grid position or pixel y-coordinate */
  y: z.number(),

  /** Render order / z-index within the genome */
  order: z.number().int().nonnegative(),
});
export type DNABlockPosition = z.infer<typeof DNABlockPositionSchema>;

export const DNABlockSchema = z.object({
  /** Unique block ID (uuid v4) — matches infinite_library.block_id at creation */
  id: z.string().uuid(),

  /** Block category type, e.g. "hero", "pricing", "game_player", "form" */
  type: z.string().min(1),

  /**
   * All visual, content, and behavioural properties for this block.
   * Schema is block-type-specific; validated by DNA Interpreter at runtime.
   * Examples: { text: "Hello", fontWeight: 700, bgColor: "#0a0a0a" }
   */
  props: z.record(z.string(), z.unknown()),

  /** Spatial position within the zone canvas */
  position: DNABlockPositionSchema,

  /** Event-driven wiring: connects this block to other blocks */
  logic_nodes: z.array(LogicNodeSchema).default([]),

  /** Whether this block is visible by default */
  is_visible: z.boolean().default(true),

  /**
   * Optional species name from Infinite Library.
   * null for custom/Oracle-generated blocks.
   */
  species_name: z.string().nullable().optional(),

  /**
   * Performance hint added by Gamma agent.
   * Estimated render weight: 0.0 (trivial) — 1.0 (max GPU load).
   */
  render_weight: z.number().min(0).max(1).default(0.1),

  /** Accessibility: aria-label override for Shadow DOM layer */
  aria_label: z.string().optional(),
});
export type DNABlock = z.infer<typeof DNABlockSchema>;

// ═══════════════════════════════════════════════════════════════
// DNA GENOME — ordered array of all blocks in a project
// ═══════════════════════════════════════════════════════════════

export const DNAGenomeSchema = z.array(DNABlockSchema);
export type DNAGenome = z.infer<typeof DNAGenomeSchema>;

// ═══════════════════════════════════════════════════════════════
// DNA MUTATION — Chronos Timeline version node
// ═══════════════════════════════════════════════════════════════

export const DNAMutationSchema = z.object({
  /** Semantic version string, e.g. "v1.0", "v2.3" */
  version: z.string().regex(/^v\d+\.\d+$/),

  /** ISO 8601 UTC timestamp of this mutation */
  timestamp: z.string().datetime({ offset: true }),

  /** Array of block IDs that were added, modified, or removed */
  changed_blocks: z.array(z.string().uuid()),

  /** Who authored this mutation */
  author: AuthorEnum,

  /** Human-readable or Oracle-generated description of the change */
  description: z.string().max(500).optional(),

  /**
   * Snapshot of the genome at this version.
   * Used by Chronos Timeline rollback — stored inline per mutation.
   */
  genome_snapshot: DNAGenomeSchema.optional(),
});
export type DNAMutation = z.infer<typeof DNAMutationSchema>;

// ═══════════════════════════════════════════════════════════════
// DNA INTEGRATIONS — external services connected via OAuth
// ═══════════════════════════════════════════════════════════════

export const DNAIntegrationsSchema = z.object({
  razorpay: z.object({
    /** Whether Razorpay OAuth is currently active */
    connected: z.boolean().default(false),

    /** Razorpay merchant account_id (e.g., "acc_XXXXXXXXXXXXXX") */
    account_id: z.string().nullable().default(null),

    /** Integration mode: basic checkout or Route escrow */
    mode: z.enum(["CHECKOUT", "ROUTE_ESCROW"]).default("CHECKOUT"),
  }),

  whatsapp: z.object({
    /** Whether Wati/WhatsApp Business is connected */
    connected: z.boolean().default(false),

    /** Registered WhatsApp Business phone number with country code */
    phone_number: z.string().nullable().default(null),

    /** Pre-approved message template names keyed by trigger */
    templates: z.record(z.string(), z.string()).default({}),
  }),

  mailchimp: z.object({
    /** Whether Mailchimp is connected */
    connected: z.boolean().default(false),

    /** Target audience/list ID for form submission routing */
    audience_id: z.string().nullable().default(null),
  }),

  brevo: z.object({
    /** Whether Brevo (Sendinblue) is connected */
    connected: z.boolean().default(false),

    /** Brevo contact list ID */
    list_id: z.number().int().nullable().default(null),
  }),

  ga4: z.object({
    /** Whether Google Analytics 4 passthrough is active */
    connected: z.boolean().default(false),

    /** GA4 Measurement ID (e.g., "G-XXXXXXXXXX") */
    measurement_id: z.string().nullable().default(null),
  }),

  mixpanel: z.object({
    /** Whether Mixpanel passthrough is active */
    connected: z.boolean().default(false),

    /** Mixpanel Project Token */
    project_token: z.string().nullable().default(null),
  }),
});
export type DNAIntegrations = z.infer<typeof DNAIntegrationsSchema>;

// ═══════════════════════════════════════════════════════════════
// SEO CONFIG — generated by Oracle on every Materialisation
// ═══════════════════════════════════════════════════════════════

export const SEOConfigSchema = z.object({
  /** Page <title> tag — max 60 chars */
  meta_title: z.string().max(60).optional(),

  /** Meta description tag — max 160 chars */
  meta_description: z.string().max(160).optional(),

  /** Absolute URL of the OpenGraph image (1200×630 WebP) */
  og_image_url: z.string().url().nullable().optional(),

  /**
   * ISO 8601 datetime when sitemap.xml was submitted
   * to Google Search Console. null if not yet submitted.
   */
  sitemap_submitted_at: z
    .string()
    .datetime({ offset: true })
    .nullable()
    .optional(),

  /**
   * SEO health score 0–100.
   * Calculated by Oracle on each Materialisation.
   * Breakdown: H1 10, meta desc 10, alt-text 10, load target 20,
   *            canonical 5, sitemap 5, keyword density 20, mobile 20.
   */
  score: z.number().int().min(0).max(100).default(0),

  /** Array of actionable SEO issue descriptions from Oracle */
  issues: z.array(z.string()).default([]),

  /** Canonical URL — project domain or .svarnex.app subdomain */
  canonical_url: z.string().url().nullable().optional(),

  /** Whether robots.txt has been generated */
  robots_txt_generated: z.boolean().default(false),

  /** Array of hreflang tags if multi-language mode is enabled */
  hreflang_tags: z
    .array(
      z.object({
        locale: z.string(), // e.g., "en-IN", "hi-IN"
        url: z.string().url(),
      })
    )
    .default([]),
});
export type SEOConfig = z.infer<typeof SEOConfigSchema>;

// ═══════════════════════════════════════════════════════════════
// GEO RULE — geographic content adaptation
// ═══════════════════════════════════════════════════════════════

export const GEORuleSchema = z.object({
  /** Unique rule ID (uuid v4) — mirrors geo_rules.rule_id in DB */
  rule_id: z.string().uuid(),

  /** Type of condition to evaluate */
  condition_type: ConditionTypeEnum,

  /**
   * Value to match against.
   * COUNTRY: ISO 3166-1 alpha-2 code (e.g., "IN", "US", "AE")
   * LANGUAGE: BCP 47 language tag (e.g., "en", "hi", "ar")
   */
  condition_value: z.string().min(2).max(10),

  /** What to do when condition matches */
  action_type: ActionTypeEnum,

  /**
   * Value for the action:
   * SHOW_PRICE_IN: ISO 4217 currency code (e.g., "USD", "AED")
   * REDIRECT: absolute URL
   * SHOW_VARIANT: GSO variant_id
   */
  action_value: z.string().min(1),

  /** Lower number = higher priority when multiple rules match */
  priority: z.number().int().nonnegative().default(0),

  /** Whether this rule is currently active */
  is_active: z.boolean().default(true),
});
export type GEORule = z.infer<typeof GEORuleSchema>;

// ═══════════════════════════════════════════════════════════════
// GSO VARIANT — Genetic Segment Optimisation branch
// ═══════════════════════════════════════════════════════════════

export const GSOVariantSchema = z.object({
  /** Unique variant ID (uuid v4) — mirrors gso_variants.variant_id in DB */
  variant_id: z.string().uuid(),

  /** Audience segment this variant targets */
  segment_type: SegmentTypeEnum,

  /**
   * Value to match against the segment.
   * DEVICE: "mobile" | "tablet" | "desktop"
   * RETURN_VISITOR: "true" (sessioncount > 1)
   * REFERRAL_SOURCE: domain, e.g., "instagram.com"
   * UTM_SOURCE: UTM value, e.g., "google_ads"
   */
  condition_value: z.string().min(1),

  /**
   * Delta DNA: the subset of genome blocks that differ from the
   * baseline genome for this visitor segment.
   * Vercel Edge Function merges this branch over the base genome
   * before serving the response.
   */
  dna_branch: DNAGenomeSchema,

  /** Whether this variant is currently active for serving */
  is_active: z.boolean().default(true),

  /** Optional name for display in Pulse AB Test Manager */
  variant_label: z.string().max(100).optional(),
});
export type GSOVariant = z.infer<typeof GSOVariantSchema>;

// ═══════════════════════════════════════════════════════════════
// DNA META — project-level metadata
// ═══════════════════════════════════════════════════════════════

export const DNAMetaSchema = z.object({
  /** Supabase projects.id (uuid v4) */
  project_id: z.string().uuid(),

  /**
   * URL-safe slug — used for .svarnex.app subdomain
   * e.g., "my-coffee-shop" → my-coffee-shop.svarnex.app
   */
  slug: z
    .string()
    .min(3)
    .max(63)
    .regex(/^[a-z0-9-]+$/),

  /** Custom domain if connected, null otherwise */
  custom_domain: z.string().nullable().default(null),

  /** User's subscription tier at project creation */
  tier: SubscriptionTierEnum,

  /** Current semantic version — mirrors projects.version */
  version: z.string().regex(/^v\d+\.\d+$/),

  /** ISO 8601 UTC — when this DNA was first created */
  created_at: z.string().datetime({ offset: true }),

  /** ISO 8601 UTC — last mutation timestamp */
  updated_at: z.string().datetime({ offset: true }),

  /** Whether the project is currently deployed to production */
  is_deployed: z.boolean().default(false),

  /** Vercel deployment URL if deployed */
  deployed_url: z.string().url().nullable().optional(),

  /**
   * Total block count — used by Chip cost formula:
   * chip_cost = BASE_COST + (block_count × 0.5) + (custom_logic × 2)
   */
  block_count: z.number().int().nonnegative().default(0),

  /**
   * Number of Oracle-written custom functions in this DNA.
   * Used in Materialisation Chip cost formula.
   */
  custom_logic_functions: z.number().int().nonnegative().default(0),

  /**
   * For Engine Zone projects: whether multiplayer is enabled.
   * Triggers Supabase Edge Function game-server provisioning.
   */
  is_multiplayer: z.boolean().default(false),

  /** For Bazaar Zone: whether Razorpay Route escrow is active */
  has_escrow: z.boolean().default(false),
});
export type DNAMeta = z.infer<typeof DNAMetaSchema>;

// ═══════════════════════════════════════════════════════════════
// DNA STRING — ROOT SCHEMA
// The complete project representation (~10 KB JSON).
// This is the single source of truth for every Svarnex project.
// ═══════════════════════════════════════════════════════════════

export const DNAStringSchema = z.object({
  /**
   * Discriminator field: which Zone type this DNA belongs to.
   * All 5 Zones share this root schema — zone_type selects
   * which DNA Interpreter rendering path is used.
   */
  zone_type: ZoneTypeEnum,

  /**
   * The ordered array of all DNA blocks in this project.
   * This is the main "body" of the project.
   * Interpreter walks this array to produce the rendered output.
   */
  genome: DNAGenomeSchema,

  /**
   * Chronos Timeline: ordered history of all mutations.
   * Used for version rollback, split-screen compare, and branch creation.
   * Oldest mutation first.
   */
  mutations: z.array(DNAMutationSchema).default([]),

  /**
   * Connected external services.
   * Presence/absence drives Logic Map integration block availability.
   */
  integrations: DNAIntegrationsSchema,

  /**
   * Auto-generated SEO package.
   * Updated on every Materialisation Phase B (Ghost Injection).
   */
  seo_config: SEOConfigSchema,

  /**
   * Geographic targeting rules.
   * Evaluated by Vercel Edge Function before serving.
   * Available from Business tier.
   */
  geo_rules: z.array(GEORuleSchema).default([]),

  /**
   * Genetic Segment Optimisation variants.
   * DNA branches served per audience segment.
   * Available from Scale tier.
   */
  gso_variants: z.array(GSOVariantSchema).default([]),

  /**
   * Project-level metadata.
   * Read-only from client — mutated only by server-side handlers.
   */
  meta: DNAMetaSchema,
});

// ═══════════════════════════════════════════════════════════════
// EXPORTED TYPE
// ═══════════════════════════════════════════════════════════════

export type DNAString = z.infer<typeof DNAStringSchema>;

// ═══════════════════════════════════════════════════════════════
// HELPER SCHEMAS — used by API route handlers
// ═══════════════════════════════════════════════════════════════

/** Partial update to genome only — used by PATCH /api/projects/[id]/dna */
export const DNAPatchSchema = z.object({
  genome: DNAGenomeSchema.optional(),
  geo_rules: z.array(GEORuleSchema).optional(),
  gso_variants: z.array(GSOVariantSchema).optional(),
  seo_config: SEOConfigSchema.partial().optional(),
  integrations: DNAIntegrationsSchema.partial().optional(),
});
export type DNAPatch = z.infer<typeof DNAPatchSchema>;

/** Mutation record submitted by client — server fills in timestamp and version */
export const DNAMutationInputSchema = DNAMutationSchema.omit({
  timestamp: true,
  version: true,
}).extend({
  description: z.string().max(500).optional(),
});
export type DNAMutationInput = z.infer<typeof DNAMutationInputSchema>;

// ═══════════════════════════════════════════════════════════════
// QUESTIONNAIRE ANSWERS SCHEMA
// ═══════════════════════════════════════════════════════════════

// PRD §4.1.2 — Conversion Vault — the only accepted answers
export const QuestionnaireAnswersSchema = z.object({
  objective: z.enum(["lead-gen", "single-product", "portfolio", "inform-educate", ""]),
  vibeDNA: z.enum(["minimalist", "bold-dark", "warm-organic", ""]),
  contentVolume: z.enum(["single-page", "multi-page", ""]),
  socialProof: z.array(z.enum(["testimonials", "trust-badges", "live-social-feed"])),
  speedPriority: z.enum(["high-res", "lightning-fast", ""]),
  interactionLevel: z.enum(["parallax", "mouse-tracking", "static", ""]),
  customOverride: z.string(),
});
export type QuestionnaireAnswersInferred = z.infer<typeof QuestionnaireAnswersSchema>;
