"use client";

import { icons } from "@/constants/icons";
import { useUIStore } from "@/store/useUIStore";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LeftComponent() {
    const { t } = useTranslation();
    const { setSidebarOpen, language, setLanguage } = useUIStore();
    const pathname = usePathname();

    const navlinks = [
        { id: 1, href: "/", label: t("nav.dashboard"), icon: icons.dashboardIcon },
        { id: 2, href: "/directors", label: t("nav.directors"), icon: icons.directorIcon },
        { id: 3, href: "/centers", label: t("nav.centers"), icon: icons.learningCenterIcon },
        { id: 4, href: "/payments", label: t("nav.financial"), icon: icons.paymentsIcon },
        { id: 5, href: "/settings", label: t("nav.settings"), icon: icons.settingsIcon },
    ];


    return (
        <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-colors duration-300">

            {/* BRAND */}
            <div className="p-6 flex gap-3 items-center">
                <span className="w-10 h-10 text-white bg-[#4F46E5] text-base flex justify-center items-center rounded-lg font-bold shrink-0">
                    EX
                </span>
                <div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
                        {t("brand.name")}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1">
                        {t("brand.desc")}
                    </p>
                </div>
            </div>

            {/* NAVIGATSIYA */}
            <nav className="flex-1 mt-4 px-2">
                {navlinks.map((item) => {
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.id}
                            onClick={() => setSidebarOpen(false)}
                            href={item.href}
                            className={`
                                flex items-center gap-4 w-full px-6 py-3 rounded-r-xl
                                transition-all duration-200 text-sm font-medium mb-1
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
                                        ? "brightness-0 invert"                          // active: oq
                                        : "opacity-60 dark:brightness-0 dark:invert dark:opacity-50"  // dark: oq, light: qora
                                    }
                                `}
                            />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div >
    );
}