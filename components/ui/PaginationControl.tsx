"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
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
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const options = [5, 10, 30];

    // Select ro'yxatidan tashqariga bosilganda uni yopish logikasi
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 select-none">

            {/* Chap tomon: Umumiylik info + Custom Page Size Dropdown */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {t("pagination.total_prefix")}{" "}
                    <span className="font-bold text-slate-900 dark:text-slate-100">{totalCount}</span>{" "}
                    {t("pagination.total_suffix")}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold">
                        {t("pagination.show")}
                    </span>

                    {/* CUSTOM SELECT DROPDOWN START */}
                    <div className="relative inline-block text-left" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="flex items-center gap-2 text-[13px] font-bold border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 outline-none text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all shadow-2xs"
                        >
                            <span>{pageSize}</span>
                            <ChevronDown
                                className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180 text-indigo-500 dark:text-indigo-400" : ""
                                    }`}
                            />
                        </button>

                        {isOpen && (
                            <div className="absolute bottom-full left-0 mb-1.5 w-20 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-lg dark:shadow-slate-950/40 py-1 z-50 animate-in fade-in slide-in-from-bottom-1 duration-150">
                                {options.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => {
                                            setPageSize(option);
                                            setPage(1);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors flex items-center justify-between cursor-pointer ${option === pageSize
                                            ? "bg-indigo-50/60 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                                            }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* CUSTOM SELECT DROPDOWN END */}
                </div>
            </div>

            {/* O'ng tomon: Sahifalar navigatsiyasi */}
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
                pageClassName={"border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"}
                pageLinkClassName={"w-9 h-9 flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-300"}
                activeClassName={"!bg-indigo-600 !border-indigo-600 dark:!bg-indigo-500 dark:!border-indigo-500"}
                activeLinkClassName={"!text-white"}
                previousClassName={"w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"}
                nextClassName={"w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"}
                breakClassName={"px-2 text-slate-400 dark:text-slate-500 font-bold"}
                disabledClassName={"opacity-40 cursor-not-allowed pointer-events-none"}
            />
        </div>
    );
}