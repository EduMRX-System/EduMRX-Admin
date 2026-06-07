"use client";

interface DirectorSkeletonProps {
    viewMode: "list" | "grid";
    count?: number; // Nechta qator/karta chiqishi
}

export default function DirectorSkeleton({ viewMode, count = 5 }: DirectorSkeletonProps) {
    // Ko'rsatilgan miqdorda massiv hosil qilish
    const items = Array.from({ length: count });

    if (viewMode === "list") {
        return (
            <>
                {items.map((_, index) => (
                    <tr
                        key={index}
                        className="border-b border-slate-100 dark:border-slate-800/70 animate-pulse"
                    >
                        {/* Avatar va Ism skeleton */}
                        <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                                <div className="space-y-2 w-full max-w-[150px]">
                                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-md w-2/3" />
                                </div>
                            </div>
                        </td>

                        {/* Telefon va Email skeleton */}
                        <td className="py-4 px-5">
                            <div className="space-y-2 max-w-[140px]">
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-full" />
                                <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-5/6" />
                            </div>
                        </td>

                        {/* Sana skeleton */}
                        <td className="py-4 px-5">
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-20" />
                        </td>

                        {/* Amallar tugmasi skeleton */}
                        <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
                            </div>
                        </td>
                    </tr>
                ))}
            </>
        );
    }

    // GRID MODE SKELETON
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
            {items.map((_, index) => (
                <div
                    key={index}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between animate-pulse min-h-[190px]"
                >
                    <div>
                        {/* Yuqori qism: Avatar va Ism */}
                        <div className="flex items-center gap-3.5 mb-4">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                            <div className="space-y-2 w-full">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                                <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/2" />
                            </div>
                        </div>

                        {/* O'rta qism: Kontaktlar */}
                        <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-5/6" />
                            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-2/3" />
                        </div>
                    </div>

                    {/* Pastki qism: Sana va Amallar */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-4">
                        <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded-md w-16" />
                        <div className="flex gap-1.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
                            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800/60" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}