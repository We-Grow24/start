import { create } from "zustand";

// ── Types ────────────────────────────────────────────────────────

export type OracleRole = "USER" | "ORACLE";

export interface OracleMessage {
  id: string;
  session_id: string;
  role: OracleRole;
  content: string;
  chip_cost: number;
  created_at: string;
}

export interface OracleState {
  conversation: OracleMessage[];
  call_count: number;
  free_calls_remaining: number;
  rate_limit_max: number;
  is_thinking: boolean;
  streaming_message_id: string | null;
  chip_warning: string | null;
  current_session_id: string | null;

  sendMessage: (content: string, projectId?: string) => Promise<void>;
  clearConversation: () => void;
  incrementCallCount: () => void;
  fetchSessionHistory: (project_id: string) => Promise<void>;
  clearChipWarning: () => void;
  /** GAP-05: Set free call quota based on user tier (PRD §9 rate limits) */
  setRateLimitForTier: (tier: "PRESENCE" | "BUSINESS" | "SCALE") => void;
}

// ── Store — NO persistence (in-memory only) ───────────────────────

export const useOracleStore = create<OracleState>()((set, get) => ({
  conversation: [],
  call_count: 0,
  // PRD §9: Presence=10, Business=20, Scale=50 (initialise at Presence default)
  free_calls_remaining: 10,
  rate_limit_max: 10,
  is_thinking: false,
  streaming_message_id: null,
  chip_warning: null,
  current_session_id: null,

  sendMessage: async (content: string, projectId?: string) => {
    const { current_session_id } = get();

    const userMsg: OracleMessage = {
      id: crypto.randomUUID(),
      session_id: current_session_id ?? "",
      role: "USER",
      content,
      chip_cost: 0,
      created_at: new Date().toISOString(),
    };

    // Placeholder oracle message for incremental SSE streaming
    const oracleMsgId = crypto.randomUUID();
    const oracleMsg: OracleMessage = {
      id: oracleMsgId,
      session_id: current_session_id ?? "",
      role: "ORACLE",
      content: "",
      chip_cost: 0,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      conversation: [...state.conversation, userMsg, oracleMsg],
      is_thinking: true,
      streaming_message_id: oracleMsgId,
      chip_warning: null,
    }));

    try {
      const res = await fetch("/api/oracle/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          project_id: projectId,
          session_id: current_session_id,
        }),
      });

      // Insufficient chip balance → show inline warning
      if (res.status === 402) {
        set((state) => ({
          conversation: state.conversation.filter((m) => m.id !== oracleMsgId),
          is_thinking: false,
          streaming_message_id: null,
          chip_warning: "Insufficient chip balance. Top up to continue.",
        }));
        return;
      }

      if (!res.ok) {
        set((state) => ({
          conversation: state.conversation.filter((m) => m.id !== oracleMsgId),
          is_thinking: false,
          streaming_message_id: null,
        }));
        return;
      }

      // Update rate limit from response headers
      const rlRemaining = res.headers.get("X-RateLimit-Remaining");
      const rlLimit = res.headers.get("X-RateLimit-Limit");
      if (rlRemaining !== null) {
        set({ free_calls_remaining: parseInt(rlRemaining, 10) });
      }
      if (rlLimit !== null) {
        set({ rate_limit_max: parseInt(rlLimit, 10) });
      }

      // Read SSE stream via ReadableStream
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedContent = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);

            if (parsed.error) break;

            if (parsed.done) {
              if (parsed.remaining !== undefined) {
                set({ free_calls_remaining: parsed.remaining });
              }
              if (parsed.session_id) {
                set({ current_session_id: parsed.session_id });
              }
              continue;
            }

            if (parsed.text) {
              accumulatedContent += parsed.text;
              set((state) => ({
                conversation: state.conversation.map((m) =>
                  m.id === oracleMsgId
                    ? { ...m, content: accumulatedContent }
                    : m
                ),
              }));
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      // Finalize oracle message
      set((state) => ({
        conversation: state.conversation.map((m) =>
          m.id === oracleMsgId
            ? { ...m, content: accumulatedContent || m.content, chip_cost: 1 }
            : m
        ),
        call_count: state.call_count + 1,
        is_thinking: false,
        streaming_message_id: null,
      }));
    } catch {
      set((state) => ({
        conversation: state.conversation.filter((m) => m.id !== oracleMsgId),
        is_thinking: false,
        streaming_message_id: null,
      }));
    }
  },

  clearConversation: () =>
    set({ conversation: [], call_count: 0, current_session_id: null, chip_warning: null, streaming_message_id: null }),

  clearChipWarning: () => set({ chip_warning: null }),

  // GAP-05: Tier-aware rate limit initialisation (PRD §9)
  setRateLimitForTier: (tier) => {
    const TIER_LIMITS: Record<"PRESENCE" | "BUSINESS" | "SCALE", number> = {
      PRESENCE: 10,
      BUSINESS: 20,
      SCALE: 50,
    };
    const max = TIER_LIMITS[tier] ?? 10;
    set({ rate_limit_max: max, free_calls_remaining: max });
  },

  incrementCallCount: () =>
    set((state) => ({
      call_count: state.call_count + 1,
      free_calls_remaining: Math.max(0, state.free_calls_remaining - 1),
    })),

  fetchSessionHistory: async (project_id: string) => {
    const res = await fetch(`/api/oracle/history/${project_id}`);
    if (!res.ok) return;
    const { messages, session_id } = await res.json();
    set({
      conversation: messages ?? [],
      current_session_id: session_id ?? null,
    });
  },
}));
