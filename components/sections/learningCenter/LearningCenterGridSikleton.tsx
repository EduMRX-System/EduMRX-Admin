export default function LearningCenterGridSikleton() {
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-28" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-16" />
                    </div>
                </div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-14" />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm w-full" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm w-2/3" />
            </div>
            <div className="flex items-center justify-between pt-2">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-24" />
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-16" />
            </div>
        </div>
    )
}
