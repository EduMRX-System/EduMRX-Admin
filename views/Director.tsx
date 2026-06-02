"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/services/api";
import { Plus, Loader2, AlertCircle, User, Search } from "lucide-react";
import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";
import PaginationControl from "@/components/ui/PaginationControl";
import DirectorItem from "@/components/sections/director/DirectorItem";
import AddDirectorModal from "@/components/sections/director/addDirectorModal";
import EditDirectorModal from "@/components/sections/director/EditDirectorModal";
import DeleteDirectorModal from "@/components/sections/director/DeleteDirectorModal";
import { IAPIResponse, IDirector } from "@/types";

export default function DirectorsList() {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<IDirector | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

    // Search Debounce mexanizmi
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const { data, isLoading, isError, error } = useQuery<IAPIResponse<IDirector[]>>({
        queryKey: ["directors", page, pageSize, debouncedSearch],
        queryFn: async () => {
            const res = await API.get(`/api/v1/super-admin/directors/?page=${page}&page_size=${pageSize}&search=${debouncedSearch}`);
            return res?.data;
        }
    });

    const directors = data?.results || [];
    const totalCount = data?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

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
                    <Title text="Directors Management" />
                    <Text text="Tizimdagi barcha o'quv markazi direktorlarini boshqarish." />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAddOpen(true)}
                        className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Director
                    </button>
                </div>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Qidirish..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-10 pl-9 pr-4 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-500 w-64"
                />
                <Search className="absolute left-2.5 top-3 w-4 h-4 text-slate-400" />
            </div>

            {isLoading && <div className="py-20 text-center"><Loader2 className="w-8 h-8 mx-auto text-indigo-600 animate-spin" /></div>}
            {isError && <div className="py-20 text-center text-red-500"><AlertCircle className="mx-auto mb-2" /> Xatolik yuz berdi.</div>}

            {!isLoading && !isError && directors.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-300 text-center">
                    <User className="w-10 h-10 text-slate-400 mb-4" />
                    <h3 className="text-base font-semibold text-slate-900">
                        {search ? "Natija topilmadi" : "Direktorlar topilmadi"}
                    </h3>
                    {search ? (
                        <button onClick={() => setSearch("")} className="text-indigo-600 hover:underline mt-2">Qidiruvni tozalash</button>
                    ) : (
                        <p className="text-xs text-slate-500 mt-1">Hozircha tizimda direktor mavjud emas.</p>
                    )}
                </div>
            )}

            {directors.length > 0 && (
                <div className="bg-white rounded-xl shadow-xs border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-[11px] font-bold uppercase">
                                    <th className="py-3 px-5">Director Details</th>
                                    <th className="py-3 px-5">Contact</th>
                                    <th className="py-3 px-5">Created At</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {directors.map((director) => (
                                    <DirectorItem
                                        key={director.id}
                                        director={director}
                                        viewMode="list"
                                        onEdit={(d) => setEditTarget(d)}
                                        onDelete={(id, name) => setDeleteTarget({ id, name })}
                                        formatPhone={formatPhoneView}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Control */}
                    <div className="p-4">
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

            {/* Modallar */}
            {isAddOpen && <AddDirectorModal onClose={() => setIsAddOpen(false)} />}
            {editTarget && <EditDirectorModal director={editTarget} onClose={() => setEditTarget(null)} />}
            {deleteTarget && <DeleteDirectorModal id={deleteTarget.id} name={deleteTarget.name} onClose={() => setDeleteTarget(null)} />}
        </div>
    );
}