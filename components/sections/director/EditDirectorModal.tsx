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
import { IDirector } from "./DirectorItem";

const schema = yup.object({
    first_name: yup.string().required("Ism kiritilishi shart"),
    last_name: yup.string().required("Familiya kiritilishi shart"),
    phone: yup.string().required("Telefon raqami majburiy")
        .test("len", "Raqamni to'liq kiriting", val => val?.replace(/\D/g, "").length === 12),
    email: yup.string().email("Xato email formati").required("Email kiritilishi shart"),
    password: yup.string().required("Tahrirlash uchun yangi parol kiritishingiz shart").min(6, "Parol kamida 6 ta belgi bo'lishi kerak")
}).required();

type FormData = yup.InferType<typeof schema>;

export default function EditDirectorModal({ director, onClose }: { director: IDirector; onClose?: () => void }) {
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);

    const { register, handleSubmit, control, setValue, setError, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(schema)
    });

    useEffect(() => {
        setIsMounted(true);
        if (director) {
            const nameParts = director.full_name?.trim().split(" ") || [];
            setValue("first_name", nameParts[0] || "");
            setValue("last_name", nameParts.slice(1).join(" ") || "");
            setValue("email", director.email);
            setValue("phone", director.phone);
        }
    }, [director, setValue]);

    const { mutate: updateDirector, isPending } = useMutation({
        mutationFn: (body: FormData) => API.put(`/api/v1/super-admin/directors/${director.id}/`, { ...body, phone: body.phone.replace(/\D/g, "") }),
        onSuccess: () => {
            toast.success("Director muvaffaqiyatli yangilandi!");
            queryClient.invalidateQueries({ queryKey: ["directors"] });
            onClose?.();
        },
        onError: (err: any) => {
            const serverErrors = err?.response?.data;
            if (serverErrors && typeof serverErrors === "object") {
                const firstKey = Object.keys(serverErrors)[0];
                const errorValue = serverErrors[firstKey];
                if (Array.isArray(errorValue)) {
                    toast.error(errorValue[0]);
                    setError(firstKey as any, { type: "server", message: errorValue[0] });
                }
            } else {
                toast.error("Xatolik yuz berdi.");
            }
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className={`bg-white p-6 rounded-xl max-w-xl w-full relative z-10 transition-all ${isMounted ? "opacity-100" : "opacity-0"}`}>
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>

                <h3 className="text-lg font-semibold mb-4">Edit Director Details</h3>

                <form onSubmit={handleSubmit((data) => updateDirector(data))} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold">First Name</label>
                            <input {...register("first_name")} placeholder="E.g., Xusan" className="border outline-none focus:border-indigo-500 w-full h-[40px] border-[#C7C4D8] px-3 rounded-lg" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold">Last Name</label>
                            <input {...register("last_name")} placeholder="E.g., Yarashev" className="border outline-none focus:border-indigo-500 w-full border-[#C7C4D8] h-[40px] px-3 rounded-lg" />
                        </div>
                    </div>

                    <Controller name="phone" control={control} render={({ field }) => (
                        <PhoneInput value={field.value || ""} onChange={field.onChange} error={errors.phone?.message} />
                    )} />

                    <PasswordInput register={register("password")} error={errors.password?.message} />

                    <button type="submit" disabled={isPending} className="w-full h-[40px] bg-[#4F46E5] text-white rounded-lg font-bold flex items-center justify-center">
                        {isPending ? <Loader2 className="animate-spin mr-2" /> : "Save Updates"}
                    </button>
                </form>
            </div>
        </div>
    );
}