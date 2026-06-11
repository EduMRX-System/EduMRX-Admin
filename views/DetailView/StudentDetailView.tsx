"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, User, Phone, Mail, Building2, Calendar,
  FileText, ShieldAlert, Users, Heart
} from "lucide-react";
import { API } from "@/services/api";
import { IStudentDetailData } from "@/types";

interface StudentDetailProps {
  id: string;
}

/* ── HELPER FOR DATE FORMATTING ────────────────────────────── */
function formatDate(iso: string) {
  try {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/* ── SKELETON LOADING VIEW ─────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="space-y-6 pb-10 max-w-[1600px] mx-auto px-4 sm:px-6 mt-6 animate-pulse">
      <div className="h-9 bg-slate-100 dark:bg-slate-800 rounded-xl w-24" />
      <div className="h-32 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6 flex gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0" />
        <div className="space-y-2 w-full">
          <div className="h-5 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/6" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-[250px] lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl" />
        <div className="h-[250px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl" />
      </div>
    </div>
  );
}

export default function StudentDetailView({ id }: StudentDetailProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["super-admin-student-detail", id],
    queryFn: async () => {
      const res = await API.get<IStudentDetailData>(`/super-admin/students/${id}/`);
      return res?.data;
    },
    enabled: !!id,
  });

  if (isLoading) return <DetailSkeleton />;

  if (!data) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 max-w-md mx-auto text-center mt-10">
        <div className="w-12 h-12 rounded-2xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>

        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
          {t("common.no_results", "Profil topilmadi")}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 max-w-xs font-medium leading-relaxed">
          O'quvchi ma'lumotlarini yuklashda xatolik yuz berdi yoki ushbu ID ga ega bo'lgan foydalanuvchi tizimda mavjud emas.
        </p>

        <button
          onClick={() => router.back()}
          className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/50 px-4 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("common.back", "Orqaga qaytish")}
        </button>
      </div>
    );
  }

  const statusConfig = {
    active: {
      label: t("status.active", "Faol"),
      style: "bg-emerald-50/60 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40",
    },
    graduated: {
      label: t("status.graduated", "Bitirgan"),
      style: "bg-blue-50/60 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40",
    },
    inactive: {
      label: t("status.inactive", "Nofaol"),
      style: "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/60",
    },
    suspended: {
      label: t("status.suspended", "To'xtatilgan"),
      style: "bg-amber-50/60 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/40",
    },
  };

  const currentStatus = statusConfig[data.status] || statusConfig.inactive;

  return (
    <div className="space-y-6">

      {/* Back Button */}
      <div className="">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {t("common.back", "Orqaga")}
        </button>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-500 font-bold text-xl uppercase shadow-inner">
              {data.avatar ? (
                <img src={data.avatar} alt={data.full_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                data.full_name?.substring(0, 2) || "ST"
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {data.full_name || "—"}
                </h1>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${currentStatus.style}`}>
                  {currentStatus.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>ID: {data.id || "—"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center bg-slate-50/60 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 px-3 py-2 rounded-xl">
            <Building2 className="w-4 h-4 text-slate-400" />
            <div className="text-left">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{t("student.center", "O'quv Markaz")}</p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{data.center_name || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left/Middle Column: Personal Information */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 lg:col-span-2 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              {t("student.personal_info", "Shaxsiy Ma'lumotlar")}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-300" /> {t("student.phone", "Telefon Raqami")}
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{data.phone || "—"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-300" /> {t("student.email", "Email Pochta")}
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 break-all">{data.email || "—"}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-300" /> {t("student.dob", "Tug'ilgan Sana")}
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formatDate(data.date_of_birth)}</p>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-300" /> {t("student.enrolled_at", "Ro'yxatdan O'tgan Sana")}
              </p>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{formatDate(data.enrolled_at)}</p>
            </div>
          </div>

          {/* System Notes Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-300" /> {t("student.notes", "Tizim Izohlari / Eslatmalar")}
            </p>
            <div className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/60 p-3.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
              {data.notes || t("student.no_notes", "Izohlar yoki qo'shimcha eslatmalar kiritilmagan.")}
            </div>
          </div>
        </div>

        {/* Right Column: Parent / Guardian Details */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              {t("student.parent_info", "Ota-ona / Vasiy Ma'lumotlari")}
            </h3>
          </div>

          {data.parent ? (
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("parent.full_name", "F.I.SH")}</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{data.parent.full_name || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("parent.phone", "Telefon Raqami")}</p>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{data.parent.phone || data.parent_phone || "—"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("parent.occupation", "Kasbi / Mashg'uloti")}</p>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">{data.parent.occupation || "—"}</p>
              </div>
            </div>
          ) : (
            /* Fallback to display parent_phone if full parent object is empty */
            <div className="space-y-4">
              {data.parent_phone ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("parent.phone", "Vasiy Telefon Raqami")}</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{data.parent_phone}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-2 text-slate-300">
                    <Heart className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{t("parent.no_data", "Vasiy ma'lumotlari mavjud emas.")}</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}