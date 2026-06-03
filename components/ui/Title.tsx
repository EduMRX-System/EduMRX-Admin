export default function Title({ text }: { text: string }) {
    return (
        <h2 className="text-[32px] font-bold text-slate-900 dark:text-slate-100 transition-colors">
            {text}
        </h2>
    )
}