"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/i18n";

interface UIState {
  theme: "light" | "dark";
  language: string;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean; // 1. Yangi holat (state)

  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setSidebarCollapsed: (isCollapsed: boolean) => void; // 2. Yangi funksiya (action)
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "light",
      language: "uz",
      isSidebarOpen: false,
      isSidebarCollapsed: false, // Default holatda sidebar ochiq turadi

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

      // 3. Collapse holatini o'zgartiruvchi action
      setSidebarCollapsed: (isCollapsed) =>
        set({ isSidebarCollapsed: isCollapsed }),
    }),
    {
      name: "ui-storage",
      // 4. partialize ichiga isSidebarCollapsed qo'shildi, shunda refresh bo'lganda ham yopiqligi eslab qolinadi
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        isSidebarCollapsed: state.isSidebarCollapsed,
      }),
    },
  ),
);
