export default function DashboardStatSkeleton() {
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
    )
}
