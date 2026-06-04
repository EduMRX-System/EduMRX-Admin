"use client";

import AttendanceOverview from "@/components/sections/dashboard/DashboardChart";
import Text from "@/components/ui/Text";
import { API } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Users, LayoutGrid, DollarSign, Activity, ArrowUpRight, TrendingUp } from "lucide-react";
import Title from "@/components/ui/Title";
import { useTranslation } from "react-i18next";

export default function DashboardSection() {
    const { t } = useTranslation();

    const { data: dashboard } = useQuery({
        queryFn: async () => {
            const res = await API.get("api/v1/super-admin/dashboard/");
            return res?.data;
        },
        queryKey: ["dashboard"]
    });

    const status = [
        {
            id: 1,
            icon: <Users className="w-5 h-5 text-indigo-600" />,
            label: t("dashboard.total_students"),
            degree: dashboard?.students?.total_active ?? 0,
            color: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900 text-indigo-600",
            hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700",
            path: "/students",
            extraData: [
                { key: t("dashboard.active_students"), value: dashboard?.students?.total_active ?? 0 },
                { key: t("dashboard.new_this_month"), value: "+28" },
                { key: t("dashboard.trial_lessons"), value: "14" }
            ]
        },
        {
            id: 2,
            icon: <LayoutGrid className="w-5 h-5 text-emerald-600" />,
            label: t("dashboard.active_groups"),
            degree: dashboard?.groups?.active ?? 0,
            color: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900 text-emerald-600",
            hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
            path: "/",
            extraData: [
                { key: t("dashboard.general_groups"), value: dashboard?.groups?.active ?? 0 },
                { key: t("dashboard.bootcamp"), value: "4" },
                { key: t("dashboard.evening_slots"), value: "8" }
            ]
        },
        {
            id: 3,
            icon: <DollarSign className="w-5 h-5 text-amber-600" />,
            label: t("dashboard.monthly_income"),
            degree: dashboard?.finance?.monthly_income
                ? `${Number(dashboard.finance.monthly_income).toLocaleString("uz-UZ")} UZS`
                : "0 UZS",
            color: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900 text-amber-600",
            hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
            path: "/financial",
            extraData: [
                { key: t("dashboard.paid_payme"), value: "45%" },
                { key: t("dashboard.paid_cash"), value: "55%" },
                { key: t("dashboard.debts"), value: "12.4M" }
            ]
        },
        {
            id: 4,
            icon: <Activity className="w-5 h-5 text-rose-600" />,
            label: t("dashboard.attendance_rate"),
            degree: dashboard?.attendance?.present_count
                ? `${dashboard.attendance.present_count}%`
                : "0%",
            color: "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900 text-rose-600",
            hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700",
            path: "//",
            extraData: [
                { key: t("dashboard.present"), value: "92%" },
                { key: t("dashboard.absent"), value: "5%" },
                { key: t("dashboard.with_reason"), value: "3%" }
            ]
        },
    ];

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Title text={t("dashboard.title")} />
                    <div className="mt-1">
                        <Text text={t("dashboard.desc")} />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-3 py-1.5 rounded-xl self-start sm:self-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{t("dashboard.live_mode")}</span>
                </div>
            </div>

            {/* Statistika Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {status.map((item) => (
                    <Link
                        href={item.path}
                        key={item.id}
                        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 block group relative h-[140px] ${item.hoverBorder}`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shadow-xs ${item.color}`}>
                                {item.icon}
                            </div>
                            <span className="text-[11px] text-slate-400 font-bold flex items-center gap-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {t("dashboard.view")}
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                        </div>

                        <div className="space-y-0.5">
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                                {item.label}
                            </p>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
                                {item.degree}
                            </h2>
                        </div>

                        {/* Hover tooltip */}
                        <div className="absolute left-0 right-0 top-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-t-0 p-4 rounded-b-2xl opacity-0 -translate-y-2 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-50 shadow-xl">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest border-t border-slate-100 dark:border-slate-800 pt-2">
                                {t("dashboard.extended_data")}
                            </p>
                            <div className="space-y-1.5 text-xs">
                                {item.extraData.map((row, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-0.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                                        <span className="text-slate-500 dark:text-slate-400 font-medium">{row.key}</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Grafik */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">
                <div className="lg:col-span-2">
                    <AttendanceOverview />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {t("dashboard.quick_monitoring")}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mb-5">
                            {t("dashboard.active_lessons")}
                        </p>

                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-between hover:bg-slate-100/70 dark:hover:bg-slate-700 transition-colors">
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    {t("dashboard.new_students")}
                                </span>
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-2 py-0.5 rounded-md">
                                    +24
                                </span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-between hover:bg-slate-100/70 dark:hover:bg-slate-700 transition-colors">
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    {t("dashboard.group_capacity")}
                                </span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-2 py-0.5 rounded-md">
                                    84%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            {t("dashboard.realtime_note")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}