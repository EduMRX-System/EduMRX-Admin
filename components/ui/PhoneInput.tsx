import { formatUzPhone } from "@/utils/formatters";
import { t } from "i18next";

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export const PhoneInput = ({ value, onChange, error }: PhoneInputProps) => {
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        const local = raw.slice(0, 9);
        const full = "998" + local;
        onChange(full);
    };

    return (
        <div>
            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">
                {t("common.phone")}
            </label>
            <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-3 pointer-events-none">
                    <span className="text-base text-[#fff9]">🇺🇿</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">+998</span>
                </div>
                <input
                    type="tel"
                    value={formatUzPhone(value.slice(3))}
                    onChange={handlePhoneChange}
                    placeholder="90-123-45-67"
                    className={`border rounded-lg w-full h-[40px] pl-[90px] pr-[10px] text-[14px] outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors
                ${error
                            ? "border-red-300 dark:border-red-800 bg-red-50/10"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                />
            </div>
            {error && <p className="text-red-400 dark:text-red-500 text-[11px] mt-1">{error}</p>}
        </div>
    );
};