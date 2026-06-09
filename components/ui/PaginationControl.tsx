// PaginationControl.tsx
"use client";

import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PaginationProps {
    totalCount: number;
    page: number;
    totalPages: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
}

export default function PaginationControl({
    totalCount,
    page,
    totalPages,
    pageSize,
    setPage,
    setPageSize,
}: PaginationProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">

            {/* Chap tomon: info + page size */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t("pagination.total_prefix")}{" "}
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{totalCount}</span>{" "}
                    {t("pagination.total_suffix")}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                        {t("pagination.show")}
                    </span>
                    <select
                        value={pageSize}
                        onChange={(e) => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                        }}
                        className="text-[13px] border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 outline-none text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 cursor-pointer hover:border-indigo-400 focus:border-indigo-500 transition-all appearance-none pr-8"
                        style={{
                            backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "1.25em",
                        }}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={30}>30</option>
                    </select>
                </div>
            </div>

            {/* O'ng tomon: sahifalar */}
            <ReactPaginate
                previousLabel={<ChevronLeft className="w-4 h-4" />}
                nextLabel={<ChevronRight className="w-4 h-4" />}
                breakLabel={"..."}
                pageCount={totalPages}
                marginPagesDisplayed={1}
                pageRangeDisplayed={3}
                onPageChange={(selectedItem) => setPage(selectedItem.selected + 1)}
                forcePage={page - 1}
                containerClassName={"flex items-center gap-1"}
                pageClassName={"border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"}
                pageLinkClassName={"w-9 h-9 flex items-center justify-center text-sm text-slate-700 dark:text-slate-300"}
                activeClassName={"!bg-indigo-600 !border-indigo-600"}
                activeLinkClassName={"!text-white"}
                previousClassName={"w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"}
                nextClassName={"w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"}
                breakClassName={"px-2 text-slate-400 dark:text-slate-500"}
                disabledClassName={"opacity-50 cursor-not-allowed"}
            />
        </div>
    );
}