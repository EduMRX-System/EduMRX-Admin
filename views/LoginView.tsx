"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { API } from "@/services/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2, ShieldAlert, CheckCircle2 } from "lucide-react";

import { PhoneInput } from "@/components/ui/PhoneInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { t } from "i18next";

const schema = yup.object({
    phone: yup.string().required("Phone number is mandatory")
        .test("len", "Enter a full number", val => val?.replace(/\D/g, "").length === 12),
    password: yup.string().required("Password is required"),
});

type FormData = yup.InferType<typeof schema>;

export default function LoginView() {
    const router = useRouter();
    const { login } = useAuthStore();

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(schema),
    });

    const { mutate: loginToProfile, isPending } = useMutation({
        mutationFn: (body: FormData) => API.post("auth/login/", { ...body, phone: `+${body.phone}` }),
        onSuccess: (res) => {
            const { user, access_token, refresh_token, message } = res.data;

            const userWithRole = {
                ...user,
                role: user?.role || "super_admin"
            };

            login(userWithRole, { access_token, refresh_token });

            toast.success(message || "Login successfully");
            router.push("/");
        },
        onError: (err: any) => {
            const serverErrors = err?.response?.data;
            if (serverErrors?.non_field_errors && Array.isArray(serverErrors.non_field_errors)) {
                toast.error(serverErrors.non_field_errors[0]);
            } else if (serverErrors && typeof serverErrors === "object") {
                const firstKey = Object.keys(serverErrors)[0];
                const errorValue = serverErrors[firstKey];
                if (Array.isArray(errorValue)) {
                    toast.error(errorValue[0]);
                } else {
                    toast.error("Login amalga oshmadi, ma'lumotlarni tekshiring.");
                }
            } else {
                toast.error(err?.message || "Xatolik yuz berdi");
            }
        },
    });

    return (
        <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">

            {/* CHAP TOMON: Brending va Dashboard Info (Faqat katta ekranlarda ko'rinadi) */}
            <div className="hidden lg:flex lg:w-1/2 bg-slate-50 dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-12 flex-col justify-between relative overflow-hidden">
                {/* Geometrik chiziqlar (Minimalist fon) */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
                </div>

                {/* Logo qismi */}
                <div className="flex items-center gap-3 relative z-10">
                    <span className="w-10 h-10 text-white bg-[#4F46E5] text-base flex justify-center items-center rounded-lg font-bold shrink-0 shadow-md shadow-indigo-500/20">
                        EX
                    </span>
                    <div>
                        <p className="text-xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
                            EDU X
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1 uppercase tracking-wider">
                            HQ Console
                        </p>
                    </div>
                </div>

                {/* Markaziy kontent - Tizim haqida qisqacha ma'lumot */}
                <div className="max-w-md my-auto relative z-10">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200/40 dark:border-red-900/40 mb-4">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Super Admin Access
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                        Markazlashtirilgan Boshqaruv Tizimi
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
                        EduMRX platformasining barcha filliallari, foydalanuvchilari va moliyaviy oqimlarini yuqori darajadagi xavfsizlik ostida boshqaring.
                    </p>

                    {/* Minimalist qulayliklar ro'yxati */}
                    <div className="mt-8 space-y-3.5">
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0" />
                            <span>Ko'p tarmoqlilikni (Multi-tenant) boshqarish</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0" />
                            <span>Global sozlamalar va xavfsizlik loglari</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-[#4F46E5] shrink-0" />
                            <span>Tizim xizmatlari holati nazorati</span>
                        </div>
                    </div>
                </div>

                {/* Footer qismi */}
                <div className="text-xs text-slate-400 dark:text-slate-500 relative z-10">
                    &copy; {new Date().getFullYear()} EduMRX HQ. All rights reserved.
                </div>
            </div>

            {/* O'NG TOMON: Login Formasi */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-100">

                    {/* Mobil ekranlar uchun logotip (Faqat kichik ekranlarda chiqadi) */}
                    <div className="flex lg:hidden items-center gap-3 mb-8">
                        <span className="w-9 h-9 text-white bg-[#4F46E5] text-sm flex justify-center items-center rounded-lg font-bold shrink-0">
                            EX
                        </span>
                        <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            EDU X <span className="text-xs font-medium text-slate-400">HQ</span>
                        </p>
                    </div>

                    {/* Sarlavha */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {t("auth.welcome") || "Xush kelibsiz"}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                            Davom etish uchun hisobingiz ma'lumotlarini kiriting.
                        </p>
                    </div>

                    {/* Forma */}
                    <form onSubmit={handleSubmit((data) => loginToProfile(data))} className="space-y-4">
                        <div>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <PhoneInput
                                        value={field.value || ""}
                                        onChange={field.onChange}
                                        error={errors.phone?.message}
                                    />
                                )}
                            />
                        </div>

                        <div>
                            <PasswordInput
                                register={register("password")}
                                error={errors.password?.message}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-[42px] bg-[#4F46E5] text-white rounded-lg font-bold flex items-center justify-center hover:bg-[#4338CA] dark:bg-[#5551FF] dark:hover:bg-[#4F46E5] transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm shadow-sm"
                            >
                                {isPending ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Tekshirilmoqda...</span>
                                    </div>
                                ) : (
                                    t("auth.signin") || "Tizimga kirish"
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-900 text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Xavfsiz tizim. Barcha kirish urinishlari va operatsiyalar nazorat qilinadi.
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
}