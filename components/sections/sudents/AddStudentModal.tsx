"use client"

import { useState } from "react";
import { icons } from "@/constants/icons";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

function formatUzPhone(raw: string): string {
    const d = raw.slice(0, 9);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2, 5)}`;
    if (d.length <= 7) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`;
}

const schema = yup.object({
    full_name: yup.string().required("Ism va familiya kiritilishi shart"),
    phone: yup
        .string()
        .required("Phone number is mandatory")
        .test("phone-complete", "Enter a full number", (val) => {
            const digits = val?.replace(/\D/g, "") ?? "";
            return digits.length === 12;
        }),
    email: yup
        .string()
        .email("Xato email formati")
        .matches(
            /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
            "Faqat @gmail.com elektron pochtasi qabul qilinadi"
        )
        .required("Email kiritilishi shart"), center: yup.string().required("Markazni tanlang"),
    date_of_birth: yup.string().required("Tug'ilgan sana shart"),
    address: yup.string().required("Manzil shart"),
    notes: yup.string().optional(),
    status: yup.string().required("Status shart"),
    password: yup.string().min(6, "Parol kamida 6 ta belgi bo'lsin").required("Parol shart"),
}).required();

type FormData = yup.InferType<typeof schema>;

export default function AddStudentModal({ onClose }: { onClose?: () => void }) {
    const queryClient = useQueryClient();
    const [showPassword, setShowPassword] = useState(false);

    const [phoneDisplay, setPhoneDisplay] = useState("");
    const [phoneFull, setPhoneFull] = useState("998");

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            status: "active",
        }
    });

    const { mutate: addStudent, isPending } = useMutation({
        mutationFn: async (body: FormData) => {
            const res = await API.post("/api/v1/super-admin/students/", body);
            return res?.data;
        },
        onSuccess: (data) => {
            toast.success(data?.message || "O'quvchi muvaffaqiyatli qo'shildi!");
            reset();
            setPhoneDisplay("");
            setPhoneFull("998");
            queryClient.invalidateQueries({ queryKey: ["students"] });
            if (onClose) onClose();
        },
        onError: (err: any) => {
            const backendError =
                err?.response?.data?.non_field_errors?.[0] ||
                err?.response?.data?.message ||
                err?.message ||
                "Xatolik yuz berdi";
            toast.error(backendError);
        }
    });

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        const withPrefix = raw.startsWith("998") ? raw : "998" + raw.replace(/^998/, "");
        const local = withPrefix.slice(3, 12);
        const formatted = formatUzPhone(local);
        setPhoneDisplay(formatted);

        const full = "998" + local;
        setPhoneFull(full);
        setValue("phone", full, { shouldValidate: true });
    };

    const isPhoneComplete = phoneFull.replace(/\D/g, "").length === 12;

    const onSubmit = (data: FormData) => {
        const formattedData = {
            ...data,
            phone: `+${data.phone}`
        };
        addStudent(formattedData);
    };


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />
            <div className="bg-white p-6 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl border border-slate-100 transform transition-all duration-300 ease-out animate-in fade-in zoom-in-95 slide-in-from-top-12">
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <div className="mb-[10px] border-[#C7C4D8] border shadow-sm w-[44px] h-[44px] rounded-lg flex justify-center items-center">
                    <Image src={icons.studentsIcon || "/student.svg"} alt="student-icon" width={24} height={24} />
                </div>
                <h3 className="text-[#313131] text-[18px] font-semibold mb-4">Add New Student</h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Full Name</label>
                        <input
                            {...register("full_name")}
                            type="text"
                            placeholder="John Doe"
                            className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none ${errors.full_name ? "border-red-300" : "border-[#C7C4D8]"}`}
                        />
                        {errors.full_name && <p className="text-red-400 text-[11px] mt-1">{errors.full_name.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Phone</label>
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
                                    className={`border rounded-lg w-full h-[40px] pl-[90px] pr-[36px] text-[14px] outline-none
                                    placeholder:text-[#6B7280] text-[#191C1D] transition-all
                                    ${errors.phone ? "border-red-300 bg-red-50/10" : isPhoneComplete ? "border-emerald-300 bg-emerald-50/10" : "border-[#C7C4D8]"}`}
                                />
                                {isPhoneComplete && (
                                    <div className="absolute right-3 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            {errors.phone && <p className="text-red-400 text-[11px] mt-1 ml-2">{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Email</label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="example@gmail.com"
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none ${errors.email ? "border-red-300" : "border-[#C7C4D8]"}`}
                            />
                            {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Learning Center</label>
                            <input
                                {...register("center")}
                                type="text"
                                placeholder="Center Name/ID"
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none ${errors.center ? "border-red-300" : "border-[#C7C4D8]"}`}
                            />
                            {errors.center && <p className="text-red-400 text-[11px] mt-1">{errors.center.message}</p>}
                        </div>

                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Date of Birth</label>
                            <input
                                {...register("date_of_birth")}
                                type="date"
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none ${errors.date_of_birth ? "border-red-300" : "border-[#C7C4D8]"}`}
                            />
                            {errors.date_of_birth && <p className="text-red-400 text-[11px] mt-1">{errors.date_of_birth.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Address</label>
                        <input
                            {...register("address")}
                            type="text"
                            placeholder="Toshkent sh., Chilonzor t."
                            className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none ${errors.address ? "border-red-300" : "border-[#C7C4D8]"}`}
                        />
                        {errors.address && <p className="text-red-400 text-[11px] mt-1">{errors.address.message}</p>}
                    </div>

                    <div>
                        <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Notes</label>
                        <textarea
                            {...register("notes")}
                            placeholder="Qo'shimcha ma'lumotlar..."
                            className="border border-[#C7C4D8] rounded-lg w-full p-2 text-[14px] outline-none h-[60px] resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Password</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Lock className="w-[16px] h-[16px] text-[#C7C4D8]" />
                            </div>
                            <input
                                {...register("password")}
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter Password"
                                className={`border rounded-lg w-full h-[40px] pl-[40px] pr-[40px] text-[14px] outline-none ${errors.password ? "border-red-300" : "border-[#C7C4D8]"}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C7C4D8] hover:text-[#4338CA] transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-[16px] h-[16px]" /> : <Eye className="w-[16px] h-[16px]" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-400 text-[11px] mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-[40px] mt-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-indigo-300 text-white rounded-lg text-[14px] font-bold transition-colors cursor-pointer"
                    >
                        {isPending ? "Adding Student..." : "Add Student"}
                    </button>
                </form>
            </div>
        </div>
    );
}