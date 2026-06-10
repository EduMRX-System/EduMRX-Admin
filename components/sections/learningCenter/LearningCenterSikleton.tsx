export default function LearningCenterSikleton() {
    return (
        <tr className="animate-pulse">
            <td className="py-4 px-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-32" />
                        <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-20" />
                    </div>
                </div>
            </td>
            <td className="py-4 px-5">
                <div className="space-y-2">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-sm w-28" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-sm w-24" />
                </div>
            </td>
            <td className="py-4 px-5">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-24" />
            </td>
            <td className="py-4 px-5">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
            </td>
            <td className="py-4 px-5">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-md w-24" />
            </td>
            <td className="py-4 px-5 text-right">
                <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-16 inline-block" />
            </td>
        </tr>
    )
}
