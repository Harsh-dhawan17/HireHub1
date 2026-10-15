import { create } from "zustand";
import { User } from "../types";
import { authApi } from "../api/auth.api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  setUser: (user: User | null, token?: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const response = await authApi.getCurrentUser();
      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem("hirehub_token");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  setUser: (user: User | null, token?: string) => {
    if (token) {
      localStorage.setItem("hirehub_token", token);
    } else if (!user) {
      localStorage.removeItem("hirehub_token");
    }
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    });
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      localStorage.removeItem("hirehub_token");
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));
