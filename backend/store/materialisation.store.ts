import { create } from "zustand";

// ── Types ────────────────────────────────────────────────────────

export type MaterialisationPhase =
  | "A"       // Genetic Assembly
  | "B"       // Ghost Injection
  | "C"       // Polymorphic Shield
  | "MATRIX"  // Simulation Matrix
  | "DONE"
  | "FAILED";

export interface MaterialisationState {
  job_id: string | null;
  phase: MaterialisationPhase | null;
  phase_progress: number;
  matrix_agents_passed: number;
  matrix_agents_total: number;
  error_message: string | null;
  retry_count: number;

  startMaterialisation: (project_id: string) => Promise<void>;
  pollJobStatus: (job_id: string) => Promise<void>;
  retryMaterialisation: () => Promise<void>;
  resetMaterialisation: () => void;
}

// ── Store — NO persistence ────────────────────────────────────────

export const useMaterialisationStore = create<MaterialisationState>()(
  (set, get) => ({
    job_id: null,
    phase: null,
    phase_progress: 0,
    matrix_agents_passed: 0,
    matrix_agents_total: 0,
    error_message: null,
    retry_count: 0,

    startMaterialisation: async (project_id: string) => {
      set({
        phase: "A",
        phase_progress: 0,
        error_message: null,
        retry_count: 0,
      });

      const res = await fetch(`/api/projects/${project_id}/materialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        const { error } = await res.json();
        set({ phase: "FAILED", error_message: error });
        return;
      }

      const { job_id } = await res.json();
      set({ job_id });
      get().pollJobStatus(job_id);
    },

    pollJobStatus: async (job_id: string) => {
      try {
        const res = await fetch(
          `/api/projects/_/materialize/status?job_id=${job_id}`
        );
        if (!res.ok) return;

        const {
          phase,
          phase_progress,
          matrix_agents_passed,
          matrix_agents_total,
          error_message,
        } = await res.json();

        set({
          phase,
          phase_progress,
          matrix_agents_passed,
          matrix_agents_total,
          error_message,
        });

        if (phase !== "DONE" && phase !== "FAILED") {
          setTimeout(() => get().pollJobStatus(job_id), 1500);
        }
      } catch {
        // Silently continue polling on network error
        setTimeout(() => get().pollJobStatus(job_id), 3000);
      }
    },

    retryMaterialisation: async () => {
      const { job_id, retry_count } = get();
      if (!job_id || retry_count >= 3) return;

      set((state) => ({
        retry_count: state.retry_count + 1,
        phase: "A",
        phase_progress: 0,
        error_message: null,
      }));

      await fetch(`/api/materialise/${job_id}/retry`, { method: "POST" });
      get().pollJobStatus(job_id);
    },

    resetMaterialisation: () =>
      set({
        job_id: null,
        phase: null,
        phase_progress: 0,
        matrix_agents_passed: 0,
        matrix_agents_total: 0,
        error_message: null,
        retry_count: 0,
      }),
  })
);
