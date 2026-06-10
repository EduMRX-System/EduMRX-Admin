export default function FinancialStatSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs animate-pulse">
            <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <div className="w-14 h-5 rounded-md bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="w-24 h-3 rounded bg-slate-100 dark:bg-slate-800 mb-2" />
            <div className="w-36 h-6 rounded bg-slate-100 dark:bg-slate-800 mb-1.5" />
            <div className="w-20 h-3 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
    )
}
