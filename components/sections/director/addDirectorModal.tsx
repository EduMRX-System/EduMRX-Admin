"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { UserPlus, Eye, EyeOff, Mail, Phone, Lock } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import { icons } from "@/constants/icons";

function formatUzPhone(raw: string): string {
    const d = raw.slice(0, 9);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2, 5)}`;
    if (d.length <= 7) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`;
}

const schema = yup.object({
    first_name: yup.string().required("Ism kiritilishi shart"),
    last_name: yup.string().required("Familiya kiritilishi shart"),
    phone: yup
        .string()
        .required("Telefon raqam majburiy")
        .test("phone-complete", "Raqamni to'liq kiriting", (val) => {
            const digits = val?.replace(/\D/g, "") ?? "";
            return digits.length === 12;
        }),
    email: yup.string().email("Xato email formati").required("Email kiritilishi shart"),
    password: yup
        .string()
        .required("Parol majburiy")
        .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
}).required();

type FormData = yup.InferType<typeof schema>;

export default function AddDirectorModal({ onClose }: { onClose?: () => void }) {
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const [phoneDisplay, setPhoneDisplay] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    // React Query Mutation - Direktor qo'shish API so'rovi
    const { mutate: addDirector, isPending } = useMutation({
        mutationFn: async (body: FormData) => {
            // API yo'nalishini backend hujjatiga qarab moslashtiring (masalan: /api/v1/super-admin/directors/)
            const res = await API.post("/api/v1/super-admin/directors/", body);
            return res?.data;
        },
        onSuccess: (data) => {
            toast.success(data?.message || "Direktor muvaffaqiyatli qo'shildi!");
            reset();
            setPhoneDisplay("");
            queryClient.invalidateQueries({ queryKey: ["directors-list"] }); // Direktorlar ro'yxatini yangilash
            if (onClose) onClose();
        },
        onError: (err: any) => {
            const backendError =
                err?.response?.data?.non_field_errors?.[0] ||
                err?.response?.data?.message ||
                err?.message ||
                "Xatolik yuz berdi";
            toast.error(backendError);
        },
    });

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        const withPrefix = raw.startsWith("998") ? raw : "998" + raw.replace(/^998/, "");
        const local = withPrefix.slice(3, 12);

        setPhoneDisplay(formatUzPhone(local));
        const full = "998" + local;
        setValue("phone", full, { shouldValidate: true });
    };

    const onSubmit = (data: FormData) => {
        // Telefon raqam boshiga '+' belgisini qo'shib yuborish (+998901234567)
        addDirector({
            ...data,
            phone: `+${data.phone}`,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Orqa fon (Backdrop) */}
            <div
                className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* Modal Oynasi */}
            <div
                className={`bg-white p-6 rounded-xl max-w-md w-full relative z-10 shadow-2xl border border-slate-100 transform transition-all duration-500 ease-out
                ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-12 scale-95"}`}
            >
                {/* Yopish tugmasi */}
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Modal Sarlavhasi */}
                <div className="mb-[10px] border-[#C7C4D8] border shadow-sm w-[44px] h-[44px] rounded-lg flex justify-center items-center text-indigo-600 bg-indigo-50/10">
                    <Image src={icons.directorIcon} alt="director-icon" className="w-5 h-5" />
                </div>

                <h3 className="text-[#313131] text-[18px] font-semibold mb-4">Add New Director</h3>

                {/* Form boshlanishi */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Ism va Familiya Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">First Name</label>
                            <input
                                {...register("first_name")}
                                type="text"
                                placeholder="John"
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all ${errors.first_name ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`}
                            />
                            {errors.first_name && <p className="text-red-400 text-[11px] mt-1">{errors.first_name.message}</p>}
                        </div>

                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Last Name</label>
                            <input
                                {...register("last_name")}
                                type="text"
                                placeholder="Doe"
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all ${errors.last_name ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`}
                            />
                            {errors.last_name && <p className="text-red-400 text-[11px] mt-1">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    {/* Telefon raqami */}
                    <div>
                        <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Phone Number</label>
                        <div className="relative flex items-center">
                            <div className="absolute left-3 flex items-center gap-1.5 select-none pointer-events-none">
                                <span className="text-base leading-none">🇺🇿</span>
                                <span className="text-sm font-semibold text-[#191C1D]">+998</span>
                            </div>
                            <input
                                type="tel"
                                value={phoneDisplay}
                                onChange={handlePhoneChange}
                                placeholder="90-123-45-67"
                                className={`border rounded-lg w-full h-[40px] pl-[90px] pr-[10px] text-[14px] outline-none transition-all ${errors.phone ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`}
                            />
                        </div>
                        {errors.phone && <p className="text-red-400 text-[11px] mt-1 ml-2">{errors.phone.message}</p>}
                    </div>

                    {/* Email manzili */}
                    <div>
                        <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Email Address</label>
                        <div className="relative flex items-center">
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="director@example.com"
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all ${errors.email ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`}
                            />
                        </div>
                        {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Parol inputi */}
                    <div>
                        <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Account Password</label>
                        <div className="relative flex items-center">
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={`border rounded-lg w-full h-[40px] pl-3 pr-[40px] text-[14px] outline-none transition-all ${errors.password ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 text-slate-400 hover:text-slate-600 p-1 rounded transition-colors cursor-pointer"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-400 text-[11px] mt-1">{errors.password.message}</p>}
                    </div>

                    {/* Saqlash tugmasi */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-[40px] mt-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-indigo-300 text-white rounded-lg text-[14px] font-bold transition-colors cursor-pointer flex items-center justify-center"
                    >
                        {isPending ? "Creating Account..." : "Create Director"}
                    </button>
                </form>
            </div>
        </div>
    );
}