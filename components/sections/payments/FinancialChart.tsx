"use client";

import { useState, useEffect, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { ChevronDown, CalendarDays, Loader2 } from "lucide-react";
import { t } from "i18next";

type Period = "6 oy" | "12 oy" | "Shu yil";

// API dan keladigan ma'lumot strukturasi
interface ApiMonthData {
  label: string; // Masalan: "Yan", "Fev"
  income: number;
  expense: number;
}

const METRICS = [
  { key: "income" as const, label: "Kirim", color: "#10B981", gradient: "incomeGlow" },
  { key: "expense" as const, label: "Chiqim", color: "#EF4444", gradient: "expenseGlow" },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white shadow-xl rounded-xl px-4 py-3 text-xs border border-slate-800 min-w-[180px]">
        <p className="font-semibold text-slate-400 mb-2 pb-2 border-b border-slate-700">
          {label}
        </p>
        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">
                {entry.name === "income" ? "Kirim" : "Chiqim"}
              </span>
            </span>
            <span className="font-bold">{entry.value.toLocaleString()} UZS</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function MoliyaChart() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Period>("12 oy");
  const [chartData, setChartData] = useState<ApiMonthData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(new Set(["income", "expense"]));

  const dropdownRef = useRef<HTMLDivElement>(null);
  const periods: Period[] = ["6 oy", "12 oy", "Shu yil"];

  // API dan ma'lumotni yuklab olish (Bearer Token bilan)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgxMjg1NzE0LCJpYXQiOjE3ODA4NTM3MTQsImp0aSI6IjRiYjg4MmI0ZGJhZTQxNmViNTc2Y2RlZmM1ZDA4NzkyIiwidXNlcl9pZCI6ImIwMjRlNjExLTFlYTYtNDcwYi1hNzA0LTkyZGZjNjFlYTI4MSJ9.zyvfrd7cH-OcKj-lb2ulqKyNAgwRi7IBqeO6duOlVms";

        const response = await fetch("https://edumrx-1.onrender.com/api/v1/super-admin/finance/chart/", {
          method: "GET",
          headers: {
            "accept": "*/*",
            "Authorization": `Bearer ${token}`
          }
        });

        const resJson = await response.json();

        if (resJson && resJson.data) {
          // Filtr davriga qarab ma'lumotni kesish (ixtiyoriy)
          let data: ApiMonthData[] = resJson.data;
          if (selected === "6 oy") {
            data = data.slice(-6); // Oxirgi 6 oyni olish
          }
          setChartData(data);
        }
      } catch (error) {
        console.error("Ma'lumot olishda xatolik:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selected]);

  // Tashqariga bosganda dropdown yopilishi
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Umumiy Sof Foydani hisoblash (Kirim - Chiqim)
  const totalIncome = chartData.reduce((sum, d) => sum + (d.income || 0), 0);
  const totalExpense = chartData.reduce((sum, d) => sum + (d.expense || 0), 0);
  const netProfit = totalIncome - totalExpense;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 w-full flex flex-col h-full transition-colors min-h-[420px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-wide">
            {t("finance.chart_title", "Moliyaviy Tahlil")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("finance.chart_desc", "Tizimdagi umumiy kirim va chiqimlar balansi")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Sof Foyda:
            </span>
            <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {netProfit.toLocaleString()} UZS
            </span>
          </div>

          {/* Dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setIsOpen((prev) => !prev)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
            >
              <CalendarDays className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              {selected}
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>
            {isOpen && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden w-32 py-1">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelected(period);
                      setIsOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${selected === period
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart yoki Loader */}
      <div className="w-full h-[280px] mb-4 flex items-center justify-center relative">
        {loading ? (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <span className="text-xs">Yuklanmoqda...</span>
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-slate-400 text-xs">Ma'lumot topilmadi</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ bottom: 0, left: -10, right: 10, top: 10 }}>
              <defs>
                {METRICS.map((metric) => (
                  <linearGradient key={metric.gradient} id={metric.gradient} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metric.color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={metric.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 11, fontWeight: "600" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 11 }}
                allowDecimals={false}
                tickFormatter={(v) => v >= 1000000 ? `${v / 1000000}M` : v.toLocaleString()}
              />
              <Tooltip content={<CustomTooltip />} />
              {METRICS.map(
                (metric) =>
                  activeMetrics.has(metric.key) && (
                    <Area
                      key={metric.key}
                      type="monotone"
                      dataKey={metric.key}
                      name={metric.key}
                      stroke={metric.color}
                      strokeWidth={2.5}
                      fill={`url(#${metric.gradient})`}
                      dot={false}
                      activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                    />
                  ),
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend / Kalitlar (Kirim va Chiqim filteri uchun) */}
      <div className="flex flex-wrap gap-2">
        {METRICS.map((metric) => {
          const isActive = activeMetrics.has(metric.key);
          return (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${isActive
                  ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-medium"
                }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-sm inline-block transition-opacity ${isActive ? "opacity-100" : "opacity-30"}`}
                style={{ backgroundColor: metric.color }}
              />
              {metric.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}