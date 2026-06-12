"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { t } from "i18next";
import { useRouter } from "next/navigation";

interface DeleteModalProps {
  centerId: string;
  centerName: string;
  onClose: () => void;
}

export default function DeleteLearningCenterModal({ centerId, centerName, onClose }: DeleteModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter()

  const { mutate: deleteCenter, isPending } = useMutation({
    mutationFn: async () => {
      await API.delete(`super-admin/centers/${centerId}/`);
    },
    onSuccess: () => {
      toast.success("O'quv markazi tizimdan butkul o'chirildi");
      queryClient.invalidateQueries({ queryKey: ["learning-centers", "learning-center-detail"] });
      router.push("/centers");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.message || "O'chirishda xatolik yuz berdi");
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-10 transition-colors">
        <div className="p-5 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900 flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {t("centers.delete_title")}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {t("centers.delete_confirm")}{" "}
            <span className="font-semibold text-slate-800 dark:text-slate-200">"{centerName}"</span>{" "}
            {t("centers.delete_confirm_end")}
          </p>

          <div className="flex items-center gap-3 w-full mt-6">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold rounded-lg cursor-pointer transition-colors">
              {t("centers.delete_cancel")}
            </button>
            <button type="button" onClick={() => deleteCenter()} disabled={isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 h-10 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 cursor-pointer transition-colors">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("centers.delete_btn")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}