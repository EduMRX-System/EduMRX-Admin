"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { API } from "@/services/api";
import { AlertCircle, User, Plus, Search, X } from "lucide-react";
import { toast } from "react-toastify";

import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";
import StudentItem from "@/components/sections/sudents/StudentItem";
import AddStudentModal from "@/components/sections/sudents/AddStudentModal";
import EditStudentModal from "@/components/sections/sudents/EditStudentModal";
import DeleteStudentModal from "@/components/sections/sudents/DeleteStudentModal";
import PaginationControl from "@/components/ui/PaginationControl";
import { IStudent } from "@/types";

interface IStudentsResponse {
  results?: IStudent[];
  data?: IStudent[];
  count?: number;
}

export default function StudentsView() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Pagination states
  const [pageSize, setPageSize] = useState(5);
  const [page, setPage] = useState(1);

  // Search states
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modals states
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<IStudent | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      const cleaned = search.trim();
      setDebouncedSearch(cleaned === "" ? "" : search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Talabalarni yuklash
  const { data: studentsData, isLoading, isError, error } = useQuery({
    queryKey: ["students-list", page, pageSize, debouncedSearch],
    queryFn: async () => {
      const res = await API.get<IStudentsResponse>(
        `students/?page=${page}&page_size=${pageSize}&search=${debouncedSearch}`
      );
      return res?.data;
    },
    enabled: debouncedSearch.trim().length > 0 || debouncedSearch === ""
  });

  // Data mapping
  const studentsList = Array.isArray(studentsData)
    ? studentsData
    : studentsData?.results || studentsData?.data || [];

  const totalCount = (studentsData as any)?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Belgingalgan qatorlar soniga mos skeleton massivi
  const dummySkeletons = Array.from({ length: pageSize });

  // O'chirish mutationi
  const { mutate: deleteStudent, isPending: isDeletePending } = useMutation({
    mutationFn: async (id: string) => {
      await API.delete(`students/${id}/`);
    },
    onSuccess: () => {
      toast.success(t("students.deleteSuccess", "Talaba muvaffaqiyatli o'chirildi"));
      queryClient.invalidateQueries({
        queryKey: ["students-list"],
      });
      setDeletingStudent(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || t("students.deleteError", "O'chirishda xatolik yuz berdi"));
    }
  });

  const formatPhoneView = (phone: string) => {
    const clean = phone?.replace(/\D/g, "") || "";
    if (clean.length === 12) {
      return `+998 (${clean.slice(3, 5)}) ${clean.slice(5, 8)}-${clean.slice(8, 10)}-${clean.slice(10)}`;
    }
    return phone || "—";
  };

  return (
    <div className="w-full text-slate-900 dark:text-slate-100 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title text={t("students.title", "Students")} />
          <Text text={t("students.subtitle", "Manage and track student enrollment, performance, and status.")} />
        </div>
        <button
          onClick={() => setIsOpenAddModal(true)}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 self-end sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t("students.addBtn", "Add Student")}</span>
        </button>
      </div>

      {/* QIDIRUV INPUTI */}
      <div className="relative w-full sm:w-64">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("students.search_placeholder", "Talabalarni qidirish...")}
          className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
        />
        <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>


      {/* ERROR STATE */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/50 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400 mb-3" />
          <h3 className="text-base font-semibold text-red-900 dark:text-red-400">
            {t("students.errorTitle", "Ma'lumotlarni yuklashda xatolik")}
          </h3>
          <p className="text-sm text-red-600 dark:text-red-300 mt-1 max-w-md">{(error as any)?.message}</p>
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

      {/* JADVAL SKELETON VA HAQIQIY MA'LUMOTLAR */}
      {(isLoading || (!isError && studentsList.length > 0)) && (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-5">{t("students.table.name", "Student Name")}</th>
                  <th className="py-3.5 px-5">{t("students.table.contact", "Contact Info")}</th>
                  <th className="py-3.5 px-5">{t("students.table.center", "Learning Center")}</th>
                  <th className="py-3.5 px-5">{t("students.table.dob", "Date of Birth")}</th>
                  <th className="py-3.5 px-5 text-right">{t("students.table.actions", "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                {isLoading ? (
                  dummySkeletons.map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {/* Name Skeleton */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-200 dark:bg-slate-800 rounded-full" />
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-32" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-16" />
                          </div>
                        </div>
                      </td>
                      {/* Contact Skeleton */}
                      <td className="py-4 px-5">
                        <div className="space-y-2">
                          <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm w-28" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-24" />
                        </div>
                      </td>
                      {/* Center Skeleton */}
                      <td className="py-4 px-5">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-28" />
                      </td>
                      {/* DOB Skeleton */}
                      <td className="py-4 px-5">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-20" />
                      </td>
                      {/* Actions Skeleton */}
                      <td className="py-4 px-5 text-right">
                        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-16 inline-block" />
                      </td>
                    </tr>
                  ))
                ) : (
                  studentsList.map((student: IStudent) => (
                    <StudentItem
                      key={student.id}
                      student={student}
                      onEdit={(s) => setEditingStudent(s)}
                      onDelete={(s) => setDeletingStudent(s)}
                      formatPhone={formatPhoneView}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROL CONTAINER */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <PaginationControl
              totalCount={totalCount}
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          </div>
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