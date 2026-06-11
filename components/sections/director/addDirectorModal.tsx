"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { X, Loader2, Upload, ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const getDirectorSchema = (t: any) =>
    yup.object({
        first_name: yup
            .string()
            .required(t("director.validation.firstNameRequired")),

        last_name: yup
            .string()
            .required(t("director.validation.lastNameRequired")),

        phone: yup
            .string()
            .required(t("director.validation.phoneRequired"))
            .test(
                "len",
                t("director.validation.phoneInvalid"),
                (val) => val?.replace(/\D/g, "").length === 12
            ),

        email: yup
            .string()
            .email(t("director.validation.emailInvalid"))
            .required(t("director.validation.emailRequired")),

        password: yup
            .string()
            .required(t("director.validation.passwordRequired"))
            .min(6, t("director.validation.passwordMin"))
    }).required();

type FormData = yup.InferType<ReturnType<typeof getDirectorSchema>>;

export default function AddDirectorModal({ onClose }: { onClose?: () => void }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Har safar til o'zgarganda yangi 't' bilan resolver ishlaydi
    const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(getDirectorSchema(t))
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const { mutate: createDirector, isPending } = useMutation({
        mutationFn: (data: FormData) => {
            const formData = new FormData();
            formData.append("first_name", data.first_name);
            formData.append("last_name", data.last_name);
            formData.append("phone", data.phone.replace(/\D/g, ""));
            formData.append("email", data.email);
            formData.append("password", data.password);

            if (avatar) {
                formData.append("avatar", avatar);
            }

            return API.post("super-admin/directors/", formData);
        },
        onSuccess: () => {
            toast.success(t("directors.success_message") || "Yangi direktor muvaffaqiyatli qo'shildi!");
            queryClient.invalidateQueries({ queryKey: ["directors"] });
            onClose?.();
        },
        onError: (error: any) => {
            const responseData = error?.response?.data;

            if (responseData && typeof responseData === 'object') {
                Object.keys(responseData).forEach((key) => {
                    const fieldErrors = responseData[key];
                    if (Array.isArray(fieldErrors)) {
                        fieldErrors.forEach((msg) => toast.error(`${msg}`));
                    } else if (typeof fieldErrors === 'string') {
                        toast.error(fieldErrors);
                    }
                });
            } else {
                toast.error(t("common.error") || "Tizimda xatolik yuz berdi. Qaytadan urinib ko'ring.");
            }
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content - max-h va overflow-y-auto qo'shildi */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl max-w-xl w-full relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors max-h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
                {/* Yopish tugmasiga z-20 qo'shildi, scroll bo'lganda inputlar ostida qolib ketmasligi uchun */}
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-20 cursor-pointer">
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
                    {t("directors.add_title")}
                </h3>

                <form onSubmit={handleSubmit((data) => createDirector(data))} className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                                {t("directors.first_name")}
                            </label>
                            <input
                                {...register("first_name")}
                                placeholder={t("directors.placeholder_first_name") || "Xusan"}
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors
                                ${errors?.first_name?.message
                                        ? "border-red-300 dark:border-red-800 bg-red-50/10 focus:border-red-500"
                                        : "border-slate-200 dark:border-slate-700"
                                    }`}
                            />
                            {errors.first_name && <p className="text-red-400 dark:text-red-500 text-[11px] mt-1">{errors.first_name.message}</p>}
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                                {t("directors.last_name")}
                            </label>
                            <input
                                {...register("last_name")}
                                placeholder={t("directors.placeholder_last_name") || "Yarashev"}
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors
                                ${errors?.last_name?.message
                                        ? "border-red-300 dark:border-red-800 bg-red-50/10 focus:border-red-500"
                                        : "border-slate-200 dark:border-slate-700"
                                    }`}
                            />
                            {errors?.last_name && <p className="text-red-400 dark:text-red-500 text-[11px] mt-1">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    <div>
                        <Controller
                            name="phone"
                            control={control}
                            render={({ field }) => (
                                <PhoneInput value={field.value || ""} onChange={field.onChange} error={errors.phone?.message} />
                            )}
                        />
                    </div>

                    {/* Email Input */}
                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                            {t("directors.email")}
                        </label>
                        <input
                            {...register("email")}
                            placeholder="example@edumrx.uz"
                            className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors
                            ${errors?.email?.message
                                    ? "border-red-300 dark:border-red-800 bg-red-50/10 focus:border-red-500"
                                    : "border-slate-200 dark:border-slate-700"
                                }`}
                        />
                        {errors?.email && <p className="text-red-400 dark:text-red-500 text-[11px] mt-1">{errors?.email?.message}</p>}
                    </div>

                    {/* Password Input */}
                    <div>
                        <PasswordInput register={register("password")} error={errors.password?.message} />
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-10 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center transition-colors disabled:opacity-60 shadow-md active:scale-[0.99] cursor-pointer"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("directors.create_btn")}
                    </button>
                </form>
            </div>
        </div>
    );
}