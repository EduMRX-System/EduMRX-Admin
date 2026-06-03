"use client";

import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";

export default function ThemeInitializer() {
    const [hydrated, setHydrated] = useState(false);
    const theme = useUIStore((state) => state.theme);

    useEffect(() => {
        const unsub = useUIStore.persist.onFinishHydration(() => {
            setHydrated(true);
        });

        if (useUIStore.persist.hasHydrated()) {
            setHydrated(true);
        }

        return unsub;
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme, hydrated]);

    return null;
}