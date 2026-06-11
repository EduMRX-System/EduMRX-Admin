"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { X, Loader2, Upload, ImageIcon, User } from "lucide-react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import { PhoneInput } from "@/components/ui/PhoneInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import Image from "next/image";

// Dinamik i18next validation sxemasi
const getEditDirectorSchema = (t: any) =>
    yup.object({
        first_name: yup.string().required(t("director.validation.firstNameRequired")),
        last_name: yup.string().required(t("director.validation.lastNameRequired")),
        phone: yup.string().required(t("director.validation.phoneRequired"))
            .test("len", t("director.validation.phoneInvalid"), val => val?.replace(/\D/g, "").length === 12),
        email: yup.string().email(t("director.validation.emailInvalid")).required(t("director.validation.emailRequired")),
        password: yup.string()
            .transform((value) => (value === "" ? undefined : value))
            .nullable()
            .optional()
            .test("len", t("director.validation.passwordMin"), val => !val || val.length >= 6)
    }).required();

type FormData = yup.InferType<ReturnType<typeof getEditDirectorSchema>>;

export default function EditDirectorModal({ director, onClose }: { director: any; onClose?: () => void }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);

    // Avatar states
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, control, setValue, setError, formState: { errors } } = useForm({
        resolver: yupResolver(getEditDirectorSchema(t)),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            password: ""
        }
    });

    useEffect(() => {
        setIsMounted(true);
        if (director) {
            if (director.first_name || director.last_name) {
                setValue("first_name", director.first_name || "");
                setValue("last_name", director.last_name || "");
            } else if (director.full_name) {
                const nameParts = director.full_name.trim().split(/\s+/);
                if (nameParts.length === 1) {
                    setValue("first_name", nameParts[0]);
                    setValue("last_name", "");
                } else {
                    setValue("first_name", nameParts[0]);
                    setValue("last_name", nameParts.slice(1).join(" "));
                }
            }

            setValue("email", director.email || "");
            setValue("phone", director.phone || "");

            if (director.avatar) {
                setAvatarPreview(director.avatar);
            }
        }
    }, [director, setValue]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const { mutate: updateDirector, isPending } = useMutation({
        mutationFn: (body: FormData) => {
            const formData = new FormData();
            formData.append("first_name", body.first_name);
            formData.append("last_name", body.last_name);
            formData.append("email", body.email);
            formData.append("phone", body.phone.replace(/\D/g, ""));

            if (body.password) {
                formData.append("password", body.password);
            }

            if (avatar) {
                formData.append("avatar", avatar);
            }

            return API.put(`super-admin/directors/${director.id}/`, formData);
        },
        onSuccess: () => {
            toast.success(t("directors.update_success_message") || "Director muvaffaqiyatli yangilandi!");
            queryClient.invalidateQueries({ queryKey: ["directors"] });
            onClose?.();
        },
        onError: (err: any) => {
            const serverErrors = err?.response?.data;

            if (serverErrors && typeof serverErrors === "object") {
                Object.keys(serverErrors).forEach((key) => {
                    const errorValue = serverErrors[key];
                    const errorMessage = Array.isArray(errorValue) ? errorValue[0] : errorValue;

                    if (errorMessage) {
                        toast.error(errorMessage);
                        setError(key as any, {
                            type: "server",
                            message: errorMessage
                        });
                    }
                });
            } else {
                toast.error(t("common.error") || "Xatolik yuz berdi. Qaytadan urinib ko'ring.");
            }
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Orqa fon (Backdrop) - fixed qoladi */}
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Konteyneri - max-h orqali balandlik cheklanadi va ichki scroll yoqiladi */}
            <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-xl max-w-xl w-full relative z-10 shadow-2xl transition-all duration-200 overflow-y-auto max-h-[calc(100vh-2rem)] custom-scrollbar ${isMounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>

                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer z-20">
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-[10px] border-slate-300 dark:border-slate-700 border shadow-sm w-[44px] h-[44px] rounded-lg flex justify-center items-center text-indigo-600 dark:text-indigo-400 bg-indigo-50/10 dark:bg-indigo-500/10">
                    <User className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
                    {t("directors.edit_title")}
                </h3>

                <form onSubmit={handleSubmit((data) => updateDirector(data))} className="space-y-4">
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

                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                            {t("directors.email")}
                        </label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="example@edumrx.uz"
                            className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors
                        ${errors?.email?.message
                                    ? "border-red-300 dark:border-red-800 bg-red-50/10 focus:border-red-500"
                                    : "border-slate-200 dark:border-slate-700"
                                }`}
                        />
                        {errors?.email && <p className="text-red-400 dark:text-red-500 text-[11px] mt-1">{errors?.email?.message}</p>}
                    </div>

                    <div>
                        <PasswordInput register={register("password")} error={errors.password?.message} />
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-1">
                            {t("directors.password_hint") || "* Parolni o'zgartirmoqchi bo'lsangizgina kiriting, aks holda bo'sh qoldiring."}
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-10 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center transition-colors disabled:opacity-60 shadow-md active:scale-[0.99] cursor-pointer"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : t("directors.save_btn")}
                    </button>
                </form>
            </div>
        </div>
    );
}