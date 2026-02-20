import { create } from "zustand";
import { useOracleStore } from "./oracle.store";
import type { User } from "@supabase/supabase-js";

// ── Types ────────────────────────────────────────────────────────

export type SubscriptionTier = "PRESENCE" | "BUSINESS" | "SCALE";
export type SubscriptionStatus =
  | "ACTIVE"
  | "CANCELLED"
  | "PAYMENT_FAILED"
  | "TRIALING"
  | "INACTIVE";

export interface DeviceTrust {
  trust_id: string;
  user_id: string;
  hw_hash: string;
  device_label: string;
  created_at: string;
  last_seen_at: string;
}

export interface UserState {
  session: User | null;
  tier: SubscriptionTier;
  chip_balance: number;
  subscription_status: SubscriptionStatus;
  razorpay_subscription_id: string | null;
  trusted_devices: DeviceTrust[];
  is_loading: boolean;

  fetchSession: () => Promise<void>;
  refreshChipBalance: () => Promise<void>;
  updateChipBalance: (delta: number) => void;
  fetchDevices: () => Promise<void>;
  removeDevice: (trust_id: string) => Promise<void>;
  logout: () => Promise<void>;
  updateTier: (tier: SubscriptionTier) => void;
}

// ── Store ─────────────────────────────────────────────────────────

export const useUserStore = create<UserState>()((set, get) => ({
      session: null,
      tier: "PRESENCE",
      chip_balance: 0,
      subscription_status: "INACTIVE",
      razorpay_subscription_id: null,
      trusted_devices: [],
      is_loading: false,

      fetchSession: async () => {
        set({ is_loading: true });
        try {
          const res = await fetch("/api/auth/session");
          if (!res.ok) {
            set({ session: null });
            return;
          }
          const { user, profile } = await res.json();
          set({
            session: user ?? null,
            tier: profile?.subscription_tier ?? "PRESENCE",
            chip_balance: profile?.chip_balance ?? 0,
            subscription_status: profile?.subscription_status ?? "INACTIVE",
            razorpay_subscription_id:
              profile?.razorpay_subscription_id ?? null,
          });
          // GAP-05: sync Oracle rate limit to user's tier
          useOracleStore
            .getState()
            .setRateLimitForTier(
              (profile?.subscription_tier ?? "PRESENCE") as "PRESENCE" | "BUSINESS" | "SCALE"
            );
        } finally {
          set({ is_loading: false });
        }
      },

      refreshChipBalance: async () => {
        const res = await fetch("/api/chips/balance");
        if (!res.ok) return;
        const data = await res.json();
        set({ chip_balance: data.chip_balance ?? data.effective_balance ?? 0 });
      },

      updateChipBalance: (delta: number) =>
        set((state) => ({ chip_balance: state.chip_balance + delta })),

      fetchDevices: async () => {
        const res = await fetch("/api/devices/list");
        if (!res.ok) return;
        const { devices } = await res.json();
        set({ trusted_devices: devices ?? [] });
      },

      removeDevice: async (trust_id: string) => {
        await fetch("/api/devices/remove", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trust_id }),
        });
        set((state) => ({
          trusted_devices: state.trusted_devices.filter(
            (d) => d.trust_id !== trust_id
          ),
        }));
      },

      logout: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        set({
          session: null,
          tier: "PRESENCE",
          chip_balance: 0,
          subscription_status: "INACTIVE",
          razorpay_subscription_id: null,
          trusted_devices: [],
        });
      },

      updateTier: (tier: SubscriptionTier) => set({ tier }),
    }));
