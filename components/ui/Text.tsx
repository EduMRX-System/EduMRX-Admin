export default function Text({ text }: { text: string }) {
    return (
        <p className="text-[16px] text-slate-500 dark:text-slate-400 transition-colors">
            {text}
        </p>
    )
}