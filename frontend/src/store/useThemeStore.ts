import { create } from "zustand";

interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  const storedTheme = localStorage.getItem("hirehub_theme") as "light" | "dark" | null;
  if (storedTheme) return storedTheme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const useThemeStore = create<ThemeState>((set) => {
  const initial = getInitialTheme();
  if (typeof document !== "undefined") {
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  return {
    theme: initial,
    toggleTheme: () => {
      set((state) => {
        const next = state.theme === "light" ? "dark" : "light";
        localStorage.setItem("hirehub_theme", next);
        if (next === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        return { theme: next };
      });
    },
    setTheme: (theme) => {
      localStorage.setItem("hirehub_theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      set({ theme });
    },
  };
});
