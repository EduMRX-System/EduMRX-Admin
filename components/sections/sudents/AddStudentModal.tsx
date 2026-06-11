"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { User, Eye, EyeOff, Notebook, X, Loader2, ChevronRight, ChevronLeft, Check } from "lucide-react";
import { toast } from "react-toastify";

import { ChevronDown, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { t } from "i18next";
import { IAPIResponse, ILearningCenter } from "@/types";
import { useDebounce } from "use-debounce";

// Backenddan keladigan umumiy paginatsiya formati uchun generic interfeys
export interface IPaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

function formatUzPhone(raw: string): string {
    const d = raw.slice(0, 9);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2, 5)}`;
    if (d.length <= 7) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`;
}

// 1. Statusdan frozen olib tashlandi va faqat active/inactive qoldirildi
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
        .required("Parol kiritilishi shart")
        .min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
    center: yup.string().uuid("O'quv markazi UUID formatida bo'lishi shart").required("Markazni tanlash shart"),
    date_of_birth: yup.string().required("Tug'ilgan sana kiritilishi shart"),
    notes: yup.string().optional(),
    status: yup.string().oneOf(["active", "inactive"] as const).required("Status shart"),
}).required();

type FormData = yup.InferType<typeof schema>;

interface AddStudentModalProps {
    onClose: () => void;
}

export default function AddStudentModal({ onClose }: AddStudentModalProps) {
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const [phoneDisplay, setPhoneDisplay] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isCenterOpen, setIsCenterOpen] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState<{ id: string, name: string } | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            status: "active",
            date_of_birth: new Date().toISOString().split('T')[0],
        }
    });

    const { mutate: addStudent, isPending } = useMutation({
        mutationFn: async (body: FormData) => {
            const res = await API.post("super-admin/students/", body, {
                headers: {
                    "Content-Type": "application/json",
                },
            });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data?.message || "Talaba muvaffaqiyatli qo'shildi!");
            reset();
            setPhoneDisplay("");
            setShowPassword(false);
            setSelectedCenter(null);

            queryClient.invalidateQueries({
                queryKey: ["students-list"],
            });
            onClose();
        },
        onError: (err: any) => {
            const errorData = err?.response?.data;
            if (errorData && typeof errorData.detail === 'string') {
                if (errorData.detail.includes("users_email_key")) {
                    return toast.error("Bu email bilan foydalanuvchi allaqachon mavjud!");
                }
                return toast.error(errorData.detail);
            }

            if (errorData && errorData.email) {
                const emailError = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
                const cleanMessage = emailError.replace(/["']/g, "");
                return toast.error(cleanMessage);
            }

            if (errorData && typeof errorData === 'object') {
                const firstKey = Object.keys(errorData)[0];
                if (firstKey) {
                    const errorMessage = errorData[firstKey];
                    const text = Array.isArray(errorMessage) ? errorMessage[0] : errorMessage;
                    const cleanText = typeof text === 'string' ? text.replace(/["']/g, "") : text;
                    return toast.error(`${firstKey}: ${cleanText}`);
                }
            }

            toast.error("Tizimda xatolik yuz berdi, keyinroq urinib ko'ring.");
        }
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
        addStudent(data);
    };

    const [centerSearch, setCenterSearch] = useState("");
    const [centerPage, setCenterPage] = useState(1);
    const centerPageSize = 5;

    // Input qiymati 500ms ga debounce qilindi
    const [debouncedCenterSearch] = useDebounce(centerSearch, 500);

    // 2. Query key qismiga xavfsiz bo'lishi uchun debouncedCenterSearch o'tkazildi
    const { data: centersData, isLoading: isCentersLoading } = useQuery<IAPIResponse<ILearningCenter>>({
        queryKey: ["centers-list", centerPage, debouncedCenterSearch],
        queryFn: async () => {
            const res = await API.get("super-admin/centers/", {
                params: {
                    page: centerPage,
                    search: debouncedCenterSearch,
                    page_size: centerPageSize,
                },
            });
            return res.data;
        },
    });

    const centersList = centersData?.results || [];
    const totalCenterPages = centersData ? Math.ceil(centersData.count / centerPageSize) : 1;

    const handleCenterSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCenterSearch(e.target.value);
        setCenterPage(1);
    };

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentStatus = watch("status") || "active";

    // 3. Variantlarga qat'iy tip barqarorligi uchun "as const" qo'shildi
    const statusOptions = [
        { value: "active" as const, label: t("students.status.active", "Faol"), color: "bg-green-500" },
        { value: "inactive" as const, label: t("students.status.inactive", "Nofaol"), color: "bg-rose-500" },
    ];

    const selectedOption = statusOptions.find(opt => opt.value === currentStatus) || statusOptions[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                isOpen && setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* BACKDROP */}
            <div
                className={`fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            {/* MODAL BODY */}
            <div
                className={`bg-white dark:bg-slate-900 p-6 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 transform transition-all duration-500 ease-out ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-12 scale-95"}`}
            >
                <div className="flex items-center relative justify-between mb-4 ">
                    <div>
                        <div className="mb-[10px] border-slate-300 dark:border-slate-700 border shadow-sm w-[44px] h-[44px] rounded-lg flex justify-center items-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/10 dark:bg-indigo-500/10">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-slate-800 dark:text-slate-100 text-[18px] font-semibold">
                            {t("students.modal.addTitle", "Add New Student")}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer border-none bg-transparent transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* FIRST & LAST NAME */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-slate-700 dark:text-slate-300 mb-1 block font-semibold">
                                {t("students.modal.firstName", "First Name")}
                            </label>
                            <input
                                {...register("first_name")}
                                type="text"
                                placeholder={t("students.modal.placeholder.firstName", "John")}
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] bg-transparent text-slate-900 dark:text-slate-100 outline-none transition-all ${errors.first_name ? "border-red-400 bg-red-50/10 dark:bg-red-950/10" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"}`}
                            />
                            {errors.first_name && (
                                <p className="text-red-400 text-[11px] mt-1">{errors.first_name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-[14px] text-slate-700 dark:text-slate-300 mb-1 block font-semibold">
                                {t("students.modal.lastName", "Last Name")}
                            </label>
                            <input
                                {...register("last_name")}
                                type="text"
                                placeholder={t("students.modal.placeholder.lastName", "Doe")}
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] bg-transparent text-slate-900 dark:text-slate-100 outline-none transition-all ${errors.last_name ? "border-red-400 bg-red-50/10 dark:bg-red-950/10" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"}`}
                            />
                            {errors.last_name && (
                                <p className="text-red-400 text-[11px] mt-1">{errors.last_name.message}</p>
                            )}
                        </div>
                    </div>

                    {/* PHONE & PASSWORD */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-slate-700 dark:text-slate-300 mb-1 block font-semibold">
                                {t("students.modal.phone", "Phone Number")}
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 flex items-center gap-1.5 select-none pointer-events-none">
                                    <span className="text-base leading-none">🇺🇿</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">+998</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phoneDisplay}
                                    onChange={handlePhoneChange}
                                    placeholder="90-123-45-67"
                                    className={`border rounded-lg w-full h-[40px] pl-[90px] pr-[10px] text-[14px] bg-transparent text-slate-900 dark:text-slate-100 outline-none transition-all ${errors.phone ? "border-red-400 bg-red-50/10 dark:bg-red-950/10" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"}`}
                                />
                            </div>
                            {errors.phone && (
                                <p className="text-red-400 text-[11px] mt-1 ml-1">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="text-[14px] text-slate-700 dark:text-slate-300 mb-1 block font-semibold">
                                {t("students.modal.password", "Password")}
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className={`border rounded-lg w-full h-[40px] pl-3 pr-[40px] text-[14px] bg-transparent text-slate-900 dark:text-slate-100 outline-none transition-all ${errors.password ? "border-red-400 bg-red-50/10 dark:bg-red-950/10" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-0.5 rounded-sm focus:outline-none border-none bg-transparent flex items-center"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-[11px] mt-1">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    {/* EMAIL & DOB */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-slate-700 dark:text-slate-300 mb-1 block font-semibold">
                                {t("students.modal.email", "Email Address")}
                            </label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="student@example.com"
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] bg-transparent text-slate-900 dark:text-slate-100 outline-none transition-all ${errors.email ? "border-red-400 bg-red-50/10 dark:bg-red-950/10" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"}`}
                            />
                            {errors.email && (
                                <p className="text-red-400 text-[11px] mt-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="text-[14px] text-slate-700 dark:text-slate-300 mb-1 block font-semibold">
                                {t("students.modal.dob", "Date of Birth")}
                            </label>
                            <input
                                {...register("date_of_birth")}
                                type="date"
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] bg-transparent text-slate-900 dark:text-slate-100 outline-none transition-all dark:[color-scheme:dark] ${errors.date_of_birth ? "border-red-400" : "border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"}`}
                            />
                            {errors.date_of_birth && (
                                <p className="text-red-400 text-[11px] mt-1">{errors.date_of_birth.message}</p>
                            )}
                        </div>
                    </div>

                    {/* STATUS & LEARNING CENTER */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative w-full" ref={dropdownRef}>
                            <label className="text-[14px] text-slate-700 dark:text-slate-300 mb-1 block font-semibold">
                                {t("students.modal.status", "Status")}
                            </label>

                            <div
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full h-[40px] px-3 flex items-center justify-between cursor-pointer bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[14px] text-slate-900 dark:text-slate-100 hover:border-indigo-500 dark:hover:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-500 transition-all select-none shadow-xs"
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${selectedOption.color}`} />
                                    <span>{selectedOption.label}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                            </div>

                            {isOpen && (
                                <div className="absolute w-full top-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 p-1">
                                    {statusOptions.map((option) => {
                                        const isSelected = option.value === watch("status");
                                        return (
                                            <div
                                                key={option.value}
                                                onClick={() => {
                                                    setValue("status", option.value, { shouldValidate: true });
                                                    setIsOpen(false);
                                                }}
                                                className={`px-3 py-2 text-[14px] rounded-md cursor-pointer transition-colors flex items-center justify-between 
                                                ${isSelected
                                                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium"
                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${option.color}`} />
                                                    <span>{option.label}</span>
                                                </div>
                                                {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* ADVANCED LEARNING CENTER DROPDOWN */}
                        <div className="relative">
                            <label className="text-[14px] text-slate-700 dark:text-slate-300 mb-1 block font-semibold">
                                {t("students.modal.learningCenter", "Learning Center")}
                            </label>
                            <div
                                className={`border rounded-lg w-full h-[40px] px-3 flex items-center justify-between cursor-pointer bg-white dark:bg-slate-900 transition-all ${errors.center ? "border-red-400" : "border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400"}`}
                                onClick={() => setIsCenterOpen(!isCenterOpen)}
                            >
                                <span className={selectedCenter ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}>
                                    {selectedCenter ? selectedCenter.name : t("students.modal.placeholder.center", "Markazni tanlang...")}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCenterOpen ? "rotate-180" : ""}`} />
                            </div>

                            {isCenterOpen && (
                                <div className="absolute w-full bottom-full mb-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 p-2 animate-in fade-in slide-in-from-bottom-1">
                                    {/* SEARCH INPUT */}
                                    <div className="flex items-center gap-2 border-b dark:border-slate-700 pb-2 mb-2 px-1">
                                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                        <input
                                            autoFocus
                                            value={centerSearch}
                                            placeholder={t("students.modal.placeholder.search", "Qidirish...")}
                                            className="w-full bg-transparent outline-none text-[14px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                            onChange={handleCenterSearchChange}
                                        />
                                        {centerSearch && (
                                            <button
                                                type="button"
                                                onClick={() => { setCenterSearch(""); setCenterPage(1); }}
                                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>

                                    {/* RESULTS LIST */}
                                    <div className="max-h-[160px] overflow-y-auto space-y-0.5 pr-1 [&::-webkit-scrollbar]:w-1">
                                        {isCentersLoading ? (
                                            <div className="flex items-center justify-center py-4 gap-2 text-xs text-slate-400 dark:text-slate-500">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                {t("students.modal.loading", "Yuklanmoqda...")}
                                            </div>
                                        ) : centersList.length > 0 ? (
                                            centersList.map((c: any) => (
                                                <div
                                                    key={c.id}
                                                    className={`px-3 py-2 text-[14px] rounded-md cursor-pointer transition-colors flex items-center justify-between ${selectedCenter?.id === c.id
                                                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium"
                                                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
                                                    onClick={() => {
                                                        setSelectedCenter({ id: c.id, name: c.name });
                                                        setValue("center", c.id, { shouldValidate: true });
                                                        setIsCenterOpen(false);
                                                    }}
                                                >
                                                    <span className="truncate">{c.name}</span>
                                                    {selectedCenter?.id === c.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">
                                                {t("students.modal.notFound", "Topilmadi")}
                                            </p>
                                        )}
                                    </div>

                                    {/* MINI PAGINATION CONTROL */}
                                    {!isCentersLoading && totalCenterPages > 1 && (
                                        <div className="flex items-center justify-between border-t dark:border-slate-700 pt-2 mt-2 px-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                            <span>
                                                {centerPage} / {totalCenterPages}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    disabled={centerPage === 1}
                                                    onClick={() => setCenterPage(p => Math.max(p - 1, 1))}
                                                    className="p-1 rounded bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200/60 dark:border-slate-600"
                                                >
                                                    <ChevronLeft className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={centerPage === totalCenterPages}
                                                    onClick={() => setCenterPage(p => Math.min(p + 1, totalCenterPages))}
                                                    className="p-1 rounded bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200/60 dark:border-slate-600"
                                                >
                                                    <ChevronRight className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {errors.center && (
                                <p className="text-red-400 text-[11px] mt-1">{errors.center.message}</p>
                            )}
                        </div>
                    </div>

                    {/* NOTES */}
                    <div>
                        <label className="text-[14px] text-slate-700 dark:text-slate-300 mb-1 block font-semibold">
                            {t("students.modal.notes", "Notes (Optional)")}
                        </label>
                        <div className="relative flex items-start">
                            <Notebook className="absolute left-3 top-3 w-4 h-4 text-slate-400 select-none pointer-events-none" />
                            <textarea
                                {...register("notes")}
                                placeholder={t("students.modal.placeholder.notes", "Additional notes about the student...")}
                                rows={2}
                                className="border border-slate-300 dark:border-slate-700 rounded-lg w-full pl-10 pr-3 py-2 text-[14px] bg-transparent text-slate-900 dark:text-slate-100 outline-none resize-none min-h-[60px] focus:border-indigo-500 dark:focus:border-indigo-400"
                            />
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-[40px] mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:disabled:bg-indigo-800 text-white rounded-lg text-[14px] font-bold transition-colors cursor-pointer flex items-center justify-center border-none select-none shadow-sm"
                    >
                        {isPending ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" /> {t("students.modal.addingStatus", "Adding Student...")}
                            </span>
                        ) : (
                            t("students.modal.addBtn", "Add Student")
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}