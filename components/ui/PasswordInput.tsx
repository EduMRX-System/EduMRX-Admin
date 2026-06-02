import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
    register: any; 
    error?: string;
}

export const PasswordInput = ({ register, error }: PasswordInputProps) => {
    const [show, setShow] = useState(false);

    return (
        <div>
            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Password</label>
            <div className="relative flex items-center">
                <input
                    {...register}
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    className={`border rounded-lg w-full h-[40px] px-3 pr-10 text-[14px] outline-none focus:border-indigo-500 ${error ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 text-slate-400 hover:text-slate-600">
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {error && <p className="text-red-400 text-[11px] mt-1">{error}</p>}
        </div>
    );
};