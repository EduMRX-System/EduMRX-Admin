import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { t } from "i18next";

interface PasswordInputProps {
    register: any;
    error?: string;
}

export const PasswordInput = ({ register, error }: PasswordInputProps) => {
    const [show, setShow] = useState(false);

    return (
        <div>
            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">
                {t("common.password")}
            </label>
            <div className="relative flex items-center">
                <input
                    {...register}
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    className={`border rounded-lg w-full h-[40px] px-3 pr-10 text-[14px] outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors
                ${error
                            ? "border-red-300 dark:border-red-800 bg-red-50/10"
                            : "border-slate-200 dark:border-slate-700"
                        }`}
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {error && <p className="text-red-400 dark:text-red-500 text-[11px] mt-1">{error}</p>}
        </div>
    );
};