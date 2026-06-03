"use client";

import Header from "@/components/common/Header";
import LeftComponent from "@/components/common/LeftComponent";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useUIStore } from "@/store/useUIStore";

export default function MailLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <ProtectedRoute>
      <div className="bg-[#F8F9FA] dark:bg-slate-950 min-h-screen flex w-full overflow-hidden transition-colors duration-300">

        {/* OVERLAY */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`
          bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 
          shadow-sm h-screen fixed lg:static z-50 w-60 
          transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <LeftComponent />
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* HEADER */}
          <header className="bg-white dark:bg-slate-900 sticky top-0 z-30 border-b border-gray-200 dark:border-slate-800 transition-colors duration-300">
            <Header />
          </header>

          {/* PAGE CONTENT */}
          <main className="p-4 md:p-[30px] flex-1 transition-colors duration-300">
            {children}
          </main>

        </div>
      </div>
    </ProtectedRoute>
  );
}