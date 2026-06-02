import { formatUzPhone } from "@/utils/formatters";

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
            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Phone</label>
            <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none">
                    <span className="text-base">🇺🇿</span><span className="text-sm font-semibold">+998</span>
                </div>
                <input
                    type="tel"
                    value={formatUzPhone(value.slice(3))}
                    onChange={handlePhoneChange}
                    placeholder="90-123-45-67"
                    className={`border rounded-lg w-full h-[40px] pl-[90px] pr-[10px] text-[14px] outline-none focus:border-indigo-500 ${error ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`}
                />
            </div>
            {error && <p className="text-red-400 text-[11px] mt-1">{error}</p>}
        </div>
    );
};