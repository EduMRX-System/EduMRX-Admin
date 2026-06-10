"use client";

import { ILearningCenter } from "@/types";
import { t } from "i18next";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  Trash2,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CenterItemProps {
  center: ILearningCenter;
  viewMode: "list" | "grid";
  onEdit: (center: ILearningCenter) => void;
  onDelete: (id: string, name: string) => void;
  formatPhone: (phone: string) => string;
  getSubscriptionCls: (date: string) => { text: string; cls: string };
}

export default function CenterItem({
  center,
  viewMode,
  onEdit,
  onDelete,
  formatPhone,
  getSubscriptionCls,
}: CenterItemProps) {
  const router = useRouter();
  const subStatus = getSubscriptionCls(center.subscription_expires);

  // Detail sahifasiga o'tish funksiyasi
  const handleRowClick = () => {
    router.push(`/centers/${center.id}`);
  };

  if (viewMode === "list") {
    return (
      <tr
        onClick={handleRowClick}
        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
      >
        {/* Center Details */}
        <td className="py-4 px-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {center.logo ? (
                <Image
                  width={40}
                  height={40}
                  src={center.logo}
                  alt={center.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {center.name}
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                /{center.slug}
              </div>
            </div>
          </div>
        </td>

        {/* Contact */}
        <td className="py-4 px-5">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{formatPhone(center.phone)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="truncate max-w-[160px]">{center.email}</span>
            </div>
          </div>
        </td>

        {/* Location & Students */}
        <td className="py-4 px-5">
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 max-w-[180px]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate" title={center.address}>
                {center.address}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>
                {center.students_count || 0} {t("centers.students")}
              </span>
            </div>
          </div>
        </td>

        {/* Status */}
        <td className="py-4 px-5">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize border ${center.status === "active"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900"
              : center.status === "pending"
                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${center.status === "active"
                ? "bg-emerald-500"
                : center.status === "pending"
                  ? "bg-amber-500"
                  : "bg-slate-400"
                }`}
            />
            {t(`centers.status.${center.status}`)}
          </span>
        </td>

        {/* Subscription */}
        <td className="py-4 px-5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${subStatus.cls}`}
          >
            <Calendar className="w-3.5 h-3.5 opacity-70" />
            {subStatus.text}
          </span>
        </td>

        {/* Actions */}
        <td className="py-4 px-5 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Qator klikini to'xtatish
                onEdit(center);
              }}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all cursor-pointer"
              title={t("common.edit")}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation(); // Qator klikini to'xtatish
                onDelete(center.id, center.name);
              }}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border border-transparent hover:border-red-100 dark:hover:border-red-900 transition-all cursor-pointer"
              title={t("common.delete")}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // GRID KO'RINISHI (Grid Mode)
  return (
    <div
      onClick={handleRowClick}
      className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-md transition-all group relative cursor-pointer"
    >
      <div>
        {/* Header (Logo + Status) */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {center.logo ? (
              <Image
                width={40}
                height={40}
                src={center.logo}
                alt={center.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${center.status === "active"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900"
                : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900"
                }`}
            >
              {t(`centers.status.${center.status}`)}
            </span>
          </div>
        </div>

        {/* Markaz nomi */}
        <div className="mb-4">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base line-clamp-1">
            {center.name}
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-mono mt-0.5">
            /{center.slug}
          </p>
        </div>

        {/* Kontent ma'lumotlari */}
        <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 mb-5">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span>{formatPhone(center.phone)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">{center.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate" title={center.address}>
              {center.address}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {center.students_count || 0} {t("centers.students")}
            </span>
          </div>
        </div>
      </div>

      {/* Footer (Obuna + Amallar) */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${subStatus.cls}`}
        >
          <Calendar className="w-3 h-3 opacity-70" />
          {subStatus.text}
        </span>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Card klikini to'xtatish
              onEdit(center);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Card klikini to'xtatish
              onDelete(center.id, center.name);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border border-slate-100 dark:border-slate-700 hover:border-red-100 dark:hover:border-red-900 transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}