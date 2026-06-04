"use client";

import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
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
} from "lucide-react";
import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";
import MoliyaChart from "@/components/sections/payments/FinancialChart";
import { t } from "i18next";

/* ── Mock Data ───────────────────────────────────────────── */
const CENTERS_DATA = [
  {
    id: 1,
    name: "Najot Ta'lim",
    director: "Bobur Akilxanov",
    students: 1240,
    monthRevenue: 284500000,
    totalRevenue: 3245000000,
    status: "active",
  },
  {
    id: 2,
    name: "PDP Academy",
    director: "Sardor Ismoilov",
    students: 980,
    monthRevenue: 218200000,
    totalRevenue: 2890000000,
    status: "active",
  },
  {
    id: 3,
    name: "Astrum IT Academy",
    director: "Dilshod Karimov",
    students: 760,
    monthRevenue: 178400000,
    totalRevenue: 2120000000,
    status: "active",
  },
  {
    id: 4,
    name: "IELTS Zone",
    director: "Laylo Tursunova",
    students: 540,
    monthRevenue: 142800000,
    totalRevenue: 1650000000,
    status: "active",
  },
  {
    id: 5,
    name: "BestIT Academy",
    director: "Aziz Raximov",
    students: 420,
    monthRevenue: 98600000,
    totalRevenue: 1280000000,
    status: "active",
  },
  {
    id: 6,
    name: "Cambridge LC",
    director: "Nilufar Aliyeva",
    students: 320,
    monthRevenue: 72400000,
    totalRevenue: 890000000,
    status: "inactive",
  },
  {
    id: 7,
    name: "IT Park Academy",
    director: "Jamshid Xolmatov",
    students: 680,
    monthRevenue: 165200000,
    totalRevenue: 1920000000,
    status: "active",
  },
  {
    id: 8,
    name: "Digital One",
    director: "Shaxzod Toshev",
    students: 290,
    monthRevenue: 0,
    totalRevenue: 640000000,
    status: "inactive",
  },
];

const TRANSACTIONS = [
  {
    id: 1,
    time: "14:32",
    center: "Najot Ta'lim",
    amount: 1200000,
    method: "Uzcard",
  },
  {
    id: 2,
    time: "14:18",
    center: "PDP Academy",
    amount: 850000,
    method: "Humo",
  },
  {
    id: 3,
    time: "13:55",
    center: "IELTS Zone",
    amount: 650000,
    method: "Naqd",
  },
  {
    id: 4,
    time: "13:42",
    center: "Astrum IT",
    amount: 1100000,
    method: "Uzcard",
  },
  {
    id: 5,
    time: "13:30",
    center: "BestIT Academy",
    amount: 780000,
    method: "Humo",
  },
  {
    id: 6,
    time: "13:15",
    center: "IT Park Academy",
    amount: 920000,
    method: "Naqd",
  },
  {
    id: 7,
    time: "12:58",
    center: "Najot Ta'lim",
    amount: 1350000,
    method: "Uzcard",
  },
  {
    id: 8,
    time: "12:40",
    center: "PDP Academy",
    amount: 750000,
    method: "Humo",
  },
];

function formatUZS(val: number) {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} mlrd`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} mln`;
  return val.toLocaleString("uz-UZ");
}

function getMethodBadge(method: string) {
  switch (method) {
    case "Uzcard":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Humo":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function getMethodIcon(method: string) {
  switch (method) {
    case "Uzcard":
    case "Humo":
      return <CreditCard className="w-3.5 h-3.5" />;
    default:
      return <Banknote className="w-3.5 h-3.5" />;
  }
}

/* ── Component ───────────────────────────────────────────── */
export default function FinancialView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortField, setSortField] = useState<
    "monthRevenue" | "totalRevenue" | "students"
  >("monthRevenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = CENTERS_DATA.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (
      searchQuery &&
      !c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  }).sort((a, b) =>
    sortDir === "desc"
      ? b[sortField] - a[sortField]
      : a[sortField] - b[sortField],
  );

  const totalRevenue = CENTERS_DATA.reduce((s, c) => s + c.totalRevenue, 0);
  const monthRevenue = CENTERS_DATA.reduce((s, c) => s + c.monthRevenue, 0);
  const activeCenters = CENTERS_DATA.filter(
    (c) => c.status === "active",
  ).length;
  const pendingDebts = 847200000;

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  const stats = [
    {
      icon: <DollarSign className="w-5 h-5 text-indigo-600" />,
      label: "Umumiy Daromad",
      value: formatUZS(totalRevenue) + " UZS",
      sub: "Barcha markazlardan",
      color: "bg-indigo-50 border-indigo-100",
      trend: null,
    },
    {
      icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
      label: "Shu Oydagi Tushum",
      value: formatUZS(monthRevenue) + " UZS",
      sub: "O'tgan oyga nisbatan",
      color: "bg-emerald-50 border-emerald-100",
      trend: { value: "+12.4%", positive: true },
    },
    {
      icon: <Building2 className="w-5 h-5 text-blue-600" />,
      label: "Faol O'quv Markazlari",
      value: `${activeCenters} ta`,
      sub: `${CENTERS_DATA.length} tadan`,
      color: "bg-blue-50 border-blue-100",
      trend: null,
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      label: "Kutilayotgan Qarzlar",
      value: formatUZS(pendingDebts) + " UZS",
      sub: "23 ta o'quvchidan",
      color: "bg-amber-50 border-amber-100",
      trend: { value: "-3.2%", positive: true },
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
        {stats.map((item, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shadow-xs ${item.color}`}>
                        {item.icon}
                    </div>
                    {item.trend && (
                        <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                            item.trend.positive
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                                : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900"
                        }`}>
                            {item.trend.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {item.trend.value}
                        </span>
                    )}
                </div>
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">{item.label}</p>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">{item.value}</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{item.sub}</p>
            </div>
        ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <MoliyaChart />
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col transition-colors">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t("finance.recent_transactions")}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("finance.financial_transactions")}</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 px-2 py-1 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("finance.live")}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[340px] pr-1 custom-scrollbar">
                {TRANSACTIONS.map((tx) => (
                    <div key={tx.id} className="flex items-center gap-3 p-3 bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors group/tx">
                        <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0">
                            {getMethodIcon(tx.method)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{tx.center}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{tx.time}</span>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-slate-100">+{(tx.amount / 1000).toFixed(0)}K</p>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${getMethodBadge(tx.method)}`}>
                                {tx.method}
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
        {/* Table Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{t("finance.table_title")}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t("finance.table_desc")}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Search */}
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 w-full sm:w-auto">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t("finance.search_placeholder")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent outline-none text-xs text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500 w-full sm:w-40"
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700 text-xs font-semibold">
                        {(["all", "active", "inactive"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                                    statusFilter === s
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

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-3 px-5">{t("finance.col_center")}</th>
                        <th className="py-3 px-5">{t("finance.col_director")}</th>
                        <th className="py-3 px-5 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => toggleSort("students")}>
                            <span className="flex items-center gap-1">
                                {t("finance.col_students")}
                                {sortField === "students" && <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />}
                            </span>
                        </th>
                        <th className="py-3 px-5 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => toggleSort("monthRevenue")}>
                            <span className="flex items-center gap-1">
                                {t("finance.col_month")}
                                {sortField === "monthRevenue" && <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />}
                            </span>
                        </th>
                        <th className="py-3 px-5 cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors" onClick={() => toggleSort("totalRevenue")}>
                            <span className="flex items-center gap-1">
                                {t("finance.col_total")}
                                {sortField === "totalRevenue" && <ChevronDown className={`w-3 h-3 transition-transform ${sortDir === "asc" ? "rotate-180" : ""}`} />}
                            </span>
                        </th>
                        <th className="py-3 px-5">{t("centers.col_status")}</th>
                        <th className="py-3 px-5 text-right">{t("directors.col_actions")}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
                    {filtered.map((center) => (
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
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{center.students.toLocaleString()}</span>
                            </td>
                            <td className="py-3.5 px-5">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{formatUZS(center.monthRevenue)}</span>
                            </td>
                            <td className="py-3.5 px-5">
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{formatUZS(center.totalRevenue)}</span>
                            </td>
                            <td className="py-3.5 px-5">
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                                    center.status === "active"
                                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                                }`}>
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
                    {filtered.length === 0 && (
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

        {/* Table Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-slate-500">
                {t("finance.total_centers_prefix")}{" "}
                <span className="font-bold text-slate-700 dark:text-slate-300">{filtered.length}</span>{" "}
                {t("finance.total_centers_suffix")}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
                {t("finance.total_revenue")}{" "}
                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {formatUZS(filtered.reduce((s, c) => s + c.totalRevenue, 0))} UZS
                </span>
            </span>
        </div>
    </div>
</div>
  );
}
