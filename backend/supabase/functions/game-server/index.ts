// @ts-nocheck — Deno Edge Function: uses Deno runtime, not Node.js.
// VS Code TypeScript Server does not understand Deno URLs or Deno globals.
// This file is excluded from the root tsconfig.json and compiled only by Supabase CLI.

// ═══════════════════════════════════════════════════════════════
// SVARNEX — SUPABASE EDGE FUNCTION: game-server
// Replaces Hetzner CX21 VPS with Deno-based WebSocket game host.
// Handles room management, state sync, and per-session chip billing.
// ═══════════════════════════════════════════════════════════════

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

// ─── Types ─────────────────────────────────────────────────────

interface GameRoom {
  projectId: string;
  players: Map<string, WebSocket>;
  state: Record<string, unknown>;
  createdAt: number;
  lastActivity: number;
}

interface WsMessage {
  type: "join" | "leave" | "state_update" | "ping";
  projectId?: string;
  userId?: string;
  payload?: Record<string, unknown>;
}

// ─── Room Registry ─────────────────────────────────────────────

const rooms = new Map<string, GameRoom>();
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const CHIPS_PER_SESSION = 2;

function getOrCreateRoom(projectId: string): GameRoom {
  let room = rooms.get(projectId);
  if (!room) {
    room = {
      projectId,
      players: new Map(),
      state: {},
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };
    rooms.set(projectId, room);
    console.log(`[game-server] Room created: ${projectId}`);
  }
  return room;
}

function broadcastToRoom(room: GameRoom, message: string, excludeId?: string): void {
  for (const [id, ws] of room.players) {
    if (id !== excludeId && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

function cleanupRoom(projectId: string): void {
  const room = rooms.get(projectId);
  if (room) {
    for (const ws of room.players.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close(1000, "Room closed");
      }
    }
    rooms.delete(projectId);
    console.log(`[game-server] Room destroyed: ${projectId}`);
  }
}

// ─── Idle Cleanup Interval ─────────────────────────────────────

setInterval(() => {
  const now = Date.now();
  for (const [projectId, room] of rooms) {
    if (room.players.size === 0 && now - room.lastActivity > IDLE_TIMEOUT_MS) {
      cleanupRoom(projectId);
    }
  }
}, 60_000); // Check every minute

// ─── Chip Billing ──────────────────────────────────────────────

async function billSession(projectId: string, userId: string): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Deduct chips via casino_ledger
    const { error: ledgerError } = await supabase.from("casino_ledger").insert({
      user_id: userId,
      project_id: projectId,
      transaction_type: "GAME_SERVER",
      chip_delta: -CHIPS_PER_SESSION,
      phase: "PHASE_1",
      status: "COMMITTED",
      description: `Game session charge: ${CHIPS_PER_SESSION} chips`,
    });

    if (ledgerError) {
      console.error(`[game-server] Billing error for ${userId}:`, ledgerError.message);
      return;
    }

    // Update chip balance
    await supabase.rpc("decrement_chips", {
      p_user_id: userId,
      p_amount: CHIPS_PER_SESSION,
    });

    console.log(`[game-server] Billed ${CHIPS_PER_SESSION} chips to ${userId} for project ${projectId}`);
  } catch (err) {
    console.error("[game-server] Billing exception:", err);
  }
}

// ─── Save Game State ───────────────────────────────────────────

async function saveGameState(projectId: string, state: Record<string, unknown>): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase
      .from("game_saves")
      .upsert(
        {
          project_id: projectId,
          state_json: state,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "project_id" }
      );

    if (error) {
      console.error(`[game-server] Save state error for ${projectId}:`, error.message);
    }
  } catch (err) {
    console.error("[game-server] Save state exception:", err);
  }
}

// ─── WebSocket Handler ─────────────────────────────────────────

function handleWebSocket(req: Request): Response {
  const url = new URL(req.url);
  const projectId = url.searchParams.get("projectId");
  const userId = url.searchParams.get("userId");

  if (!projectId || !userId) {
    return new Response(JSON.stringify({ error: "Missing projectId or userId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  const room = getOrCreateRoom(projectId);

  socket.onopen = () => {
    room.players.set(userId, socket);
    room.lastActivity = Date.now();

    // Notify others
    broadcastToRoom(
      room,
      JSON.stringify({
        type: "player_joined",
        userId,
        playerCount: room.players.size,
      }),
      userId
    );

    // Send current state to joining player
    socket.send(
      JSON.stringify({
        type: "room_state",
        state: room.state,
        playerCount: room.players.size,
      })
    );

    console.log(`[game-server] Player ${userId} joined room ${projectId} (${room.players.size} players)`);

    // Bill on join
    billSession(projectId, userId);
  };

  socket.onmessage = (event: MessageEvent) => {
    try {
      const msg: WsMessage = JSON.parse(event.data as string);
      room.lastActivity = Date.now();

      switch (msg.type) {
        case "state_update":
          if (msg.payload) {
            Object.assign(room.state, msg.payload);
            broadcastToRoom(
              room,
              JSON.stringify({
                type: "state_update",
                userId,
                payload: msg.payload,
              }),
              userId
            );

            // Persist state periodically (debounced by client)
            saveGameState(projectId, room.state);
          }
          break;

        case "ping":
          socket.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
          break;

        default:
          // Forward unknown message types to room
          broadcastToRoom(room, event.data as string, userId);
      }
    } catch {
      console.error("[game-server] Invalid message from", userId);
    }
  };

  socket.onclose = () => {
    room.players.delete(userId);
    room.lastActivity = Date.now();

    broadcastToRoom(
      room,
      JSON.stringify({
        type: "player_left",
        userId,
        playerCount: room.players.size,
      })
    );

    console.log(`[game-server] Player ${userId} left room ${projectId} (${room.players.size} remaining)`);

    // Auto-save state on last player leave
    if (room.players.size === 0) {
      saveGameState(projectId, room.state);
    }
  };

  socket.onerror = (err) => {
    console.error(`[game-server] WebSocket error for ${userId}:`, err);
    room.players.delete(userId);
  };

  return response;
}

// ─── HTTP Health Check ─────────────────────────────────────────

function handleHealth(): Response {
  const roomStats = Array.from(rooms.entries()).map(([id, room]) => ({
    projectId: id,
    players: room.players.size,
    uptime: Math.floor((Date.now() - room.createdAt) / 1000),
  }));

  return new Response(
    JSON.stringify({
      status: "ok",
      service: "svarnex-game-server",
      rooms: rooms.size,
      totalPlayers: Array.from(rooms.values()).reduce((sum, r) => sum + r.players.size, 0),
      roomDetails: roomStats,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// ─── Request Router ────────────────────────────────────────────

serve((req: Request) => {
  const url = new URL(req.url);

  // Health check endpoint
  if (url.pathname.endsWith("/health") || req.method === "GET" && !req.headers.get("upgrade")) {
    return handleHealth();
  }

  // WebSocket upgrade
  if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
    return handleWebSocket(req);
  }

  return new Response(JSON.stringify({ error: "Expected WebSocket connection" }), {
    status: 426,
    headers: { "Content-Type": "application/json" },
  });
});
