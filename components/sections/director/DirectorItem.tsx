"use client";

import { t } from "i18next";
import { User, Phone, Mail, Edit2, Trash2, Calendar } from "lucide-react";
import Image from "next/image";

export interface IDirector {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar?: string | null;
  created_at: string;
}

interface DirectorItemProps {
  director: IDirector;
  viewMode: "list" | "grid";
  onEdit: (director: IDirector) => void;
  onDelete: (id: string, name: string) => void;
  formatPhone: (phone: string) => string;
}

const BASE_URL = process.env.NEXT_PUBLIC_DataBaseURL;



export default function DirectorItem({
  director,
  viewMode,
  onEdit,
  onDelete,
  formatPhone,
}: DirectorItemProps) {
  const formattedDate = director.created_at
    ? new Date(director.created_at).toLocaleDateString("uz-UZ")
    : "—";

  console.log(BASE_URL);


  if (viewMode === "list") {
    return (
      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
        {/* Avatar va To'liq Ism */}
        <td className="py-4 px-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {director.avatar ? (
                <Image
                  src={
                    director?.avatar
                      ? director.avatar.includes("edumrx-1.onrender.com")
                        ? director.avatar.replace("edumrx-1.onrender.com", "www.edumrx.uz")
                        : director.avatar.startsWith("http")
                          ? director.avatar // Agar boshqa to'g'ri http link bo'lsa tegmaydi
                          : `${BASE_URL?.replace(/\/$/, "")}/${director.avatar.replace(/^\//, "")}`
                      : "/default-avatar.png"
                  } alt="Avatar"
                  width={40}
                  height={40}
                />
              ) : (
                <User className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                {director.full_name}
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                ID: {director.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        </td>

        {/* Telefon va Email */}
        <td className="py-4 px-5">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="font-medium">{formatPhone(director.phone)}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span className="truncate max-w-[180px]">{director.email}</span>
            </div>
          </div>
        </td>

        {/* Yaratilgan sana */}
        <td className="py-4 px-5">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{formattedDate}</span>
          </div>
        </td>

        {/* Amallar */}
        <td className="py-4 px-5 text-right">
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => onEdit(director)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all cursor-pointer"
              title="Tahrirlash"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(director.id, director.full_name)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border border-transparent hover:border-red-100 dark:hover:border-red-900 transition-all cursor-pointer"
              title="O'chirish"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </td>
      </tr>
    );
  }

  // GRID MODE
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between hover:shadow-md transition-all group">
      <div>
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
            {director.avatar ? (
              <Image
                width={40}
                height={40}
                src={director.avatar}
                alt={director.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base line-clamp-1">
              {director.full_name}
            </h4>
            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 block mt-0.5">
              {t("directors.role")}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 mb-4">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="font-medium">{formatPhone(director.phone)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
            <span className="truncate">{director.email}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {formattedDate}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(director)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all cursor-pointer"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(director.id, director.full_name)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 border border-slate-100 dark:border-slate-700 hover:border-red-100 dark:hover:border-red-900 transition-all cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
