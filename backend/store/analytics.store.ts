import { create } from "zustand";

// ── Types ────────────────────────────────────────────────────────

export interface PixelEvent {
  event_type: "PAGEVIEW" | "CLICK" | "FORM_SUBMIT" | "SESSION_END" | "CTA";
  project_id: string;
  visitor_hash: string;
  url: string;
  referrer?: string;
  element_selector?: string;
  x?: number;
  y?: number;
  timestamp: string;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  weight: number;
  element_selector?: string;
}

export interface PulseDashboardData {
  project_id: string;
  period_start: string;
  period_end: string;
  total_pageviews: number;
  unique_visitors: number;
  avg_session_duration_seconds: number;
  bounce_rate: number;
  top_entry_blocks: { block_id: string; label: string; views: number }[];
  top_exit_blocks: { block_id: string; label: string; exits: number }[];
  conversion_dna: {
    block_id: string;
    label: string;
    conversion_pct: number;
  }[];
}

export interface AnalyticsState {
  pixel_buffer: PixelEvent[];
  pulse_data: PulseDashboardData | null;
  heatmap_data: HeatmapPoint[];
  is_loading_pulse: boolean;

  bufferPixelEvent: (event: PixelEvent) => void;
  flushPixelBuffer: () => Promise<void>;
  fetchPulseDashboard: (project_id: string) => Promise<void>;
  clearHeatmap: () => void;
}

// ── Constants ────────────────────────────────────────────────────

const FLUSH_THRESHOLD = 10;
const FLUSH_INTERVAL_MS = 30_000;

// ── Store — NO persistence ────────────────────────────────────────

export const useAnalyticsStore = create<AnalyticsState>()((set, get) => {
  // Auto-flush timer
  if (typeof window !== "undefined") {
    setInterval(() => {
      if (get().pixel_buffer.length > 0) {
        get().flushPixelBuffer();
      }
    }, FLUSH_INTERVAL_MS);
  }

  return {
    pixel_buffer: [],
    pulse_data: null,
    heatmap_data: [],
    is_loading_pulse: false,

    bufferPixelEvent: (event: PixelEvent) => {
      set((state) => ({
        pixel_buffer: [...state.pixel_buffer, event],
      }));
      if (get().pixel_buffer.length >= FLUSH_THRESHOLD) {
        get().flushPixelBuffer();
      }
    },

    flushPixelBuffer: async () => {
      const { pixel_buffer } = get();
      if (pixel_buffer.length === 0) return;

      set({ pixel_buffer: [] });

      try {
        await fetch("/api/analytics/pixel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ events: pixel_buffer }),
        });
      } catch {
        // Re-buffer on failure
        set((state) => ({
          pixel_buffer: [...pixel_buffer, ...state.pixel_buffer],
        }));
      }
    },

    fetchPulseDashboard: async (project_id: string) => {
      set({ is_loading_pulse: true });
      try {
        const res = await fetch(`/api/analytics/pulse/${project_id}`);
        if (!res.ok) return;
        const { pulse, heatmap } = await res.json();
        set({ pulse_data: pulse, heatmap_data: heatmap ?? [] });
      } finally {
        set({ is_loading_pulse: false });
      }
    },

    clearHeatmap: () => set({ heatmap_data: [] }),
  };
});
