"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Sun, Moon, Languages, LogOut } from "lucide-react";
import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";
import { useUIStore } from "@/store/useUIStore";
import { t } from "i18next";
import { useAuthStore } from "@/store/authStore";

const languages = [
  { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export default function SettingsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuthStore();

  const { theme, setTheme, language, setLanguage } = useUIStore();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedLang = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <Title text={t("settings.title")} />
        <Text text={t("settings.desc")} />
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 transition-colors">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t("settings.appearance")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("settings.appearance_desc")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all"
          >
            {theme === "light" ? t("settings.switch_dark") : t("settings.switch_light")}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t("settings.language")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("settings.language_desc")}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto h-10 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <span className="flex items-center gap-2">
                <span>{selectedLang.flag}</span>
                {selectedLang.name}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isLangOpen ? "rotate-180" : ""}`} />
            </button>

            {isLangOpen && (
              <div className="absolute right-0 top-12 w-full sm:w-48 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in-95 duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium rounded-lg transition-colors ${language === lang.code
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      {lang.flag} {lang.name}
                    </span>
                    {language === lang.code && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>


        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">
                {t("settings.logout")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t("settings.language_desc")}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-auto" >
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-semibold">{t("settings.logout")}</span>
            </button>
          </div>
        </div>

      </div>


      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("settings.logout_confirm_title")}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
              {t("settings.logout_confirm_desc")}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-800"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={() => {
                  logout();
                  setIsModalOpen(false);
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700"
              >
                {t("settings.logout")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}