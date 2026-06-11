"use client";

import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  TrendingUp,
  Building2,
  AlertTriangle,
  Search,
  ChevronDown,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Banknote,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";
import MoliyaChart from "@/components/sections/payments/FinancialChart";
import { CentersParams, FinanceCentersResponse, FinanceSummary, TransactionsResponse } from "@/types";
import FinancialStatSkeleton from "@/components/sections/payments/FinancialStatSkeleton";
import FinancialTableRowSkeleton from "@/components/sections/payments/FinancialTableRowSkeleton";

/* ── 1. AXIOS CLIENT INSTANCE & INTERCEPTORS ────────────────── */
const DataBaseURL = process.env.NEXT_PUBLIC_DataBaseURL;

const API = axios.create({
  baseURL: DataBaseURL,
});

API.interceptors.request.use((config) => {
  const storedTokens = localStorage.getItem("tokens");

  if (storedTokens) {
    const tokens = JSON.parse(storedTokens);
    if (tokens?.access_token) {
      config.headers.Authorization = `Bearer ${tokens.access_token}`;
    }
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("tokens");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* ── 3. INLINE API DIRECT CALLS ────────────────────────────── */
const fetchSummary = () =>
  API.get<{ data: FinanceSummary }>("super-admin/finance/summary/");

const fetchCenters = (params: CentersParams & { page?: number; limit?: number }) => {
  const { limit, ...rest } = params;

  return API.get<FinanceCentersResponse>("super-admin/finance/centers/", {
    params: {
      ...rest,
      per_page: limit
    }
  });
};

const fetchTransactions = (page = 1, limit = 20) =>
  API.get<TransactionsResponse>("super-admin/finance/transactions/", { params: { page, limit } });

/* ── 4. HELPERS ────────────────────────────────────────────── */
function formatUZS(val: number) {
  if (!val) return "0";
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} mlrd`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} mln`;
  return val.toLocaleString("uz-UZ");
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getMethodBadge(method: string) {
  switch (method) {
    case "uzcard":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900";
    case "humo":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900";
  }
}

function getMethodLabel(method: string) {
  switch (method) {
    case "uzcard": return "Uzcard";
    case "humo": return "Humo";
    default: return "Naqd";
  }
}

function getMethodIcon(method: string) {
  if (method === "uzcard" || method === "humo")
    return <CreditCard className="w-3.5 h-3.5" />;
  return <Banknote className="w-3.5 h-3.5" />;
}

/* ── 6. MAIN VIEW COMPONENT ─────────────────────────────────── */
export default function FinancialView() {
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortField, setSortField] = useState<"month_revenue" | "total_revenue" | "students_count">("month_revenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // PAGINATION STATES
  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Backend default "per_page: 20" ga moslashtirildi

  /* ── Direct TanStack Query Hooks Internal Implementation ── */
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["finance", "summary"],
    queryFn: () => fetchSummary().then((r) => r.data.data),
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  // Kiritilgan qidiruv yoki filter o'zgarganda sahifani 1-ga qaytarish uchun effekt
  const handleFilterChange = (updater: () => void) => {
    updater();
    setCurrentPage(1);
  };

  const { data: centersData, isLoading: centersLoading } = useQuery({
    queryKey: ["finance", "centers", statusFilter, searchQuery, sortField, sortDir, currentPage, itemsPerPage],
    queryFn: () => fetchCenters({
      status: statusFilter === "all" ? undefined : statusFilter,
      search: searchQuery || undefined,
      sort_by: sortField,
      sort_dir: sortDir,
      page: currentPage,
      limit: itemsPerPage,
    }).then((r) => r.data),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

  const { data: transactionsResponse, isLoading: txLoading } = useQuery({
    queryKey: ["finance", "transactions"],
    queryFn: () => fetchTransactions(1, 10).then((r) => r.data),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });

  const centers = centersData?.data ?? [];
  const centersMeta = centersData?.meta;
  const transactions = transactionsResponse?.data ?? [];

  const totalPages = centersMeta
    ? Math.ceil(centersMeta.total / (centersMeta.per_page || 10))
    : 1;
  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
    setCurrentPage(1); // Sort o'zgarganda birinchi sahifaga qaytarish
  };

  const stats = [
    {
      icon: <DollarSign className="w-5 h-5 text-indigo-600" />,
      label: "Umumiy Daromad",
      value: summary ? formatUZS(summary.total_revenue) + " UZS" : "—",
      sub: "Barcha markazlardan",
      color: "bg-indigo-50 border-indigo-100 dark:bg-indigo-950/30 dark:border-indigo-900",
      trend: null,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      label: "Shu Oydagi Tushum",
      value: summary ? formatUZS(summary.month_revenue) + " UZS" : "—",
      sub: "O'tgan oyga nisbatan",
      color: "bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-indigo-900",
      trend: summary
        ? {
          value: `${summary.month_revenue_change > 0 ? "+" : ""}${summary.month_revenue_change}%`,
          positive: summary.month_revenue_change >= 0,
        }
        : null,
    },
    {
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
      label: "Faol O'quv Markazlari",
      value: summary ? `${summary.active_centers} ta` : "—",
      sub: summary ? `${summary.total_centers} tadan` : "—",
      color: "bg-blue-50 border-blue-100 dark:bg-blue-950/30 dark:border-blue-900",
      trend: null,
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      label: "Kutilayotgan Qarzlar",
      value: summary ? formatUZS(summary.pending_debts) + " UZS" : "—",
      sub: summary ? `${summary.pending_debts_students_count} ta o'quvchidan` : "—",
      color: "bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-blue-900",
      trend: summary
        ? {
          value: `${summary.pending_debts_change > 0 ? "+" : ""}${summary.pending_debts_change}%`,
          positive: summary.pending_debts_change <= 0,
        }
        : null,
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Title text={t("finance.title")} />
          <div className="mt-1">
            <Text text={t("finance.desc")} />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 px-3 py-1.5 rounded-xl self-start sm:self-center">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t("dashboard.live_mode")}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {summaryLoading
          ? [...Array(4)].map((_, i) => <FinancialStatSkeleton key={i} />)
          : stats.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shadow-xs ${item.color}`}>
                  {item.icon}
                </div>
                {item.trend && (
                  <span
                    className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md border ${item.trend.positive
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                      : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
                      }`}
                  >
                    {item.trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {item.trend.value}
                  </span>
                )}
              </div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                {item.label}
              </p>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                {item.value}
              </h2>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                {item.sub}
              </p>
            </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2">
          <MoliyaChart />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t("finance.recent_transactions")}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {t("finance.financial_transactions")}
              </p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-2 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t("finance.live")}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 max-h-[340px] pr-1 custom-scrollbar">
            {txLoading
              ? [...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl animate-pulse">
                  <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-28 h-3 rounded bg-slate-200 dark:bg-slate-700" />
                    <div className="w-16 h-2.5 rounded bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <div className="text-right space-y-1.5">
                    <div className="w-14 h-3 rounded bg-slate-200 dark:bg-slate-700 ml-auto" />
                    <div className="w-10 h-4 rounded bg-slate-200 dark:bg-slate-700 ml-auto" />
                  </div>
                </div>
              ))
              : transactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors group/tx"
                >
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
                    {getMethodIcon(tx.payment_method)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {tx.center_name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        {formatTime(tx.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      +{(tx.amount / 1000).toFixed(0)}K
                    </p>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${getMethodBadge(tx.payment_method)}`}>
                      {getMethodLabel(tx.payment_method)}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
              {t("finance.all_transactions")} →
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t("finance.table_title")}
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {t("finance.table_desc")}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 w-full sm:w-auto">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t("finance.search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => handleFilterChange(() => setSearchQuery(e.target.value))}
                  className="bg-transparent outline-none text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full sm:w-40"
                />
              </div>
              <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700 text-xs font-semibold">
                {(["all", "active", "inactive"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleFilterChange(() => setStatusFilter(s))}
                    className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${statusFilter === s
                      ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                  >
                    {s === "all" ? t("common.all") : s === "active" ? t("centers.status.active") : t("centers.status.inactive")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3 px-5">{t("finance.col_center")}</th>
                <th className="py-3 px-5">{t("finance.col_director")}</th>
                <th
                  className="py-3 px-5 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  onClick={() => toggleSort("students_count")}
                >
                  <span className="flex items-center gap-1">
                    {t("finance.col_students")}
                    {sortField === "students_count" && (
                      <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </span>
                </th>
                <th
                  className="py-3 px-5 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  onClick={() => toggleSort("month_revenue")}
                >
                  <span className="flex items-center gap-1">
                    {t("finance.col_month")}
                    {sortField === "month_revenue" && (
                      <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </span>
                </th>
                <th
                  className="py-3 px-5 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  onClick={() => toggleSort("total_revenue")}
                >
                  <span className="flex items-center gap-1">
                    {t("finance.col_total")}
                    {sortField === "total_revenue" && (
                      <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />
                    )}
                  </span>
                </th>
                <th className="py-3 px-5">{t("centers.col_status")}</th>
                <th className="py-3 px-5 text-right">{t("directors.col_actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
              {centersLoading
                ? [...Array(5)].map((_, i) => <FinancialTableRowSkeleton key={i} />)
                : centers.map((center: any) => (
                  <tr key={center.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{center.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600 dark:text-slate-400">{center.director}</td>
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {center.students_count?.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {formatUZS(center.month_revenue)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {formatUZS(center.total_revenue)}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${center.status === "active"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                          }`}
                      >
                        {center.status === "active" ? t("centers.status.active") : t("centers.status.inactive")}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950 border border-indigo-200 dark:border-indigo-900 px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                        <Eye className="w-3.5 h-3.5" />
                        {t("finance.details")}
                      </button>
                    </td>
                  </tr>
                ))}

              {!centersLoading && centers.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">{t("common.no_results")}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{t("finance.change_filter")}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── YANGILANGAN JAVDAL FOOTER + CHIROYLI PAGINATION CONTROLS ── */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 w-full sm:w-auto text-center sm:text-left">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {t("finance.total_centers_prefix")}{" "}
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {centersLoading ? <Loader2 className="w-3 h-3 inline animate-spin" /> : centersMeta?.total ?? centers.length}
              </span>{" "}
              {t("finance.total_centers_suffix")}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              {t("finance.total_revenue")}{" "}
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {centersLoading ? (
                  <Loader2 className="w-3 h-3 inline animate-spin" />
                ) : (
                  formatUZS(centersMeta?.total_revenue_sum ?? 0) + " UZS"
                )}
              </span>
            </span>
          </div>

          {/* Pagination Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 self-center sm:self-auto">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || centersLoading}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;

                if (
                  totalPages > 5 &&
                  pageNumber !== 1 &&
                  pageNumber !== totalPages &&
                  Math.abs(pageNumber - currentPage) > 1
                ) {
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return <span key={pageNumber} className="px-1 text-slate-400 text-xs">...</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    disabled={centersLoading}
                    className={`w-7 h-7 text-xs font-bold rounded-lg transition-all cursor-pointer ${currentPage === pageNumber
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent"
                      }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || centersLoading}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}