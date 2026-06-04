"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next"; // i18next hooki
import { API } from "@/services/api";
import { Loader2, AlertCircle, User, Plus } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";

import { icons } from "@/constants/icons";
import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";
import StudentItem from "@/components/sections/sudents/StudentItem";
import AddStudentModal from "@/components/sections/sudents/AddStudentModal";
import EditStudentModal from "@/components/sections/sudents/EditStudentModal";
import DeleteStudentModal from "@/components/sections/sudents/DeleteStudentModal";
import { IStudent } from "@/types";

interface IStudentsResponse {
  results?: IStudent[];
  data?: IStudent[];
}

export default function StudentsView() {
  const { t } = useTranslation(); // Tarjima funksiyasi
  const queryClient = useQueryClient();
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<IStudent | null>(null);

  const centerId = "a8c590b8-2b54-4e94-bbe4-0bb006093ecd";

  // Center ma'lumotlari
  const { data: centerData } = useQuery({
    queryKey: ["current-center", centerId],
    queryFn: async () => {
      const res = await API.get(`/api/v1/super-admin/centers/${centerId}/`);
      return res?.data;
    },
    enabled: !!centerId,
  });

  const { data: studentsData, isLoading, isError, error } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const res = await API.get<IStudentsResponse | IStudent[]>("/api/v1/students/");
      return res?.data;
    }
  });

  const studentsList = Array.isArray(studentsData)
    ? studentsData
    : studentsData?.results || studentsData?.data || [];

  const { mutate: deleteStudent, isPending: isDeletePending } = useMutation({
    mutationFn: async (id: string) => {
      await API.delete(`/api/v1/students/${id}/`);
    },
    onSuccess: () => {
      toast.success(t("students.deleteSuccess", "Talaba muvaffaqiyatli o'chirildi"));
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setDeletingStudent(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t("students.deleteError", "O'chirishda xatolik yuz berdi"));
    }
  });

  const formatPhoneView = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    if (clean.length === 12) {
      return `+998 (${clean.slice(3, 5)}) ${clean.slice(5, 8)}-${clean.slice(8, 10)}-${clean.slice(10)}`;
    }
    return phone;
  };

  return (
    <div className="w-full text-slate-900 dark:text-slate-100">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <Title text={t("students.title", "Students")} />
          </div>
          <Text text={t("students.subtitle", "Manage and track student enrollment, performance, and status.")} />
        </div>
        <button
          onClick={() => setIsOpenAddModal(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> {t("centers.add")}
          <span>{t("students.addBtn", "Add Student")}</span>
        </button>
      </div>

      {/* STATES */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-xs">
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 font-medium">
            {t("students.loading", "Talabalar ro'yxati yuklanmoqda...")}
          </p>
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400 mb-3" />
          <h3 className="text-base font-semibold text-red-900 dark:text-red-400">
            {t("students.errorTitle", "Ma'lumotlarni yuklashda xatolik")}
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1 max-w-md">{(error as any)?.message}</p>
        </div>
      )}

      {/* JADVAL */}
      {!isLoading && !isError && studentsList.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">{t("students.table.name", "Student Name")}</th>
                  <th className="py-3.5 px-5">{t("students.table.contact", "Contact Info")}</th>
                  <th className="py-3.5 px-5">{t("students.table.center", "Learning Center")}</th>
                  <th className="py-3.5 px-5">{t("students.table.address", "Location / Address")}</th>
                  <th className="py-3.5 px-5">{t("students.table.dob", "Date of Birth")}</th>
                  <th className="py-3.5 px-5 text-right">{t("students.table.actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {studentsList.map((student: IStudent) => (
                  <StudentItem
                    key={student.id}
                    student={student}
                    centerNameFromApi={centerData?.name}
                    onEdit={(s) => setEditingStudent(s)}
                    onDelete={(s) => setDeletingStudent(s)}
                    formatPhone={formatPhoneView}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BO'SH HOLAT */}
      {!isLoading && !isError && studentsList?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center min-h-[380px]">
          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4 shadow-xs">
            <User className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {t("students.emptyTitle", "Talabalar topilmadi")}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            {t("students.emptySubtitle", "Hozircha tizimda hech qanday talaba ma'lumotlari kiritilmagan.")}
          </p>

          <button
            onClick={() => setIsOpenAddModal(true)}
            className="mt-4 inline-flex items-center gap-2 h-9 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> {t("students.addBtnShort", "Student qo'shish")}
          </button>
        </div>
      )}

      {/* MODALLAR */}
      {isOpenAddModal && (
        <AddStudentModal onClose={() => setIsOpenAddModal(false)} />
      )}

      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {deletingStudent && (
        <DeleteStudentModal
          studentName={deletingStudent.full_name}
          isPending={isDeletePending}
          onConfirm={() => deleteStudent(deletingStudent.id)}
          onClose={() => setDeletingStudent(null)}
        />
      )}
    </div>
  );
}