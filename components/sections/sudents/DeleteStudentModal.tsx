"use client";

import { X, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DeleteStudentModalProps {
    studentName: string;
    isPending: boolean;
    onConfirm: () => void;
    onClose: () => void;
}

export default function DeleteStudentModal({
    studentName,
    isPending,
    onConfirm,
    onClose,
}: DeleteStudentModalProps) {
    const { t } = useTranslation();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs">
            {/* Modal Card */}
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-5 h-5" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {t("students.deleteModal.title", "Talabani o'chirish")}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isPending}
                        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5">
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {t("students.deleteModal.confirmText", 'Rostdan ham "{{name}}" ismli talabani tizimdan butunlay o\'chirib tashlamoqchimisiz?', { name: studentName })}
                    </p>
                    <p className="text-xs text-red-500 dark:text-red-400 font-medium mt-2 bg-red-50/50 dark:bg-red-950/20 border border-red-100/50 dark:border-red-900/30 rounded-md p-2">
                        {t("students.deleteModal.warningText", "Ogohlantirish: Bu amalni ortga qaytarib bo'lmaydi va talabaga tegishli barcha ma'lumotlar o'chib ketadi.")}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="h-9 px-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                        {t("students.modal.cancel", "Bekor qilish")}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isPending}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer disabled:opacity-70 min-w-[100px] shadow-sm"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                {t("students.deleteModal.deletingStatus", "O'chirilmoqda...")}
                            </>
                        ) : (
                            t("students.deleteModal.deleteBtn", "O'chirish")
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}