"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { X, Loader2, ChevronDown, Search, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import Title from "@/components/ui/Title";
import Text from "@/components/ui/Text";

export interface IStudent {
    id: string;
    student_id: string;
    full_name: string;
    avatar?: string;
    phone: string;
    email: string;
    center_name?: string;
    date_of_birth: string;
    notes?: string;
    status: "active" | "inactive" | "pending";
    enrolled_at: string;
}

interface EditStudentModalProps {
    student: IStudent;
    onClose: () => void;
}

interface IEditStudentPayload {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
    center: string; // Backendga tahrirlashda ID ketadi
    date_of_birth: string;
    notes?: string;
    status: "active" | "inactive" | "pending";
}

function formatUzPhone(raw: string): string {
    const d = raw.slice(0, 9);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2, 5)}`;
    if (d.length <= 7) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`;
}

export default function EditStudentModal({ student, onClose }: EditStudentModalProps) {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    const [phoneDisplay, setPhoneDisplay] = useState("");
    const [isCenterOpen, setIsCenterOpen] = useState(false);
    const [centerSearch, setCenterSearch] = useState("");

    const [selectedCenter, setSelectedCenter] = useState<{ id: string; name: string } | null>(() => {
        if (student.center_name) {
            return { id: "", name: student.center_name };
        }
        return null;
    });

    const dropdownRef = useRef<HTMLDivElement>(null);

    const nameParts = student.full_name ? student.full_name.trim().split(" ") : [];
    const defaultFirstName = nameParts[0] || "";
    const defaultLastName = nameParts.slice(1).join(" ") || "";

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<IEditStudentPayload>({
        defaultValues: {
            first_name: defaultFirstName,
            last_name: defaultLastName,
            phone: student.phone || "",
            email: student.email || "",
            center: "",
            date_of_birth: student.date_of_birth || "",
            status: student.status || "active",
            notes: student.notes || "",
        },
    });

    // 1. Barcha o'quv markazlari ro'yxatini olish
    const { data: centersData, isLoading: isCentersLoading } = useQuery({
        queryKey: ["centers-list"],
        queryFn: async () => {
            const res = await API.get("super-admin/centers/");
            return res.data.results || res.data || [];
        }
    });

    // Tashqariga bosganda dropdown yopilishi uchun
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsCenterOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Telefon raqamini formatlash
    useEffect(() => {
        if (student.phone) {
            const clean = student.phone.replace("+998", "").replace(/\D/g, "");
            setPhoneDisplay(formatUzPhone(clean));
            setValue("phone", student.phone);
        }
    }, [student.phone, setValue]);

    // MUAMMONI YECHIMI: Ro'yxat kelganda student.center_name orqali mos keluvchi center ID sini topish
    useEffect(() => {
        if (student.center_name && Array.isArray(centersData) && centersData.length > 0) {
            const found = centersData.find(
                (c: any) => String(c.name).toLowerCase() === String(student.center_name).toLowerCase()
            );
            if (found) {
                setSelectedCenter({ id: String(found.id), name: found.name });
                setValue("center", String(found.id), { shouldValidate: true });
            }
        }
    }, [student.center_name, centersData, setValue]);

    // Front-end qidiruv mantiqi
    const filteredCenters = Array.isArray(centersData)
        ? centersData.filter((c: any) => c.name.toLowerCase().includes(centerSearch.toLowerCase()))
        : [];

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        const local = raw.slice(0, 9);
        setPhoneDisplay(formatUzPhone(local));
        const full = "+998" + local;
        setValue("phone", full, { shouldValidate: true });
    };

    const { mutate: updateStudent, isPending } = useMutation({
        mutationFn: async (payload: IEditStudentPayload) => {
            return await API.put(`students/${student.id}/`, payload);
        },
        onSuccess: () => {
            toast.success(t("students.toast.editSuccess", "Talaba ma'lumotlari muvaffaqiyatli yangilandi"));
            queryClient.invalidateQueries({ queryKey: ["students"] });
            onClose();
        },
        onError: (err: any) => {
            const backendError = err?.response?.data;
            if (backendError && backendError.center) {
                toast.error(`Center Error: ${backendError.center[0]}`);
            } else {
                toast.error(backendError?.message || t("students.toast.editError", "Yangilashda xatolik yuz berdi"));
            }
        },
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 border border-slate-100 dark:border-slate-800 flex flex-col my-auto">

                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
                    <div>
                        <div className="mb-[10px] border-slate-300 dark:border-slate-700 border shadow-sm w-[44px] h-[44px] rounded-lg flex justify-center items-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/10 dark:bg-indigo-500/10">
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className="text-slate-800 dark:text-slate-100 text-[18px] font-semibold">
                            {t("students.modal.editTitle")}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit((data) => updateStudent(data))}
                    className="p-6 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Ism */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5 tracking-wider">
                                {t("students.modal.firstName", "Ism")}
                            </label>
                            <input
                                type="text"
                                {...register("first_name", { required: t("students.validation.firstName", "Ism kiritilishi shart") })}
                                className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-100 shadow-xs"
                            />
                            {errors.first_name && <p className="text-[11px] text-red-500 mt-1">{errors.first_name.message}</p>}
                        </div>

                        {/* Familiya */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5 tracking-wider">
                                {t("students.modal.lastName", "Familiya")}
                            </label>
                            <input
                                type="text"
                                {...register("last_name", { required: t("students.validation.lastName", "Familiya kiritilishi shart") })}
                                className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-100 shadow-xs"
                            />
                            {errors.last_name && <p className="text-[11px] text-red-500 mt-1">{errors.last_name.message}</p>}
                        </div>

                        {/* Telefon raqam */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5 tracking-wider">
                                {t("students.modal.phone", "Telefon raqam")}
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3.5 flex items-center gap-1.5 select-none pointer-events-none">
                                    <span className="text-base leading-none">🇺🇿</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">+998</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phoneDisplay}
                                    onChange={handlePhoneChange}
                                    placeholder="90-123-45-67"
                                    className="w-full h-11 pl-[92px] pr-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-100 shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5 tracking-wider">
                                {t("students.modal.email", "Email")}
                            </label>
                            <input
                                type="email"
                                {...register("email", { required: t("students.validation.email", "Email manzili shart") })}
                                className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-100 shadow-xs"
                            />
                            {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5 tracking-wider">
                                {t("students.modal.status", "Status")}
                            </label>
                            <select
                                {...register("status")}
                                className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-100 cursor-pointer shadow-xs"
                            >
                                <option value="active">{t("students.status.active", "Active")}</option>
                                <option value="inactive">{t("students.status.inactive", "Inactive")}</option>
                                <option value="pending">{t("students.status.pending", "Pending")}</option>
                            </select>
                        </div>

                        {/* Learning Center Custom Select */}
                        <div className="relative" ref={dropdownRef}>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5 tracking-wider">
                                {t("students.modal.learningCenter", "O'quv markazi")}
                            </label>

                            {/* Dropdown Tanlagich - student.center_name bo'yicha default qiymat chiqadi */}
                            <div
                                className="w-full h-11 px-3.5 flex items-center justify-between cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 transition-all text-sm text-slate-800 dark:text-slate-100 shadow-xs"
                                onClick={() => setIsCenterOpen(!isCenterOpen)}
                            >
                                <span className="truncate max-w-[180px]">
                                    {selectedCenter ? (
                                        selectedCenter.name
                                    ) : isCentersLoading ? (
                                        <span className="text-slate-400 text-xs flex items-center gap-1">
                                            <Loader2 className="w-3 h-3 animate-spin" /> {t("students.modal.loading", "Yuklanmoqda...")}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-xs">{t("students.modal.placeholder.center", "Select center...")}</span>
                                    )}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCenterOpen ? "rotate-180" : ""}`} />
                            </div>

                            {/* Dropdown Menu */}
                            {isCenterOpen && (
                                <div className="absolute w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-1 flex flex-col">
                                    {/* Qidiruv Inputi */}
                                    <div className="flex items-center gap-2 border-b dark:border-slate-700 pb-2 mb-2 sticky top-0 bg-white dark:bg-slate-800 z-10">
                                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                        <input
                                            autoFocus
                                            value={centerSearch}
                                            placeholder={t("students.modal.placeholder.search", "Qidirish...")}
                                            className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                                            onChange={(e) => setCenterSearch(e.target.value)}
                                        />
                                    </div>

                                    {/* Ichki Scroll bo'ladigan qism */}
                                    <div className="max-h-[160px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/50 custom-scrollbar">
                                        {isCentersLoading ? (
                                            <p className="text-center py-2 text-xs text-slate-400">{t("students.modal.loading", "Yuklanmoqda...")}</p>
                                        ) : filteredCenters.length > 0 ? (
                                            filteredCenters.map((c: any) => (
                                                <div
                                                    key={c.id}
                                                    className={`px-3 py-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 cursor-pointer rounded-md text-sm transition-colors
                                                    ${selectedCenter?.id === String(c.id) ? "bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium" : "text-slate-800 dark:text-slate-200"}`}
                                                    onClick={() => {
                                                        setSelectedCenter({ id: String(c.id), name: c.name });
                                                        setValue("center", String(c.id), { shouldValidate: true });
                                                        setIsCenterOpen(false);
                                                        setCenterSearch("");
                                                    }}
                                                >
                                                    {c.name}
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center py-3 text-xs text-slate-400 dark:text-slate-500">
                                                {t("students.modal.notFound", "Topilmadi")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tug'ilgan sana */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5 tracking-wider">
                                {t("students.modal.dob", "Tug'ilgan sana")}
                            </label>
                            <input
                                type="date"
                                {...register("date_of_birth")}
                                className="w-full h-11 px-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-100 shadow-xs dark:[color-scheme:dark]"
                            />
                        </div>
                    </div>

                    {/* Eslatmalar */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1.5 tracking-wider">
                            {t("students.modal.notes", "Eslatmalar (Notes)")}
                        </label>
                        <textarea
                            rows={3}
                            placeholder={t("students.modal.placeholder.notes", "Additional notes about the student...")}
                            {...register("notes")}
                            className="w-full p-3.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-800 dark:text-slate-100 resize-none shadow-xs"
                        />
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50 mt-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isPending}
                            className="h-10 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                            {t("students.modal.cancel", "Bekor qilish")}
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center justify-center gap-2 h-10 px-5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-lg transition-colors cursor-pointer disabled:opacity-70 min-w-[120px] shadow-sm"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    {t("students.modal.savingStatus", "Saqlanmoqda...")}
                                </>
                            ) : (
                                t("students.modal.saveBtn", "Saqlash")
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}