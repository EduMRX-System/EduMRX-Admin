"use client";

import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/useUIStore";
import { Menu, Sun, Moon, Languages } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Header() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { toggleSidebar } = useUIStore();

    return (
        <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
            <div className="max-w-[1600px] mx-auto px-6 h-16 flex justify-between items-center">

                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-4 ml-auto">

                    <Link href="/settings" className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-[12px] font-medium text-slate-900 dark:text-white leading-none">
                                {user?.full_name || t("header.user_name")}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                                {user?.role || t("header.admin")}
                            </p>
                        </div>

                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            {user?.avatar ? (
                                <Image
                                    src={user.avatar}
                                    alt="avatar"
                                    width={36}
                                    height={36}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                    {user?.full_name?.charAt(0).toUpperCase() || "A"}
                                </span>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    );
}