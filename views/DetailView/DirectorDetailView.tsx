"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/services/api";
import { useTranslation } from "react-i18next";
import { ArrowLeft, User, Phone, Mail, Calendar, ShieldCheck, ShieldAlert, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { DirectorDetailData } from "@/types";



interface Props {
  directorId: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_DataBaseURL;

export default function DirectorDetailView({ directorId }: Props) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "uz";

  const { data, isLoading, error } = useQuery<DirectorDetailData>({
    queryKey: ["director-detail", directorId],
    queryFn: async () => {
      const res = await API.get(`/super-admin/directors/${directorId}/`);
      return res?.data?.data ?? res?.data;
    },
  });

  const formatPhone = (phone: string) => {
    if (!phone) return "—";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 12) {
      return `+${cleaned.slice(0, 3)} (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
    }
    return phone;
  };

  const getAvatarUrl = (avatarPath: string | null | undefined) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http")) return avatarPath;
    return `${BASE_URL?.replace(/\/$/, "")}/${avatarPath.replace(/^\//, "")}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 mx-auto px-4 mt-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
          <div className="space-y-2">
            <div className="w-20 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="w-40 h-5 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-48 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800" />
          <div className="h-48 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-10 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
        <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-3" />
        <p className="text-sm font-semibold text-red-600 dark:text-red-400">
          {t("directors.error_loading", "Direktor ma'lumotlarini yuklashda xatolik yuz berdi yoki ID noto'g'ri.")}
        </p>
        <Link href="/directors" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline mt-3 inline-block">
          {t("common.back_to_list", "Ro'yxatga qaytish")}
        </Link>
      </div>
    );
  }

  const fullName = `${data.first_name || ""} ${data.last_name || ""}`.trim() || "—";
  const avatarUrl = getAvatarUrl(data.avatar);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Sahifa Shapkasi */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            href="/directors"
            className="p-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
              {t("nav.system_users", "Tizim Foydalanuvchilari")}
            </span>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
              {t("directors.profile_title", "Direktor Profili")}
            </h1>
          </div>
        </div>
      </div>

      {/* Asosiy Grid Maket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chap blok - Shaxsiy Ma'lumotlar */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/60">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100/70 dark:border-indigo-900/50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-snug">{fullName}</h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{t("common.system_id", "Tizim ID")}: {data.id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs pt-2">
            <div className="space-y-1 bg-slate-50/40 dark:bg-slate-800/20 p-3.5 border border-slate-100 dark:border-slate-800/50 rounded-xl">
              <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {t("common.phone", "Telefon raqam")}
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-bold text-sm pt-0.5">
                {formatPhone(data.phone)}
              </p>
            </div>

            <div className="space-y-1 bg-slate-50/40 dark:bg-slate-800/20 p-3.5 border border-slate-100 dark:border-slate-800/50 rounded-xl">
              <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {t("common.email", "Elektron pochta")}
              </span>
              <p className="text-slate-800 dark:text-slate-200 font-bold text-sm pt-0.5 truncate select-all">
                {data.email || "—"}
              </p>
            </div>
          </div>
        </div>

        {/* O'ng blok - Status va Tizim Metriklari */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-5">
          {/* Status bloki */}
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2.5">
              {t("common.profile_status", "Profil holati")}
            </p>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-lg border inline-flex items-center gap-1.5 shadow-2xs ${data.is_active
              ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
              : "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
              }`}>
              {data.is_active ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" /> {t("common.active", "Faol (Ruxsat bor)")}
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5" /> {t("common.blocked", "Bloklangan")}
                </>
              )}
            </span>
          </div>

          {/* Sana bloki */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
            <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
              {t("common.created_at", "Tizimga qo'shilgan sana")}
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold bg-slate-50/50 dark:bg-slate-800/30 px-3 py-2 rounded-xl border border-slate-100/80 dark:border-slate-800/60">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              {/* Sana tanlangan tilga (uz/en/ru) qarab formatlanadi */}
              <span>
                {new Date(data.created_at).toLocaleDateString(currentLang === "uz" ? "uz-UZ" : currentLang === "ru" ? "ru-RU" : "en-US", {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 px-1 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {new Date(data.created_at).toLocaleTimeString(currentLang === "uz" ? "uz-UZ" : currentLang === "ru" ? "ru-RU" : "en-US", {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}