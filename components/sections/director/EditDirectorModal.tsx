"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { ShieldAlert, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

import { PhoneInput } from "@/components/ui/PhoneInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { IDirector } from "@/types"; // Turlar faylidan to'g'ri import qilindi
import { t } from "i18next";

const schema = yup.object({
    first_name: yup.string().required("Ism kiritilishi shart"),
    last_name: yup.string().required("Familiya kiritilishi shart"),
    phone: yup.string().required("Telefon raqami majburiy")
        .test("len", "Raqamni to'liq kiriting", val => val?.replace(/\D/g, "").length === 12),
    email: yup.string().email("Xato email formati").required("Email kiritilishi shart"),
    password: yup.string()
        .transform((value) => (value === "" ? undefined : value))
        .nullable()
        .optional()
        .test("len", "Parol kamida 6 ta belgi bo'lishi kerak", val => !val || val.length >= 6)
}).required();

type FormData = yup.InferType<typeof schema>;

export default function EditDirectorModal({ director, onClose }: { director: any; onClose?: () => void }) {
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);

    const { register, handleSubmit, control, setValue, setError, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
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
            // 1. Agar API dan bir marta alohida birinchi va oxirgi ism kelsa, o'shani to'g'ridan-to'g'ri qo'yamiz
            if (director.first_name || director.last_name) {
                setValue("first_name", director.first_name || "");
                setValue("last_name", director.last_name || "");
            }
            // 2. Agar faqat full_name satri kelsa, uni xavfsiz va aniq formatda ajratamiz
            else if (director.full_name) {
                const nameParts = director.full_name.trim().split(/\s+/); // Bir nechta bo'shliqlarni ham hisobga oladi
                if (nameParts.length === 1) {
                    setValue("first_name", nameParts[0]);
                    setValue("last_name", "");
                } else {
                    setValue("first_name", nameParts[0]); // Birinchi so'z - Ism
                    setValue("last_name", nameParts.slice(1).join(" ")); // Qolgan qismi - Familiya
                }
            }

            setValue("email", director.email || "");
            setValue("phone", director.phone || "");
        }
    }, [director, setValue]);

    const { mutate: updateDirector, isPending } = useMutation({
        mutationFn: (body: FormData) => {
            const requestData: any = {
                first_name: body.first_name,
                last_name: body.last_name,
                email: body.email,
                phone: body.phone.replace(/\D/g, "")
            };

            if (body.password) {
                requestData.password = body.password;
            }

            return API.put(`/api/v1/super-admin/directors/${director.id}/`, requestData);
        },
        onSuccess: () => {
            toast.success("Director muvaffaqiyatli yangilandi!");
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
                toast.error("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
            }
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-xl max-w-xl w-full relative z-10 shadow-2xl transition-all duration-200 ${isMounted ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                    {t("directors.edit_title")}
                </h3>

                <form onSubmit={handleSubmit((data) => updateDirector(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("directors.first_name")}</label>
                            <input
                                {...register("first_name")}
                                placeholder="Xusan"
                                className="mt-1 border outline-none focus:border-indigo-500 w-full h-10 border-slate-200 dark:border-slate-700 px-3 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                            />
                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("directors.last_name")}</label>
                            <input
                                {...register("last_name")}
                                placeholder="Yarashev"
                                className="mt-1 border outline-none focus:border-indigo-500 w-full h-10 border-slate-200 dark:border-slate-700 px-3 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                            />
                            {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
                        </div>
                    </div>

                    <Controller name="phone" control={control} render={({ field }) => (
                        <PhoneInput value={field.value || ""} onChange={field.onChange} error={errors.phone?.message} />
                    )} />

                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("directors.email")}</label>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="xusan@example.com"
                            className="mt-1 border outline-none focus:border-indigo-500 w-full h-10 border-slate-200 dark:border-slate-700 px-3 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <PasswordInput
                            register={register("password")}
                            error={errors.password?.message}
                        />
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">
                            * Parolni o'zgartirmoqchi bo'lsangizgina kiriting, aks holda bo'sh qoldiring.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : t("directors.save_btn")}
                    </button>
                </form>
            </div>
        </div>
    );
}