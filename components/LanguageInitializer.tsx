"use client";

import { useEffect } from "react";
import { useUIStore } from "@/store/useUIStore";
import i18n from "@/i18n";

export default function LanguageInitializer() {
    const language = useUIStore((state) => state.language);

    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language]);

    return null;
}