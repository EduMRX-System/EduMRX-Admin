export default function DashboardChartSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 animate-pulse">
            <div className="w-48 h-4 rounded bg-slate-100 dark:bg-slate-800 mb-6" />
            <div className="h-[220px] w-full flex items-end gap-3 pt-4">
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-t-md"
                        style={{ height: `${Math.floor(Math.random() * 60) + 20}%` }}
                    />
                ))}
            </div>
            {/* wda */}
        </div>
    )
}
