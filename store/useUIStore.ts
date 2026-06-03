import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/i18n";

interface UIState {
  theme: "light" | "dark";
  language: string;
  isSidebarOpen: boolean;

  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      language: "uz",
      isSidebarOpen: false,

      setTheme: (theme) => {
        if (typeof window !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
        }
        set({ theme });
      },

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
      
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({ theme: state.theme, language: state.language }),
    },
  ),
);
