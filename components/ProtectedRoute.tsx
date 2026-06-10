"use client";

import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const isInitialized = useAuthStore((state) => state.isInitialized);
    const initAuth = useAuthStore((state) => state.initAuth);

    useEffect(() => {
        initAuth();
    }, []);

    useEffect(() => {
        if (isInitialized && !isAuthenticated) {
            toast.warn("Siz tizimga kirmagansiz yoki seans muddati tugagan!");
            router.push("/login");
        }
    }, [isInitialized, isAuthenticated, router]);

    if (!isInitialized) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative flex h-8 w-8 items-center justify-center">
                        <div className="absolute h-full w-full rounded-full border-2 border-indigo-100 dark:border-indigo-950" />
                        <div className="absolute h-full w-full rounded-full border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent dark:border-t-transparent animate-spin" />
                    </div>

                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide mt-2">
                        Xavfsiz ulanish tekshirilmoqda...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return <>{children}</>;
}