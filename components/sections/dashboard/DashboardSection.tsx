"use client";

import Text from "@/components/ui/Text";
import Title from "@/components/ui/Title";
import { API } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import {
    Building2,
    Users,
    DollarSign,
    Activity,
    ArrowUpRight,
    TrendingUp,
    Radio,
    BarChart3,
    PieChart as PieIcon,
    LineChart
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

export default function DashboardSection() {
    const { t } = useTranslation();

    const { data: dashboard } = useQuery({
        queryFn: async () => {
            const res = await API.get("api/v1/super-admin/dashboard/");
            return res?.data;
        },
        queryKey: ["super-admin-dashboard"]
    });

    const revenueData = dashboard?.analytics?.revenue_growth || [
        { name: "Jan", mrr: 4000, net: 2800 },
        { name: "Feb", mrr: 7500, net: 5100 },
        { name: "Mar", mrr: 6200, net: 4300 },
        { name: "Apr", mrr: 9800, net: 7200 },
        { name: "May", mrr: 14500, net: 11000 },
        { name: "Jun", mrr: 18450, net: 14200 },
    ];

    const signupsData = dashboard?.analytics?.center_signups || [
        { name: "Jan", centers: 8 },
        { name: "Feb", centers: 15 },
        { name: "Mar", centers: 12 },
        { name: "Apr", centers: 22 },
        { name: "May", centers: 30 },
        { name: "Jun", centers: 26 },
    ];

    const planDistribution = dashboard?.analytics?.plan_distribution || [
        { name: "Basic", value: 45, color: "#94A3B8" },
        { name: "Pro", value: 72, color: "#4F46E5" },
        { name: "Enterprise", value: 25, color: "#0EA5E9" }
    ];

    const status = [
        {
            id: 1,
            icon: <Building2 className="w-5 h-5 text-indigo-600" />,
            label: t("dashboard.super_admin.total_centers"),
            degree: dashboard?.centers?.total ?? 0,
            color: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-900 text-indigo-600",
            hoverBorder: "hover:border-indigo-300 dark:hover:border-indigo-700",
            path: "/centers",
            extraData: [
                { key: t("dashboard.super_admin.active_centers"), value: dashboard?.centers?.active ?? 0 },
                { key: t("dashboard.super_admin.new_this_month"), value: "+12" },
                { key: t("dashboard.super_admin.demo_requests"), value: "8" }
            ]
        },
        {
            id: 2,
            icon: <Users className="w-5 h-5 text-emerald-600" />,
            label: t("dashboard.super_admin.total_saas_users"),
            degree: dashboard?.users?.total_active ?? 0,
            color: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900 text-emerald-600",
            hoverBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
            path: "/users",
            extraData: [
                { key: t("dashboard.super_admin.total_students"), value: dashboard?.users?.students ?? 0 },
                { key: t("dashboard.super_admin.total_teachers"), value: dashboard?.users?.teachers ?? 0 },
                { key: t("dashboard.super_admin.system_admins"), value: dashboard?.users?.admins ?? 0 }
            ]
        },
        {
            id: 3,
            icon: <DollarSign className="w-5 h-5 text-amber-600" />,
            label: t("dashboard.super_admin.mrr_title"),
            degree: dashboard?.finance?.mrr
                ? `${Number(dashboard.finance.mrr).toLocaleString("uz-UZ")} UZS`
                : "0 UZS",
            color: "bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900 text-amber-600",
            hoverBorder: "hover:border-amber-300 dark:hover:border-amber-700",
            path: "/billing",
            extraData: [
                { key: t("dashboard.super_admin.paid_via_click"), value: "60%" },
                { key: t("dashboard.super_admin.paid_via_payme"), value: "40%" },
                { key: t("dashboard.super_admin.pending_invoices"), value: "3" }
            ]
        },
        {
            id: 4,
            icon: <Activity className="w-5 h-5 text-rose-600" />,
            label: t("dashboard.super_admin.system_health"),
            degree: dashboard?.system?.status ?? "100%",
            color: "bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900 text-rose-600",
            hoverBorder: "hover:border-rose-300 dark:hover:border-rose-700",
            path: "/system-status",
            extraData: [
                { key: t("dashboard.super_admin.api_gateway"), value: "99.9%" },
                { key: t("dashboard.super_admin.sms_service"), value: "Online" },
                { key: t("dashboard.super_admin.db_cluster"), value: "Healthy" }
            ]
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Title text={t("dashboard.super_admin.super_title")} />
                    <div className="mt-1">
                        <Text text={t("dashboard.super_admin.super_desc")} />
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-3 py-1.5 rounded-xl self-start sm:self-center">
                    <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                    <span>{t("dashboard.super_admin.live_mode")}</span>
                </div>
            </div>

            {/* Statistika Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-30">
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
                                {t("dashboard.super_admin.view")}
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </span>
                        </div>

                        <div className="space-y-0.5">
                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                                {item.label}
                            </p>
                            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight truncate">
                                {item.degree}
                            </h2>
                        </div>

                        {/* Hover Tooltip */}
                        <div className="absolute left-0 right-0 top-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-t-0 p-4 rounded-b-2xl opacity-0 -translate-y-2 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-50 shadow-xl">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-widest border-t border-slate-100 dark:border-slate-800 pt-2">
                                {t("dashboard.super_admin.extended_data")}
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

            {/* CHARTS MULTI-GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-0">

                {/* 1. CHART: AreaChart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between h-[360px]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <LineChart className="w-4 h-4 text-indigo-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {t("dashboard.super_admin.charts.mrr_analytics")}
                            </h3>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-400">{t("dashboard.super_admin.charts.mrr_sub")}</span>
                    </div>

                    <div className="w-full h-full min-h-[240px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="100%">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94A3B8" fontSize={11} />
                                <YAxis tickLine={false} axisLine={false} stroke="#94A3B8" fontSize={11} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="mrr" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#mrrGrad)" name={t("dashboard.super_admin.charts.total_revenue")} />
                                <Area type="monotone" dataKey="net" stroke="#0EA5E9" strokeWidth={1.5} fill="none" name={t("dashboard.super_admin.charts.net_profit")} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. CHART: PieChart */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between h-[360px]">
                    <div className="flex items-center gap-2 mb-1">
                        <PieIcon className="w-4 h-4 text-emerald-500" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                            {t("dashboard.super_admin.charts.plans")}
                        </h3>
                    </div>

                    <div className="w-full h-48 relative flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={planDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {planDistribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium border-t border-slate-100 dark:border-slate-800 pt-3">
                        {planDistribution.map((item: any, idx: number) => (
                            <div key={idx} className="flex flex-col items-center">
                                <span className="w-2 h-2 rounded-full mb-1" style={{ backgroundColor: item.color }} />
                                <span className="text-slate-400 truncate w-full">{item.name}</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{item.value} {t("dashboard.super_admin.charts.unit_centers")}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. CHART: BarChart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between h-[340px]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-amber-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                {t("dashboard.super_admin.charts.signups")}
                            </h3>
                        </div>
                        <span className="text-[11px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md">+24% MoM</span>
                    </div>

                    <div className="w-full h-full min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={signupsData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} stroke="#94A3B8" fontSize={11} />
                                <YAxis tickLine={false} axisLine={false} stroke="#94A3B8" fontSize={11} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '12px', fontSize: '12px' }} />
                                <Bar dataKey="centers" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={32} name={t("dashboard.super_admin.charts.bar_name")} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. PANEL: Live Monitoring */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between h-[340px]">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-rose-500 animate-pulse" />
                            {t("dashboard.super_admin.quick_logs")}
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-5">
                            {t("dashboard.super_admin.quick_logs_desc")}
                        </p>

                        <div className="space-y-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t("dashboard.super_admin.gateway_traffic")}</span>
                                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">1,240 req/m</span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t("dashboard.super_admin.db_locks")}</span>
                                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">0 / Clear</span>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t("dashboard.super_admin.memory_usage")}</span>
                                <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">42.8%</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            {t("dashboard.super_admin.realtime_note")}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}