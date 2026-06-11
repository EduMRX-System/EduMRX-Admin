"use client";

import Header from "@/components/common/Header";
import LeftComponent from "@/components/common/LeftComponent";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUIStore } from "@/store/useUIStore";

export default function MailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSidebarOpen, setSidebarOpen, isSidebarCollapsed } = useUIStore();

  return (
    <ProtectedRoute>
      <div className="bg-[#F8F9FA] dark:bg-slate-950 h-screen w-screen flex overflow-hidden transition-colors duration-300">

        {/* MOBILE OVERLAY BACKDROP */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside
          className={`
            bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800
            shadow-sm z-50 transition-all duration-300 h-screen shrink-0 overflow-y-auto overflow-x-hidden
            ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"}
            fixed lg:relative lg:translate-x-0
            ${isSidebarOpen ? "w-64 translate-x-0" : "w-64 -translate-x-full"}
          `}
        >
          <LeftComponent />
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden transition-all duration-300">
          <header className="bg-white dark:bg-slate-900 sticky top-0 z-30 border-b border-gray-200 dark:border-slate-800 transition-colors duration-300 w-full">
            <Header />
          </header>

          <main className="p-4 md:p-[30px] flex-1 overflow-y-auto transition-all duration-300 bg-[#F8F9FA] dark:bg-slate-950 h-full w-full">
            <div className="  w-full">
              {children}
            </div>
          </main>
        </div>

      </div>
    </ProtectedRoute>
  );
}
