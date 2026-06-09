"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Building2, Users, DollarSign, CreditCard, AlertCircle,
  ArrowUpRight, ArrowDownRight, TrendingUp, Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/services/api";
import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";

interface DashboardData {
  kpi: {
    centers: { active: number; total: number };
    students: { new_this_month: number; total: number };
    revenue: { total_this_month: number; percentage_change: number; is_up: boolean };
    subscriptions: { trial: number; pro: number; enterprise: number; total: number };
    tickets: { open: number };
  };
  charts: {
    revenue_12m: { month: string; amount: number }[];
    student_growth: { month: string; count: number }[];
    center_distribution: { name: string; value: number; color: string }[];
    top_centers: { id: string; name: string; students: number; percentage: number }[];
  };
  recent_activities: {
    id: string;
    center_name: string;
    created_at: string;
    status: string;
  }[];
}

function formatUZS(val: number) {
  if (val === 0) return "0";
  if (!val) return "0";
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} mlrd`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} mln`;
  return val.toLocaleString("uz-UZ");
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("uz-UZ", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function StatSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800" />
        <div className="w-12 h-4 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="w-24 h-3 rounded bg-slate-100 dark:bg-slate-800 mb-2" />
      <div className="w-32 h-6 rounded bg-slate-100 dark:bg-slate-800 mb-2" />
      <div className="w-20 h-3 rounded bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await API.get<any>("/super-admin/dashboard/");
      return res?.data?.data;
    },
  });

  const kpi = data?.kpi;
  const charts = data?.charts;
  const recentActivities = data?.recent_activities ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6 pb-10 max-w-[1600px] mx-auto px-4 sm:px-6 mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[...Array(5)].map((_, i) => <StatSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[310px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 animate-pulse" />
          <div className="h-[310px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 animate-pulse" />
        </div>
      </div>
    );
  }

  // Jami o'quvchilar soni top_centers dagi foizlarni xavfsiz hisoblash uchun kerak
  const totalStudentsCount = kpi?.students?.total ?? 1;

  // Stats Configuration
  const stats = [
    {
      icon: <Building2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
      label: t("dashboard.kpi.total_centers", "Jami Markazlar"),
      value: kpi?.centers ? `${kpi.centers.active} / ${kpi.centers.total}` : "—",
      sub: t("dashboard.kpi.active_total", "Faol / Jami tizimlar"),
      color: "bg-purple-50 border-purple-100/70 dark:bg-purple-950/30 dark:border-purple-900/50",
      trend: null,
    },
    {
      icon: <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      label: t("dashboard.kpi.total_students", "Jami O'quvchilar"),
      value: kpi?.students ? kpi.students.total.toLocaleString() : "—",
      sub: kpi?.students ? `+${kpi.students.new_this_month} ${t("dashboard.kpi.new_this_month", "bu oy yangi")}` : "—",
      color: "bg-emerald-50 border-emerald-100/70 dark:bg-emerald-950/30 dark:border-emerald-900/50",
      trend: kpi?.students?.new_this_month ? {
        value: `+${kpi.students.new_this_month}`,
        positive: true,
      } : null,
    },
    {
      icon: <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      label: t("dashboard.kpi.total_revenue", "Oylik Daromad"),
      value: kpi?.revenue ? `${formatUZS(kpi.revenue.total_this_month)} UZS` : "—",
      sub: t("dashboard.kpi.vs_last_month", "o'tgan oyga nisbatan"),
      color: "bg-amber-50 border-amber-100/70 dark:bg-amber-950/30 dark:border-amber-900/50",
      trend: kpi?.revenue && kpi.revenue.percentage_change > 0 ? {
        value: `${kpi.revenue.is_up ? "+" : ""}${kpi.revenue.percentage_change}%`,
        positive: kpi.revenue.is_up,
      } : null,
    },
    {
      icon: <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />,
      label: t("dashboard.kpi.active_subs", "Obunalar (Tarif)"),
      value: kpi?.subscriptions ? `${kpi.subscriptions.total} ta` : "—",
      sub: kpi?.subscriptions ? `Trial: ${kpi.subscriptions.trial} | Pro: ${kpi.subscriptions.pro}` : "—",
      color: "bg-blue-50 border-blue-100/70 dark:bg-blue-950/30 dark:border-blue-900/50",
      trend: null,
    },
    {
      icon: <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />,
      label: t("dashboard.kpi.tickets", "Ochiq Tiketlar"),
      value: kpi?.tickets ? `${kpi.tickets.open} ta` : "—",
      sub: t("dashboard.kpi.open_tickets", "Texnik qo'llab-quvvatlash"),
      color: "bg-red-50 border-red-100/70 dark:bg-red-950/30 dark:border-red-900/50",
      trend: null,
    },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto px-4 sm:px-6 mt-4 pb-10">

      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
        <div>
          <Title text={t("dashboard.title", "Tizim Tahlili")} />
          <Text text={t("dashboard.desc", "EduMRX SaaS platformasining umumiy live ko'rsatkichlari")} />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 px-3 py-1.5 rounded-xl self-start sm:self-center backdrop-blur-xs">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t("dashboard.live_mode", "Live Rejim")}</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${item.color}`}>
                {item.icon}
              </div>
              {item.trend && (
                <span
                  className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.trend.positive
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40"
                    : "bg-red-50/60 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/40"
                    }`}
                >
                  {item.trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {item.trend.value}
                </span>
              )}
            </div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
              {item.label}
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
              {item.value}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium truncate">
              {item.sub}
            </p>
          </div>
        ))}
      </div>

      {/* Main Charts Panel (Line & Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Revenue 12 Months Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t("dashboard.charts.revenue_title", "Daromad Dinamikasi (12 oy)")}
            </h4>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.revenue_12m ?? []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.06} />
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, 'auto']}
                  tickFormatter={(v) => `${v >= 1_000_000 ? (v / 1_000_000).toFixed(0) + "M" : v}`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600 }}
                  itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}
                  formatter={(value) => [
                    value ? `${Number(value).toLocaleString()} UZS` : "0 UZS",
                    t("dashboard.kpi.total_revenue", "Daromad")
                  ]} />
                <Line type="monotone" dataKey="amount" stroke="#A855F7" strokeWidth={2.5} dot={{ r: 2, strokeWidth: 1 }} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Growth Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {t("dashboard.charts.student_growth_title", "O'quvchilar soni (Oylar bo'yicha)")}
            </h4>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.student_growth ?? []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.06} />
                <XAxis dataKey="month" tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderRadius: "12px", border: "none" }}
                  labelStyle={{ color: "#94a3b8", fontSize: "11px", fontWeight: 600 }}
                  itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: 700 }}
                  formatter={(value) => [value, t("dashboard.kpi.total_students", "O'quvchilar")]}
                />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Secondary Analytics Panel (Pie Chart & Progress Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Center Distribution Donut Chart */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              {t("dashboard.charts.distribution_title", "Tariflar Taqsimoti")}
            </h4>
            <div className="h-[160px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.center_distribution ?? []}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={72}
                    paddingAngle={4} dataKey="value"
                  >
                    {(charts?.center_distribution ?? []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || "#4F46E5"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", border: "none", color: "#fff", fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 mt-2 pt-3 border-t border-slate-50 dark:border-slate-800/40">
            {(charts?.center_distribution ?? []).map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full block shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-700 dark:text-slate-300">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Active Centers Table */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 lg:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
            {t("dashboard.charts.top_centers_title", "O'quvchilar Ulushi Bo'yicha Markazlar")}
          </h4>
          <div className="overflow-x-auto max-h-[225px] overflow-y-auto pr-1">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/60 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">{t("dashboard.table.center_name", "Markaz nomi")}</th>
                  <th className="py-2.5 px-4 text-center">{t("dashboard.table.students_count", "O'quvchilar")}</th>
                  <th className="py-2.5 px-4 w-1/2">{t("dashboard.table.activity", "Ulush darajasi")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-600 dark:text-slate-300">
                {(charts?.top_centers ?? []).map((center) => {
                  // Backend ulushni noto'g'ri berganda ham xavfsiz foiz hisoblash
                  const calculatedPercentage = Math.min(Math.round((center.students / totalStudentsCount) * 100), 100);

                  return (
                    <tr key={center.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{center.name}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-200 text-center">{center.students}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-500"
                              style={{ width: `${calculatedPercentage}%` }}
                            />
                          </div>
                          <span className="font-bold text-[11px] text-slate-700 dark:text-slate-300 min-w-[32px] text-right">
                            {calculatedPercentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Recent Registered Centers */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t("dashboard.recent.title", "Oxirgi Ro'yxatdan O'tgan O'quv Markazlari")}
          </h4>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 px-2 py-0.5 rounded-lg">
            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col justify-between p-4 bg-slate-50/40 dark:bg-slate-800/20 border border-slate-100/60 dark:border-slate-800/40 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0 mb-3 shadow-2xs">
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate mb-1">
                  {activity.center_name}
                </h5>
                <div className="flex items-center gap-1 text-slate-400 mb-3">
                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="text-[10px] dark:text-slate-500 font-medium truncate">
                    {formatTime(activity.created_at)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100/60 dark:border-slate-800/60">
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded border inline-block ${activity.status === "active"
                  ? "bg-emerald-50/60 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                  : "bg-amber-50/60 text-amber-600 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50"
                  }`}>
                  {activity.status === "active" ? t("status.active", "Faol") : t("status.pending", "Kutilmoqda")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}