"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/services/api";
import { ILearningCenter } from "@/types";
import { LayoutGrid, List, Plus, AlertCircle, Building2, Search, X } from "lucide-react";
import AddLearningCenterModal from "@/components/sections/learningCenter/addLearningCenterModal";
import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";
import CenterItem from "@/components/sections/learningCenter/CenterItem";
import DeleteLearningCenterModal from "@/components/sections/learningCenter/DeleteLearningCenterModal";
import EditLearningCenterModal from "@/components/sections/learningCenter/EditLearningCenterModal";
import PaginationControl from "@/components/ui/PaginationControl";
import { t } from "i18next";
import LearningCenterSikleton from "@/components/sections/learningCenter/LearningCenterSikleton";
import LearningCenterGridSikleton from "@/components/sections/learningCenter/LearningCenterGridSikleton";

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
            const res = await API.get(`super-admin/centers/?page=${page}&page_size=${pageSize}&search=${debouncedSearch}`);
            return res?.data;
        },
        enabled: debouncedSearch.trim().length > 0 || debouncedSearch === ""
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            const cleaned = search.trim();
            setDebouncedSearch(cleaned === "" ? "" : search);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const centersList = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const dummySkeletons = Array.from({ length: pageSize });

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
                    <Title text={t("centers.title")} />
                    <Text text={t("centers.desc")} />
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-md cursor-pointer transition-all ${viewMode === "list"
                                ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-xs"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                                }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-1.5 rounded-md cursor-pointer transition-all ${viewMode === "grid"
                                ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-xs"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> {t("centers.add")}
                    </button>
                </div>
            </div>

            {/* QIDIRUV */}
            <div className="relative w-full sm:w-64">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("centers.search_placeholder")}
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

            {/* ERROR */}
            {isError && (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/40 text-center transition-colors">
                    <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
                    <h3 className="text-base font-semibold text-red-900 dark:text-red-400">
                        {t("centers.error_title")}
                    </h3>
                    <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                        {(error as any)?.message || t("centers.error_desc")}
                    </p>
                </div>
            )}

            {/* BO'SH HOLAT */}
            {!isLoading && !isError && centersList.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center min-h-95 transition-colors">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-xs">
                        <Building2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {t("centers.empty")}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                        {t("centers.empty_desc")}
                    </p>
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="mt-4 inline-flex items-center gap-2 h-9 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                    >
                        <Plus className="w-3.5 h-3.5" /> {t("centers.add")}
                    </button>
                </div>
            )}

            {/* SKELETON YOKI HAQIQIY MA'LUMOTLAR JADVALI */}
            {(isLoading || (!isError && centersList.length > 0)) && (
                <div className={`${viewMode === "list" ? "bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors" : ""}`}>
                    {viewMode === "list" ? (
                        /* ================== TABLE (LIST) SKELETON & DATA ================== */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                                        <th className="py-3 px-5">{t("centers.col_details")}</th>
                                        <th className="py-3 px-5">{t("centers.col_contact")}</th>
                                        <th className="py-3 px-5">{t("centers.col_location")}</th>
                                        <th className="py-3 px-5">{t("centers.col_status")}</th>
                                        <th className="py-3 px-5">{t("centers.col_subscription")}</th>
                                        <th className="py-3 px-5 text-right">{t("directors.col_actions")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                                    {isLoading ? (
                                        dummySkeletons.map((_, i) => (
                                            <LearningCenterSikleton key={i} />
                                        ))
                                    ) : (
                                        centersList.map((center: ILearningCenter) => (
                                            <CenterItem
                                                key={center.id}
                                                center={center}
                                                viewMode="list"
                                                onEdit={(c: any) => setEditTarget(c)}
                                                onDelete={(id: string, name: string) => setDeleteTarget({ id, name })}
                                                formatPhone={formatPhoneView}
                                                getSubscriptionCls={getSubscriptionStatus}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* ================== GRID CARD SKELETON & DATA ================== */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {isLoading ? (
                                dummySkeletons.map((_, i) => (
                                    <LearningCenterGridSikleton key={i} />
                                ))
                            ) : (
                                centersList.map((center: ILearningCenter) => (
                                    <CenterItem
                                        key={center.id}
                                        center={center}
                                        viewMode="grid"
                                        onEdit={(c: any) => setEditTarget(c)}
                                        onDelete={(id: string, name: string) => setDeleteTarget({ id, name })}
                                        formatPhone={formatPhoneView}
                                        getSubscriptionCls={getSubscriptionStatus}
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {/* PAGINATION CONTROL (Har doim to'g'ri blokda ko'rinadi) */}
                    <div className={`p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 ${viewMode === "grid" ? "rounded-xl border shadow-xs mt-6" : ""}`}>
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
            {isAddOpen && <AddLearningCenterModal onClose={() => setIsAddOpen(false)} />}
            {editTarget && <EditLearningCenterModal center={editTarget} onClose={() => setEditTarget(null)} />}
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