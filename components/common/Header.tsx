"use client";

import { useAuthStore } from "@/store/authStore";
import { useUIStore } from "@/store/useUIStore";
import { Menu, Sun, Moon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function Header() {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const { setTheme, theme, toggleSidebar } = useUIStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />;
    }

    return (
        <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-colors">
            <div className=" mx-auto px-6 h-16 flex justify-between items-center lg:justify-end">

                {/* Mobile hamburger */}
                <button
                    onClick={toggleSidebar}
                    className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                    <Menu className="w-6 h-6" />
                </button>


                {/* Theme toggle — oxirida */}
                <div className="flex gap-[15px] items-center">
                    <button
                        type="button"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer focus:outline-none overflow-hidden group"
                        aria-label="Toggle Theme"
                    >
                        <Sun className="w-5 h-5 absolute transition-all duration-500 ease-in-out transform dark:rotate-90 dark:scale-0 scale-100 rotate-0 text-amber-500" />
                        <Moon className="w-5 h-5 absolute transition-all duration-500 ease-in-out transform dark:rotate-0 dark:scale-100 scale-0 -rotate-90 text-indigo-400" />
                    </button>

                    {/* Spacer for desktop (hamburger is hidden) */}
                    <div className="hidden lg:block" />

                    {/* Right side */}
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
            </div>
        </header>
    );
}