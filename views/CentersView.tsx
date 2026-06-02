"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/services/api";
import { ILearningCenter, IAPIResponse } from "@/types";
import { LayoutGrid, List, Plus, Loader2, AlertCircle, Building2, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import AddLearningCenterModal from "@/components/sections/learningCenter/addLearningCenterModal";
import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";
import CenterItem from "@/components/sections/learningCenter/CenterItem";
import DeleteLearningCenterModal from "@/components/sections/learningCenter/DeleteLearningCenterModal";
import EditLearningCenterModal from "@/components/sections/learningCenter/EditLearningCenterModal";
import ReactPaginate from "react-paginate";
import PaginationControl from "@/components/ui/PaginationControl";

export default function LearningCentersList() {
    const [pageSize, setPageSize] = useState(5);
    const [page, setPage] = useState(1);

    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [isAddOpen, setIsAddOpen] = useState(false);

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [editTarget, setEditTarget] = useState<ILearningCenter | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["learning-centers", page, pageSize, debouncedSearch],
        queryFn: async () => {
            const res = await API.get(`/api/v1/super-admin/centers/?page=${page}&page_size=${pageSize}&search=${debouncedSearch}`);
            return res?.data;
        }
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Qidiruv o'zgarganda 1-sahifaga qaytarish
        }, 500);

        return () => clearTimeout(handler); // Har bir yangi harfda eski timerni o'chiradi
    }, [search]);

    const centersList = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const formatPhoneView = (phone: string) => {
        const clean = phone?.replace(/\D/g, "") || "";
        if (clean.length === 12) {
            return `+998 (${clean.slice(3, 5)}) ${clean.slice(5, 8)}-${clean.slice(8, 10)}-${clean.slice(10)}`;
        }
        return phone || "—";
    };

    const getSubscriptionStatus = (dateStr: string) => {
        if (!dateStr) return { text: "Muddatsiz", cls: "bg-slate-50 text-slate-600 border-slate-200" };
        const expireDate = new Date(dateStr);
        const today = new Date();
        const diffDays = Math.ceil((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Muddati o'tgan", cls: "bg-red-50 text-red-700 border-red-200" };
        if (diffDays <= 7) return { text: `${diffDays} kun qoldi`, cls: "bg-amber-50 text-amber-700 border-amber-200" };
        return { text: dateStr, cls: "bg-slate-50 text-slate-600 border-slate-200" };
    };


    return (
        <div className="w-full space-y-6">
            {/* Top Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Title text="Learning Centers" />
                    <Text text="Tizimdagi barcha o'quv markazlarini boshqarish va monitoring qilish." />
                </div>

                {/* Actions Group */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* List / Grid Switcher */}
                    <div className="inline-flex bg-slate-100 p-1 rounded-lg border border-slate-200/60">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-md cursor-pointer transition-all ${viewMode === "list" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-md cursor-pointer transition-all ${viewMode === "grid" ? "bg-white text-indigo-600 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Add Center
                    </button>
                </div>
            </div>


            <div className="relative w-full sm:w-64">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ism, telefon yoki email..."
                    className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-lg outline-none"
                />
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>


            {/* Loading & Error Blocks */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-slate-100 shadow-xs">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm text-slate-500 mt-3 font-medium">O'quv markazlari yuklanmoqda...</p>
                </div>
            )}

            {isError && (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-red-50/50 rounded-xl border border-red-100 text-center">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                    <h3 className="text-base font-semibold text-red-900">Ma'lumotlarni yuklashda xatolik</h3>
                    <p className="text-sm text-red-600 mt-1">{(error as any)?.message || "Backend xatoligi yuz berdi."}</p>
                </div>
            )}


            {isLoading && debouncedSearch && (
                <div className="text-xs text-indigo-600 animate-pulse py-2">
                    Qidirilmoqda...
                </div>
            )}

            {/* Empty State */}
            {!isLoading && !isError && centersList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300 text-center min-h-[380px]">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-xs">
                        <Building2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">O'quv markazlari topilmadi</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">Hozircha hech qanday ma'lumot kiritilmagan.</p>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 h-9 px-4 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> O'quv markazlari qo'shish
                    </button>
                </div>
            )}

            {/* MAIN LIST / GRID RENDERING */}
            {!isLoading && !isError && centersList.length > 0 && (
                <>
                    {viewMode === "list" ? (
                        <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                                            <th className="py-3 px-5">Center Details</th>
                                            <th className="py-3 px-5">Contact</th>
                                            <th className="py-3 px-5">Location & Students</th>
                                            <th className="py-3 px-5">Status</th>
                                            <th className="py-3 px-5">Subscription</th>
                                            <th className="py-3 px-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                        {centersList.map((center: ILearningCenter) => (
                                            <CenterItem
                                                key={center.id}
                                                center={center}
                                                viewMode="list"
                                                onEdit={(c: any) => setEditTarget(c)}
                                                onDelete={(id: string, name: string) => setDeleteTarget({ id, name })}
                                                formatPhone={formatPhoneView}
                                                getSubscriptionCls={getSubscriptionStatus}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {centersList.map((center: ILearningCenter) => (
                                <CenterItem
                                    key={center.id}
                                    center={center}
                                    viewMode="grid"
                                    onEdit={(c: any) => setEditTarget(c)}
                                    onDelete={(id: string, name: string) => setDeleteTarget({ id, name })}
                                    formatPhone={formatPhoneView}
                                    getSubscriptionCls={getSubscriptionStatus}
                                />
                            ))}
                        </div>
                    )}

                    <PaginationControl
                        totalCount={data?.count || 0}
                        page={page}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        setPage={setPage}
                        setPageSize={setPageSize}
                    />
                </>
            )}

            {isAddOpen && <AddLearningCenterModal onClose={() => setIsAddOpen(false)} />}

            {editTarget && (
                <EditLearningCenterModal center={editTarget} onClose={() => setEditTarget(null)} />
            )}

            {deleteTarget && (
                <DeleteLearningCenterModal
                    centerId={deleteTarget.id}
                    centerName={deleteTarget.name}
                    onClose={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
}