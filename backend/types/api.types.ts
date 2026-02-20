// ═══════════════════════════════════════════════════════════════
// SVARNEX — API ENDPOINT TYPE CONTRACTS
// Section 18.4 — All 31 endpoints typed
// ═══════════════════════════════════════════════════════════════

import type { ZoneType, SubscriptionTier } from "./dna.schema";

// ─── Common ────────────────────────────────────────────────────

export type SubscriptionStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "PAST_DUE"
  | "CANCELLED"
  | "HALTED"
  | "TRIALING";

export type ProjectStatus =
  | "IN_PROGRESS"
  | "DEPLOYED"
  | "ARCHIVED"
  | "QUARANTINED"
  | "DELETED";

export type TransactionType =
  | "MATERIALISATION"
  | "DEPLOY"
  | "ORACLE_CALL"
  | "EXPORT"
  | "GAME_SERVER"
  | "VAULT_PURCHASE"
  | "TOPUP"
  | "GEO_RULE"
  | "GSO_VARIANT"
  | "SIMULATION_RERUN"
  | "SUBSCRIPTION"
  | "REFERRAL_REWARD"
  | "ROLLOVER_EXPIRE"
  | "ROLLOVER_GRANT";

export type LedgerPhase = "PHASE_1" | "PHASE_2" | "ROLLBACK";

export type LedgerStatus =
  | "PENDING"
  | "COMMITTED"
  | "ROLLEDBACK"
  | "FAILED";

export type HeatmapMode = "click" | "scroll" | "hover";

export type DeployTarget =
  | "VERCEL"
  | "APP_STORE"
  | "PLAY_STORE"
  | "EDGE_FUNCTION";

export type ExportFormat =
  | "STATIC_HTML"
  | "NEXTJS"
  | "FLUTTER"
  | "UNITY";

export type DomainAction = "ADD" | "CHECK" | "REMOVE";
export type DnsStatus = "PENDING" | "PROPAGATED" | "FAILED";
export type SslStatus = "PENDING" | "ACTIVE";

export type AgentType = "DREAMER" | "ALPHA" | "BETA" | "GAMMA";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "DONE" | "FAILED";

// ─── API Error ─────────────────────────────────────────────────

export interface ApiError {
  status: number;
  error: string;
}

// ═══════════════════════════════════════════════════════════════
// 1. GET /api/auth/session
// ═══════════════════════════════════════════════════════════════

export interface AuthSessionResponse {
  user_id: string;
  email: string;
  role: string;
  chip_balance: number;
  needs_reconsent: boolean;
  onboarding_completed: boolean | null;
  subscription_tier: string;
  nps_pending: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 2. GET /api/projects
// ═══════════════════════════════════════════════════════════════

export interface ProjectsListQuery {
  status?: ProjectStatus;
  zone_type?: ZoneType;
  limit?: number;
  offset?: number;
}

export interface ProjectSummary {
  id: string;
  zone_type: ZoneType;
  status: ProjectStatus;
  version: number;
  slug: string;
  domain: string | null;
  deployed_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectsListResponse {
  projects: ProjectSummary[];
  total: number;
  has_more: boolean;
}

// ═══════════════════════════════════════════════════════════════
// 3. POST /api/projects
// ═══════════════════════════════════════════════════════════════

export interface CreateProjectBody {
  zone_type: ZoneType;
  slug: string;
  dna_string?: Record<string, unknown>;
}

export interface CreateProjectResponse {
  id: string;
  zone_type: ZoneType;
  status: "IN_PROGRESS";
  slug: string;
  version: 1;
  created_at: string;
  dna_string: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// 4. GET /api/projects/[id]
// ═══════════════════════════════════════════════════════════════

export interface ProjectDetailResponse {
  id: string;
  user_id: string;
  zone_type: ZoneType;
  status: ProjectStatus;
  version: number;
  slug: string;
  domain: string | null;
  deployed_url: string | null;
  dna_string: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// 5. PATCH /api/projects/[id]
// ═══════════════════════════════════════════════════════════════

export interface UpdateProjectBody {
  status?: "IN_PROGRESS" | "ARCHIVED";
  slug?: string;
  domain?: string;
}

export interface UpdateProjectResponse {
  id: string;
  status: ProjectStatus;
  slug: string;
  domain: string | null;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════
// 6. DELETE /api/projects/[id]
// ═══════════════════════════════════════════════════════════════

export interface DeleteProjectResponse {
  message: "Project deleted successfully";
  id: string;
}

// ═══════════════════════════════════════════════════════════════
// 7. POST /api/projects/[id]/materialize
// ═══════════════════════════════════════════════════════════════

export interface MaterializeBody {
  force_rerun?: boolean;
}

export interface MaterializeResponse {
  job_id: string;
  project_id: string;
  phase: "A";
  status: "PENDING";
  estimated_duration_seconds: number;
  chip_cost_estimate: number;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// 8. POST /api/projects/[id]/deploy
// ═══════════════════════════════════════════════════════════════

export interface DeployBody {
  target?: DeployTarget;
}

export interface DeployResponse {
  deploy_id: string;
  project_id: string;
  target: DeployTarget;
  status: "PENDING";
  chip_ledger_id: string;
  deployed_url_preview: string;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// 9. POST /api/projects/[id]/export
// ═══════════════════════════════════════════════════════════════

export interface ExportBody {
  output_format: ExportFormat;
  confirm_loss_disclosure: boolean;
}

export interface ExportResponse {
  job_id: string;
  output_format: ExportFormat;
  chip_cost: number;
  estimated_minutes: number;
  status: "QUEUED";
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// 10. GET /api/projects/[id]/dna
// ═══════════════════════════════════════════════════════════════

export interface GetDnaResponse {
  project_id: string;
  dna_string: Record<string, unknown>;
  version: number;
  updated_at: string;
  cache_source: "SUPABASE" | "UPSTASH_REDIS";
}

// ═══════════════════════════════════════════════════════════════
// 11. PATCH /api/projects/[id]/dna
// ═══════════════════════════════════════════════════════════════

export interface PatchDnaBody {
  patch: Record<string, unknown>;
  mutation_input: {
    changed_blocks: string[];
    author: "USER" | "ORACLE";
    description?: string;
  };
}

export interface PatchDnaResponse {
  project_id: string;
  dna_string: Record<string, unknown>;
  new_version: string;
  updated_at: string;
  cache_written: true;
}

// ═══════════════════════════════════════════════════════════════
// 12. GET /api/projects/[id]/versions
// ═══════════════════════════════════════════════════════════════

export interface VersionsQuery {
  limit?: number;
  offset?: number;
}

export interface VersionEntry {
  version: string;
  timestamp: string;
  author: "USER" | "ORACLE" | "AGENT";
  description: string | null;
  changed_blocks: string[];
  has_snapshot: boolean;
}

export interface VersionsResponse {
  project_id: string;
  current_version: number;
  versions: VersionEntry[];
  total: number;
}

// ═══════════════════════════════════════════════════════════════
// 13. POST /api/projects/[id]/rollback
// ═══════════════════════════════════════════════════════════════

export interface RollbackBody {
  target_version: string;
  mode: "RESTORE" | "BRANCH";
}

export interface RollbackResponse {
  project_id: string;
  restored_version: string;
  new_version: string;
  dna_string: Record<string, unknown>;
  mode: "RESTORE" | "BRANCH";
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// 14. GET /api/chips/balance
// ═══════════════════════════════════════════════════════════════

export interface ChipBalanceResponse {
  user_id: string;
  chip_balance: number;
  subscription_tier: SubscriptionTier;
  monthly_allocation: number;
  pending_deductions: number;
  effective_balance: number;
}

// ═══════════════════════════════════════════════════════════════
// 15. POST /api/chips/topup
// ═══════════════════════════════════════════════════════════════

export type ChipPackage = 100 | 250 | 500 | 1000 | 2500;

export interface ChipTopupBody {
  chip_package: ChipPackage;
}

export interface ChipTopupResponse {
  order_id: string;
  amount_inr: number;
  chip_package: ChipPackage;
  razorpay_key_id: string;
  user_email: string;
  ledger_id: string;
  expires_at: string;
}

// ═══════════════════════════════════════════════════════════════
// 16. POST /api/chips/deduct (internal)
// ═══════════════════════════════════════════════════════════════

export interface ChipDeductBody {
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  project_id?: string;
  phase?: LedgerPhase;
  ledger_id?: string;
}

export interface ChipDeductResponse {
  ledger_id: string;
  status: LedgerStatus;
  new_balance: number | null;
  user_id: string;
  amount: number;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// 17. POST /api/oracle/chat
// ═══════════════════════════════════════════════════════════════

export interface OracleChatBody {
  project_id: string;
  message: string;
  context?: {
    selected_block_id?: string;
    zone_type?: string;
  };
  stream?: boolean;
}

export interface OracleChatStreamDelta {
  delta: string;
  mutation?: Record<string, unknown>;
  call_count: number;
  remaining_free_calls: number;
  chip_cost_this_call: number;
}

export interface OracleChatResponse {
  reply: string;
  mutation?: Record<string, unknown>;
  call_count: number;
  remaining_free_calls: number;
  chip_cost_this_call: number;
  session_id: string;
}

// ═══════════════════════════════════════════════════════════════
// 18–19. Razorpay Integration connect/callback
// ═══════════════════════════════════════════════════════════════

export interface RazorpayConnectQuery {
  project_id: string;
}

export interface RazorpayConnectResponse {
  redirect_url: string;
}

// ═══════════════════════════════════════════════════════════════
// 20–21. WhatsApp Integration connect/callback
// ═══════════════════════════════════════════════════════════════

export interface WhatsAppConnectQuery {
  project_id: string;
}

export interface WhatsAppConnectResponse {
  redirect_url: string;
}

// ═══════════════════════════════════════════════════════════════
// 22. POST /api/webhooks/razorpay
// ═══════════════════════════════════════════════════════════════

export interface RazorpayWebhookResponse {
  received: true;
}

// ═══════════════════════════════════════════════════════════════
// 23. POST /api/webhooks/vercel-deploy
// ═══════════════════════════════════════════════════════════════

export interface VercelDeployWebhookBody {
  type:
    | "deployment.created"
    | "deployment.succeeded"
    | "deployment.error"
    | "deployment.canceled";
  payload: {
    deploymentId: string;
    url: string;
    meta: {
      svarnex_project_id: string;
      svarnex_ledger_id: string;
    };
  };
}

// ═══════════════════════════════════════════════════════════════
// 24. POST /api/seo/generate
// ═══════════════════════════════════════════════════════════════

export interface SeoGenerateBody {
  project_id: string;
  trigger?: "MATERIALISATION" | "MANUAL";
}

export interface SeoIssue {
  category: string;
  message: string;
  suggestion: string;
}

export interface SeoGenerateResponse {
  snapshot_id: string;
  seo_score: number;
  meta_title: string;
  meta_description: string;
  sitemap_url: string;
  og_image_url: string;
  issues: SeoIssue[];
  chips_consumed: number;
}

// ═══════════════════════════════════════════════════════════════
// 25. POST /api/analytics/pixel
// ═══════════════════════════════════════════════════════════════

export type PixelEventType =
  | "PAGEVIEW"
  | "CLICK"
  | "SESSION_END"
  | "CONVERSION";

export interface PixelEventBody {
  event_type: PixelEventType;
  page_url: string;
  visitor_hash: string;
  x_coord?: number;
  y_coord?: number;
  element_selector?: string;
  session_duration?: number;
  referrer?: string;
}

// ═══════════════════════════════════════════════════════════════
// 26. POST /api/domains/verify
// ═══════════════════════════════════════════════════════════════

export interface DomainVerifyBody {
  project_id: string;
  custom_domain: string;
  action: DomainAction;
}

export interface DomainAddResponse {
  config_id: string;
  custom_domain: string;
  dns_status: "PENDING";
  a_record_ip: "76.76.21.21";
  ssl_status: "PENDING";
  instructions:
    | { type: "A"; host: "@"; value: "76.76.21.21" }
    | { type: "CNAME"; host: "www"; value: "cname.vercel-dns.com" };
  created_at: string;
}

export interface DomainCheckResponse {
  custom_domain: string;
  dns_status: DnsStatus;
  ssl_status: SslStatus;
  verified_at: string | null;
  check_performed_at: string;
}

export interface DomainRemoveResponse {
  message: "Custom domain removed successfully";
  custom_domain: string;
}

// ═══════════════════════════════════════════════════════════════
// 27. POST /api/devices/register
// ═══════════════════════════════════════════════════════════════

export interface DeviceRegisterBody {
  hw_hash: string;
  device_label?: string;
}

export interface DeviceRegisterResponse {
  message: string;
  otp_expires_at: string;
  masked_email: string;
}

// ═══════════════════════════════════════════════════════════════
// 28. POST /api/devices/verify-otp
// ═══════════════════════════════════════════════════════════════

export interface DeviceVerifyOtpBody {
  hw_hash: string;
  otp: string;
  device_label?: string;
}

export interface DeviceVerifyOtpResponse {
  trust_id: string;
  device_label: string;
  hw_hash: string;
  created_at: string;
  message: string;
}

// ═══════════════════════════════════════════════════════════════
// 29. GET /api/devices/list
// ═══════════════════════════════════════════════════════════════

export interface DeviceListItem {
  trust_id: string;
  device_label: string;
  hw_hash: string;
  created_at: string;
  last_seen_at: string;
  is_current_device: boolean;
}

export interface DeviceListResponse {
  devices: DeviceListItem[];
  total: number;
  slots_remaining: number;
}

// ═══════════════════════════════════════════════════════════════
// 30. DELETE /api/devices/remove
// ═══════════════════════════════════════════════════════════════

export interface DeviceRemoveBody {
  trust_id: string;
}

export interface DeviceRemoveResponse {
  message: string;
  trust_id: string;
  removed_at: string;
  slots_remaining: number;
}

// ═══════════════════════════════════════════════════════════════
// 31. GET /api/admin/factory
// ═══════════════════════════════════════════════════════════════

export interface FactoryQuery {
  agent?: AgentType;
  status?: TicketStatus;
  limit?: number;
  offset?: number;
  from_date?: string;
}

export interface FactoryTicket {
  ticket_id: string;
  agent: AgentType;
  status: TicketStatus;
  block_type: string | null;
  zone_type: string | null;
  retry_count: number;
  created_at: string;
  blueprint_json: Record<string, unknown>;
  code_output: string | null;
}

export interface MaterialisationQueueItem {
  job_id: string;
  project_id: string;
  user_id: string;
  phase: "A" | "B" | "C";
  status: string;
  retry_count: number;
  created_at: string;
}

export interface FactoryMetrics {
  materialisation_success_rate_24h: number;
  oracle_calls_24h: number;
  chips_deducted_24h: number;
  active_game_servers: number;
  pending_export_jobs: number;
  dreamer_last_run_at: string;
  library_block_count: number;
  quarantined_projects: number;
}

export interface FactoryResponse {
  tickets: FactoryTicket[];
  tickets_total: number;
  materialisation_queue: MaterialisationQueueItem[];
  queue_total: number;
  metrics: FactoryMetrics;
}
