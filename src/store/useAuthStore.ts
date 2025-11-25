// src/store/useAuthStore.ts
import { create } from "zustand";
import { getCurrentUser, logoutUser } from "@/services/auth";
import type { AppUser } from "@/services/auth";

type AuthState = {
  user: AppUser | null;
  loading: boolean;
  initialized: boolean;
  error?: string;
  fetchUser: () => Promise<void>;
  clearUser: () => void;
  signOut: () => Promise<void>;
  setUser: (user: AppUser | null) => void;   // <- nueva
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: undefined,

  fetchUser: async () => {
    set({ loading: true, error: undefined });
    try {
      const user = await getCurrentUser();
      set({ user, loading: false, initialized: true });
    } catch (e: any) {
      set({ error: e.message, loading: false, initialized: true, user: null });
    }
  },

  clearUser: () => set({ user: null }),

  signOut: async () => {
    await logoutUser();
    set({ user: null, initialized: true });
  },

  setUser: (user) => set({ user, initialized: true }), // <- importante
}));
