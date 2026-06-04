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
import { ChevronDown, CalendarDays } from "lucide-react";
import { t } from "i18next";

type Period = "6 oy" | "12 oy" | "Shu yil";

interface MonthData {
  month: string;
  "Najot Ta'lim": number;
  "PDP Academy": number;
  "Astrum IT": number;
  "IELTS Zone": number;
  "BestIT Academy": number;
}

const MOCK_DATA: MonthData[] = [
  {
    month: "Yan",
    "Najot Ta'lim": 48,
    "PDP Academy": 38,
    "Astrum IT": 28,
    "IELTS Zone": 18,
    "BestIT Academy": 22,
  },
  {
    month: "Fev",
    "Najot Ta'lim": 52,
    "PDP Academy": 42,
    "Astrum IT": 32,
    "IELTS Zone": 22,
    "BestIT Academy": 26,
  },
  {
    month: "Mar",
    "Najot Ta'lim": 61,
    "PDP Academy": 48,
    "Astrum IT": 38,
    "IELTS Zone": 28,
    "BestIT Academy": 31,
  },
  {
    month: "Apr",
    "Najot Ta'lim": 58,
    "PDP Academy": 52,
    "Astrum IT": 42,
    "IELTS Zone": 32,
    "BestIT Academy": 28,
  },
  {
    month: "May",
    "Najot Ta'lim": 72,
    "PDP Academy": 58,
    "Astrum IT": 48,
    "IELTS Zone": 38,
    "BestIT Academy": 35,
  },
  {
    month: "Iyun",
    "Najot Ta'lim": 78,
    "PDP Academy": 62,
    "Astrum IT": 52,
    "IELTS Zone": 42,
    "BestIT Academy": 38,
  },
  {
    month: "Iyul",
    "Najot Ta'lim": 85,
    "PDP Academy": 68,
    "Astrum IT": 55,
    "IELTS Zone": 45,
    "BestIT Academy": 42,
  },
  {
    month: "Avg",
    "Najot Ta'lim": 82,
    "PDP Academy": 72,
    "Astrum IT": 58,
    "IELTS Zone": 48,
    "BestIT Academy": 45,
  },
  {
    month: "Sen",
    "Najot Ta'lim": 90,
    "PDP Academy": 78,
    "Astrum IT": 62,
    "IELTS Zone": 52,
    "BestIT Academy": 48,
  },
  {
    month: "Okt",
    "Najot Ta'lim": 95,
    "PDP Academy": 82,
    "Astrum IT": 68,
    "IELTS Zone": 55,
    "BestIT Academy": 52,
  },
  {
    month: "Noy",
    "Najot Ta'lim": 102,
    "PDP Academy": 88,
    "Astrum IT": 72,
    "IELTS Zone": 58,
    "BestIT Academy": 55,
  },
  {
    month: "Dek",
    "Najot Ta'lim": 108,
    "PDP Academy": 92,
    "Astrum IT": 78,
    "IELTS Zone": 62,
    "BestIT Academy": 58,
  },
];

const CENTERS = [
  { key: "Najot Ta'lim" as const, color: "#4F46E5", gradient: "najotGlow" },
  { key: "PDP Academy" as const, color: "#10B981", gradient: "pdpGlow" },
  { key: "Astrum IT" as const, color: "#F59E0B", gradient: "astrumGlow" },
  { key: "IELTS Zone" as const, color: "#EC4899", gradient: "ieltsGlow" },
  { key: "BestIT Academy" as const, color: "#06B6D4", gradient: "bestitGlow" },
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
          <div
            key={idx}
            className="flex items-center justify-between gap-4 py-0.5"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">{entry.name}</span>
            </span>
            <span className="font-bold">{entry.value}M</span>
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
  const [activeCenters, setActiveCenters] = useState<Set<string>>(
    new Set(CENTERS.map((c) => c.key)),
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const periods: Period[] = ["6 oy", "12 oy", "Shu yil"];

  const chartData = selected === "6 oy" ? MOCK_DATA.slice(6) : MOCK_DATA;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCenter = (key: string) => {
    setActiveCenters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Calculate totals for summary
  const totalRevenue = CENTERS.reduce((sum, center) => {
    if (!activeCenters.has(center.key)) return sum;
    return sum + chartData.reduce((s, d) => s + d[center.key], 0);
  }, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xs border border-slate-200 dark:border-slate-800 w-full flex flex-col h-full transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-wide">
            {t("finance.chart_title")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t("finance.chart_desc")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg px-3 py-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {t("finance.total_label")}
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              {totalRevenue}M UZS
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
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
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
                    className={`block w-full text-left px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      selected === period
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

      {/* Chart */}
      <div className="w-full h-[280px] mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ bottom: 0, left: -20, right: 10, top: 10 }}
          >
            <defs>
              {CENTERS.map((center) => (
                <linearGradient
                  key={center.gradient}
                  id={center.gradient}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={center.color}
                    stopOpacity={0.15}
                  />
                  <stop offset="95%" stopColor={center.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#334155"
              opacity={0.2}
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 11, fontWeight: "600" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 11 }}
              allowDecimals={false}
              tickFormatter={(v) => `${v}M`}
            />
            <Tooltip content={<CustomTooltip />} />
            {CENTERS.map(
              (center) =>
                activeCenters.has(center.key) && (
                  <Area
                    key={center.key}
                    type="monotone"
                    dataKey={center.key}
                    stroke={center.color}
                    strokeWidth={2.5}
                    fill={`url(#${center.gradient})`}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                  />
                ),
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {CENTERS.map((center) => {
          const isActive = activeCenters.has(center.key);
          return (
            <button
              key={center.key}
              onClick={() => toggleCenter(center.key)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold shadow-xs"
                  : "bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-medium"
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-sm inline-block transition-opacity ${isActive ? "opacity-100" : "opacity-30"}`}
                style={{ backgroundColor: center.color }}
              />
              {center.key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
