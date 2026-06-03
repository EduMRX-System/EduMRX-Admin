"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { API } from "@/services/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";

import Text from "@/components/ui/Text";
import Title from "@/components/ui/Title";
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
        mutationFn: (body: FormData) => API.post("/api/v1/auth/login/", { ...body, phone: `+${body.phone}` }),
        onSuccess: (res) => {
            const { user, access_token, refresh_token, message } = res.data;
            login(user, { access_token, refresh_token });
            toast.success(message || "Login successfully");
            router.push("/");
        },
        onError: (err: any) => {
            const serverErrors = err?.response?.data;

            if (serverErrors?.non_field_errors && Array.isArray(serverErrors.non_field_errors)) {
                toast.error(serverErrors.non_field_errors[0]);
            }
            else if (serverErrors && typeof serverErrors === "object") {
                const firstKey = Object.keys(serverErrors)[0];
                const errorValue = serverErrors[firstKey];
                if (Array.isArray(errorValue)) {
                    toast.error(errorValue[0]);
                } else {
                    toast.error("Login amalga oshmadi, ma'lumotlarni tekshiring.");
                }
            }
            else {
                toast.error(err?.message || "Xatolik yuz berdi");
            }
        },
    });

    return (
        <div className="min-h-screen bg-[#EEF2FF] dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4 transition-colors">
            <div className="w-full max-w-[448px] bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
                <div className="mb-8 text-center">
                    <Title text="EDU X" />
                    <Text text="Education Center ADMIN" />
                </div>

                <div className="mb-6">
                    <h2 className="text-[20px] font-semibold text-[#191C1D] dark:text-white">
                        {t("auth.welcome")}
                    </h2>
                    <p className="text-[14px] text-[#464555] dark:text-slate-400">
                        {t("auth.desc")}
                    </p>
                </div>

                <form onSubmit={handleSubmit((data) => loginToProfile(data))} className="space-y-5">
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

                    <PasswordInput
                        register={register("password")}
                        error={errors.password?.message}
                    />

                    <button
                        disabled={isPending}
                        className="w-full h-[40px] bg-[#4F46E5] text-white rounded-lg font-bold flex items-center justify-center hover:bg-[#4338CA] dark:hover:bg-[#6366f1] transition-all disabled:opacity-70"
                    >
                        {isPending ? (
                            <Loader2 className="animate-spin mr-2" />
                        ) : (
                            t("auth.signin")
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}