// ═══════════════════════════════════════════════════════════════
// SVARNEX — GAME HOST UTILITIES
// Replaces lib/hetzner.ts — routes to Supabase Edge Function
// WebSocket game server instead of Hetzner CX21 VPS instances.
// ═══════════════════════════════════════════════════════════════

import "server-only";

/**
 * Returns the WebSocket URL for the game-server edge function.
 * The Supabase project ref is extracted from NEXT_PUBLIC_SUPABASE_URL.
 *
 * Production format:
 *   wss://<project-ref>.supabase.co/functions/v1/game-server
 *
 * Local format:
 *   ws://127.0.0.1:54321/functions/v1/game-server
 */
export function getGameServerUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }

  const url = new URL(supabaseUrl);
  const protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${url.host}/functions/v1/game-server`;
}

/**
 * Returns the HTTP health-check URL for the game-server edge function.
 */
export function getGameServerHealthUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  }

  return `${supabaseUrl}/functions/v1/game-server/health`;
}

/**
 * Provisions a game server for the given project.
 * With Edge Functions, "provisioning" is instant — the room is created
 * on first WebSocket connection. This function simply returns the URL.
 */
export function provisionGameServer(projectId: string): {
  url: string;
  provider: "EDGE_FUNCTION";
} {
  const baseUrl = getGameServerUrl();
  return {
    url: `${baseUrl}?projectId=${encodeURIComponent(projectId)}`,
    provider: "EDGE_FUNCTION",
  };
}

/**
 * Destroys a game server. With Edge Functions, rooms are cleaned up
 * automatically after idle timeout. This is a no-op shim for API
 * compatibility; it returns immediately.
 */
export async function destroyGameServer(_projectId: string): Promise<void> {
  // Edge Function rooms self-destruct after 15 min idle.
  // No external API call needed — the room evicts when all players leave.
  return;
}
