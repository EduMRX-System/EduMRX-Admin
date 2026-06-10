export default function FinancialTableRowSkeleton() {
    return (
        <tr>
            <td className="py-3.5 px-5">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    <div className="w-28 h-3.5 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </div>
            </td>
            {[...Array(5)].map((_, i) => (
                <td key={i} className="py-3.5 px-5">
                    <div className="w-20 h-3.5 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                </td>
            ))}
            <td className="py-3.5 px-5 text-right">
                <div className="w-16 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse ml-auto" />
            </td>
        </tr>
    )
}
