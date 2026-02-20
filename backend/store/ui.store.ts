import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ────────────────────────────────────────────────────────

export type ZoneType = "FORGE" | "FOUNDRY" | "ENGINE" | "BAZAAR" | "LOGIC";

export type ActiveModal =
  | "CHIP_TOPUP"
  | "EXPORT_CONFIRM"
  | "DEVICE_REGISTER"
  | "UPGRADE"
  | null;

export interface UIState {
  current_zone: ZoneType | null;
  active_modal: ActiveModal;
  is_materialising: boolean;
  materialisation_progress: number;
  is_sidebar_open: boolean;
  webgpu_supported: boolean;
  webgl_fallback_active: boolean;
  loading_states: Record<string, boolean>;

  setZone: (zone: ZoneType) => void;
  openModal: (modal: NonNullable<ActiveModal>) => void;
  closeModal: () => void;
  setMaterialising: (bool: boolean) => void;
  setProgress: (n: number) => void;
  detectWebGPU: () => void;
  setLoadingState: (key: string, bool: boolean) => void;
  toggleSidebar: () => void;
}

// ── Store — persisted to localStorage (PRD: SVX-009) ──────────────

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
  current_zone: null,
  active_modal: null,
  is_materialising: false,
  materialisation_progress: 0,
  is_sidebar_open: true,
  webgpu_supported: false,
  webgl_fallback_active: false,
  loading_states: {},

  setZone: (zone) => set({ current_zone: zone }),

  openModal: (modal) => set({ active_modal: modal }),

  closeModal: () => set({ active_modal: null }),

  setMaterialising: (bool) =>
    set({ is_materialising: bool, materialisation_progress: bool ? 0 : 100 }),

  setProgress: (n) =>
    set({ materialisation_progress: Math.min(100, Math.max(0, n)) }),

  detectWebGPU: () => {
    const supported = typeof navigator !== "undefined" && !!navigator.gpu;
    set({
      webgpu_supported: supported,
      webgl_fallback_active: !supported,
    });
  },

  setLoadingState: (key, bool) =>
    set((state) => ({
      loading_states: { ...state.loading_states, [key]: bool },
    })),

  toggleSidebar: () =>
    set((state) => ({ is_sidebar_open: !state.is_sidebar_open })),
    }),
    { name: "svarnex-ui" }
  )
);
