"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/services/api";
import { Plus, AlertCircle, User, Search, List, LayoutGrid } from "lucide-react";
import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";
import PaginationControl from "@/components/ui/PaginationControl";
import DirectorItem from "@/components/sections/director/DirectorItem";
import AddDirectorModal from "@/components/sections/director/addDirectorModal";
import EditDirectorModal from "@/components/sections/director/EditDirectorModal";
import DeleteDirectorModal from "@/components/sections/director/DeleteDirectorModal";
import { IAPIResponse, IDirector } from "@/types";
import { t } from "i18next";
import DirectorSkeleton from "@/components/sections/director/DirectorSkeleton";

export default function DirectorsList() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<IDirector | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            const cleaned = search.trim();
            setDebouncedSearch(cleaned === "" ? "" : search);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const { data, isLoading, isError } = useQuery<IAPIResponse<IDirector[]>>({
        queryKey: ["directors", page, pageSize, debouncedSearch],
        queryFn: async () => {
            const res = await API.get(`super-admin/directors/?page=${page}&page_size=${pageSize}&search=${debouncedSearch}`);
            return res?.data;
        },
        enabled: debouncedSearch.trim().length > 0 || debouncedSearch === ""
    });

    const directors = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const dummySkeletons = Array.from({ length: pageSize });

    const formatPhoneView = (phone: string) => {
        const clean = phone?.replace(/\D/g, "") || "";
        if (clean.length === 12) {
            return `+998 (${clean.slice(3, 5)}) ${clean.slice(5, 8)}-${clean.slice(8, 10)}-${clean.slice(10)}`;
        }
        return phone ? `+${phone}` : "—";
    };

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <Title text={t("directors.title")} />
                    <Text text={t("directors.desc")} />
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                    {/* LIST VA GRID REJIMINI ALMASHTIRGICH TUGMALAR */}
                    <div className="flex items-center gap-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl shadow-xs">
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === "list"
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                }`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`p-2 rounded-lg transition-all cursor-pointer ${viewMode === "grid"
                                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                }`}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> {t("directors.add")}
                    </button>
                </div>
            </div>

            {/* QIDIRUV VA FILTR QISMI */}
            <div className="relative">
                <input
                    type="text"
                    placeholder={t("common.search")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 pl-9 pr-4 text-sm border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 w-64 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                />
                <Search className="absolute left-2.5 top-3 w-4 h-4 text-slate-400" />
            </div>

            {/* ERROR HOLATI */}
            {isError && (
                <div className="py-20 text-center text-red-500">
                    <AlertCircle className="mx-auto mb-2" /> {t("common.error")}
                </div>
            )}

            {/* BO'SH HOLAT */}
            {!isLoading && !isError && directors.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center transition-colors">
                    <User className="w-10 h-10 text-slate-400 mb-4" />
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {search ? t("common.no_results") : t("directors.empty")}
                    </h3>
                    {search ? (
                        <button
                            onClick={() => setSearch("")}
                            className="text-indigo-600 hover:underline mt-2 text-sm cursor-pointer"
                        >
                            {t("common.clear_search")}
                        </button>
                    ) : (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {t("directors.empty_desc")}
                        </p>
                    )}
                </div>
            )}

            {/* SKELETON YOKI HAQIQIY MA'LUMOTLAR KO'RINISHI */}
            {(isLoading || directors.length > 0) && (
                <div className={`${viewMode === "list" ? "bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors" : ""}`}>
                    {viewMode === "list" ? (
                        /* ================== TABLE (LIST) VIEW ================== */
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase">
                                        <th className="py-3 px-5">{t("directors.col_details")}</th>
                                        <th className="py-3 px-5">{t("directors.col_contact")}</th>
                                        <th className="py-3 px-5">{t("directors.col_created")}</th>
                                        <th className="py-3 px-5 text-right">{t("directors.col_actions")}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                    {isLoading ? (
                                        dummySkeletons.map((_, i) => (
                                            <DirectorSkeleton key={i} viewMode="list" />
                                        ))
                                    ) : (
                                        directors.map((director) => (
                                            <DirectorItem
                                                key={director.id}
                                                director={director}
                                                viewMode="list"
                                                onEdit={(d: any) => setEditTarget(d)}
                                                onDelete={(id, name) => setDeleteTarget({ id, name })}
                                                formatPhone={formatPhoneView}
                                            />
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        /* ================== GRID CARD VIEW ================== */
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {isLoading ? (
                                dummySkeletons.map((_, i) => (
                                    <DirectorSkeleton key={i} viewMode="grid" />
                                ))
                            ) : (
                                directors.map((director) => (
                                    <DirectorItem
                                        key={director.id}
                                        director={director}
                                        viewMode="grid"
                                        onEdit={(d: any) => setEditTarget(d)}
                                        onDelete={(id, name) => setDeleteTarget({ id, name })}
                                        formatPhone={formatPhoneView}
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {/* PAGINATION PANEL (Har doim pastki qismda chiroyli qoladi) */}
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
            {isAddOpen && <AddDirectorModal onClose={() => setIsAddOpen(false)} />}
            {editTarget && <EditDirectorModal director={editTarget} onClose={() => setEditTarget(null)} />}
            {deleteTarget && <DeleteDirectorModal id={deleteTarget.id} name={deleteTarget.name} onClose={() => setDeleteTarget(null)} />}
        </div>
    );
}