"use client";

import { icons } from "@/constants/icons";
import { useUIStore } from "@/store/useUIStore";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function LeftComponent() {
  const { t } = useTranslation();
  const { setSidebarOpen, isSidebarCollapsed, setSidebarCollapsed } =
    useUIStore();
  const pathname = usePathname();

  const navlinks = [
    { id: 1, href: "/", label: t("nav.dashboard"), icon: icons.dashboardIcon },
    {
      id: 2,
      href: "/directors",
      label: t("nav.directors"),
      icon: icons.directorIcon,
    },
    {
      id: 3,
      href: "/centers",
      label: t("nav.centers"),
      icon: icons.learningCenterIcon,
    },
    {
      id: 4,
      href: "/students",
      label: t("centers.students"),
      icon: icons.studentsIcon,
    },
    {
      id: 5,
      href: "/financial",
      label: t("nav.financial"),
      icon: icons.paymentsIcon,
    },
    {
      id: 6,
      href: "/settings",
      label: t("nav.settings"),
      icon: icons.settingsIcon,
    },
  ];

  const collapsed = isSidebarCollapsed;

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 relative">
      {/* BRAND */}
      <div
        className={`flex items-center transition-all duration-300 ${collapsed ? "px-3 py-6 justify-center gap-0" : "p-6 justify-between gap-3"
          }`}
      >
        <div className={`flex items-center gap-3 ${collapsed ? "w-0 overflow-hidden" : ""}`}>
          <span className={`w-10 h-10 text-white bg-[#4F46E5] text-base flex justify-center items-center rounded-lg font-bold shrink-0 ${collapsed ? "hidden" : ""}`}>
            EX
          </span>
          <div
            className={`overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              }`}
          >
            <p className="text-2xl font-black text-slate-900  dark:text-white leading-none whitespace-nowrap">
              {t("brand.name")}
            </p>
            <p className="text-slate-500 w-[10px] dark:text-slate-400 text-xs font-bold mt-1 whitespace-nowrap">
              {t("brand.desc")}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSidebarCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-all duration-200 cursor-pointer shrink-0"
          title={collapsed ? t("nav.expand") || "Expand" : t("nav.collapse") || "Collapse"}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* NAVIGATSIYA */}
      <nav className="flex-1 mt-4 px-2 overflow-y-auto overflow-x-hidden">
        {navlinks.map((item) => {
          // Dynamic Active Logic:
          // Dashboard uchun aniq tenglik, boshqa modullar uchun sub-path (starts with) tekshiruvi
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.id}
              onClick={() => setSidebarOpen(false)}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`
                group relative flex items-center w-full rounded-r-xl
                transition-all duration-200 text-sm font-medium mb-1
                ${collapsed ? "px-0 py-3 justify-center" : "px-6 py-3 gap-4"}
                ${isActive
                  ? "bg-[#4F46E5] text-white border-l-[5px] border-[#3525CD]"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-l-[5px] border-transparent"
                }
              `}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={20}
                height={20}
                className={`
                  w-5 h-5 shrink-0
                  ${isActive
                    ? "brightness-0 invert"
                    : "opacity-60 dark:brightness-0 dark:invert dark:opacity-50"
                  }
                `}
              />
              {/* Label — collapsed holatda yashiriladi */}
              <span
                className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  }`}
              >
                {item.label}
              </span>

              {/* Tooltip — faqat collapsed holatda ko'rinadi */}
              {collapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] whitespace-nowrap pointer-events-none">
                  {item.label}
                  {/* Arrow */}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 dark:bg-slate-700 rotate-45" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}