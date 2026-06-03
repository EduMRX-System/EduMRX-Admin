"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { ILearningCenter } from "@/types";
import { X, Loader2, Building2, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { t } from "i18next";

interface EditModalProps {
    center: ILearningCenter;
    onClose: () => void;
}

export default function EditLearningCenterModal({ center, onClose }: EditModalProps) {
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State o'zgaruvchilari
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        phone: "",
        email: "",
        address: "",
        director: "",
        status: "active",
        subscription_expires: ""
    });

    // Tanlangan yangi fayl yoki mavjud logotipning eski URL manzili uchun alohida statelar
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");

    // Telefon raqamini real vaqtda formatlash maskasi
    const formatPhoneInput = (value: string) => {
        const digits = value.replace(/\D/g, "");
        if (!digits.startsWith("998")) {
            return "+998 ";
        }

        let formatted = "+998 ";
        if (digits.length > 3) formatted += `(${digits.slice(3, 5)}`;
        if (digits.length > 5) formatted += `) ${digits.slice(5, 8)}`;
        if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
        if (digits.length > 10) formatted += `-${digits.slice(10, 12)}`;

        return formatted.trim();
    };

    // Komponent yuklanganda eski ma'lumotlarni formaga to'ldirish
    useEffect(() => {
        if (center) {
            setFormData({
                name: center.name || "",
                slug: center.slug || "",
                phone: center.phone ? formatPhoneInput(center.phone) : "+998 ",
                email: center.email || "",
                address: center.address || "",
                director: (center as any).director || "",
                status: center.status || "active",
                subscription_expires: center.subscription_expires ? center.subscription_expires.split("T")[0] : ""
            });
            // Agar backenddan eski rasm URL kelgan bo'lsa, uni ko'rsatib turamiz
            setLogoPreview(center.logo || "");
        }
    }, [center]);

    // Rasm tanlanganda ishga tushadigan funksiya
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            // Tanlangan rasmni ssenariyda vaqtinchalik ko'rish (Preview) uchun URL generatsiya qilish
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    // Mutatsiya - Multipart/Form-Data ko'rinishida jo'natish
    const { mutate: updateCenter, isPending } = useMutation({
        mutationFn: async () => {
            // CRITICAL: Rasmlar bilan ishlash uchun FormData yaratamiz
            const data = new FormData();

            data.append("name", formData.name);
            data.append("slug", formData.slug);
            data.append("phone", formData.phone.replace(/\D/g, "")); // Toza raqam
            data.append("email", formData.email);
            data.append("address", formData.address);
            data.append("director", formData.director);
            data.append("status", formData.status);
            data.append("subscription_expires", formData.subscription_expires);

            // Agar foydalanuvchi yangi rasm tanlagan bo'lsa, faylni yuklaymiz
            if (logoFile) {
                data.append("logo", logoFile);
            }

            // API so'rovi headers qismida multipart/form-data ekanini ko'rsatish shart emas, 
            // brauzer FormData obyektini ko'rib o'zi avtomat qo'shib oladi.
            await API.put(`/api/v1/super-admin/centers/${center.id}/`, data);
        },
        onSuccess: () => {
            toast.success("O'quv markazi muvaffaqiyatli yangilandi!");
            queryClient.invalidateQueries({ queryKey: ["learning-centers"] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || err?.message || "Yangilashda xatolik yuz berdi");
        }
    });

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        if (inputVal.length < 5) {
            setFormData({ ...formData, phone: "+998 " });
            return;
        }
        setFormData({ ...formData, phone: formatPhoneInput(inputVal) });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateCenter();
    };

    return (
        <div className="fixed inset-0 z-50 p-4">
            <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 transform transition-all duration-500 ease-out">

                    <div className="flex items-center justify-between shrink-0">
                        <div>
                            <div className="mb-[10px] border border-slate-200 dark:border-slate-700 shadow-sm w-[44px] h-[44px] rounded-lg flex justify-center items-center text-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-slate-900 dark:text-slate-100 text-[18px] font-semibold mb-4">
                                {t("centers.edit_title")}
                            </h3>
                        </div>
                        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Logo */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{t("centers.logo")}</label>
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl transition-colors">
                                <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Building2 className="w-6 h-6 text-slate-400" />
                                    )}
                                </div>
                                <div className="flex flex-col items-start gap-1">
                                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-2 h-9 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg shadow-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer">
                                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                                        {t("centers.choose_image")}
                                    </button>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        {t("centers.image_hint_edit")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Name & Slug */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{t("centers.center_name")} *</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-slate-800 dark:text-slate-100"
                                    required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{t("centers.slug")} *</label>
                                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                                    className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-slate-800 dark:text-slate-100 font-mono"
                                    required />
                            </div>
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{t("common.phone")} *</label>
                                <input type="tel" value={formData.phone} onChange={handlePhoneChange} placeholder="+998 (90) 123-45-67" maxLength={19}
                                    className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-slate-800 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                    required />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{t("directors.email")} *</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-slate-800 dark:text-slate-100"
                                    required />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{t("centers.address")} *</label>
                            <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-slate-800 dark:text-slate-100"
                                required />
                        </div>

                        {/* Status & Subscription */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{t("centers.col_status")} *</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-slate-800 dark:text-slate-100 cursor-pointer">
                                    <option value="active">{t("centers.status.active")}</option>
                                    <option value="pending">{t("centers.status.pending")}</option>
                                    <option value="inactive">{t("centers.status.inactive")}</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">{t("centers.subscription_expires")} *</label>
                                <input type="date" value={formData.subscription_expires} onChange={(e) => setFormData({ ...formData, subscription_expires: e.target.value })}
                                    className="w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-slate-800 dark:text-slate-100"
                                    required />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                            <button type="button" onClick={onClose}
                                className="h-10 px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold rounded-lg shadow-xs cursor-pointer transition-colors">
                                {t("common.cancel")}
                            </button>
                            <button type="submit" disabled={isPending}
                                className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-xs disabled:opacity-60 cursor-pointer transition-colors">
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{t("centers.saving")}</span>
                                    </>
                                ) : t("centers.save_btn")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}