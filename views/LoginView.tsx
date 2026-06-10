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
import Particles from "@/components/Particles";


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
        <div className="relative min-h-screen bg-[#EEF2FF] dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300 overflow-hidden">

            {/* 2. Orqa fondagi animatsiya (React Bits komponenti) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-60">
                <Particles
                    particleColors={["#ffffff"]}
                    particleCount={200}
                    particleSpread={10}
                    speed={0.1}
                    particleBaseSize={100}
                    moveParticlesOnHover
                    alphaParticles={false}
                    disableRotation={false}
                    pixelRatio={1}
                />
            </div>

            {/* 3. Login formasi - z-10 orqali animatsiyadan tepaga ko'taramiz */}
            <div className="relative z-10 w-full max-w-[448px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 transition-colors duration-300">
                <div className="mb-8 text-center">
                    <Title text="EDU X" />
                    <Text text="Education Center ADMIN" />
                </div>

                <div className="mb-6">
                    <h2 className="text-[20px] font-semibold text-[#191C1D] dark:text-slate-100">
                        {t("auth.welcome")}
                    </h2>
                    <p className="text-[14px] text-[#464555] dark:text-slate-400 mt-1">
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
                        className="w-full h-[40px] bg-[#4F46E5] text-white rounded-lg font-bold flex items-center justify-center hover:bg-[#4338CA] dark:bg-[#5551FF] dark:hover:bg-[#4F46E5] transition-all disabled:opacity-70"
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