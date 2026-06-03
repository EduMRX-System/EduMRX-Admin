"use client";

import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { ShieldAlert, X, Loader2, Camera, Upload, Link as LinkIcon } from "lucide-react";
import { toast } from "react-toastify";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { PasswordInput } from "@/components/ui/PasswordInput";
import Image from "next/image";
import { t } from "i18next";

const schema = yup.object({
    first_name: yup.string().required("Ism kiritilishi shart"),
    last_name: yup.string().required("Familiya kiritilishi shart"),
    phone: yup.string().required("Telefon raqami majburiy").test("len", "Raqamni to'liq kiriting", val => val?.replace(/\D/g, "").length === 12),
    email: yup.string().email("Xato email formati").required("Email kiritilishi shart"),
    password: yup.string().required("Parol kiritilishi shart").min(6, "Parol kamida 6 ta belgi bo'lishi kerak")
}).required();

type FormData = yup.InferType<typeof schema>;

export default function AddDirectorModal({ onClose }: { onClose?: () => void }) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
        resolver: yupResolver(schema)
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

            if (activeTab === "upload" && avatar) {
                formData.append("avatar", avatar);
            } else if (activeTab === "url" && avatarUrl) {
                formData.append("avatar_url", avatarUrl);
            }

            return API.post("/api/v1/super-admin/directors/", formData);
        },
        onSuccess: () => {
            toast.success("Yangi direktor muvaffaqiyatli qo'shildi!");
            queryClient.invalidateQueries({ queryKey: ["directors"] });
            onClose?.();
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl max-w-xl w-full relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-slate-100">
                    {t("directors.add_title")}
                </h3>

                <form onSubmit={handleSubmit((data) => createDirector(data))} className="space-y-4">
                    {/* Avatar Upload */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 transition-colors">
                        <div className="flex gap-4 mb-4">
                            <button
                                type="button"
                                onClick={() => setActiveTab("upload")}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === "upload" ? "text-indigo-600" : "text-slate-500 dark:text-slate-400"}`}
                            >
                                <Upload className="w-4 h-4" /> {t("directors.upload")}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("url")}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === "url" ? "text-indigo-600" : "text-slate-500 dark:text-slate-400"}`}
                            >
                                <LinkIcon className="w-4 h-4" /> {t("directors.url_link")}
                            </button>
                        </div>

                        {activeTab === "upload" ? (
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-16 h-16 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer overflow-hidden relative"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {avatarPreview ? <Image src={avatarPreview} alt="prev" fill className="object-cover" /> : <Camera className="w-6 h-6 text-slate-400" />}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-sm text-indigo-600 font-medium border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                                >
                                    {t("directors.choose_file")}
                                </button>
                            </div>
                        ) : (
                            <input
                                value={avatarUrl}
                                onChange={(e) => setAvatarUrl(e.target.value)}
                                placeholder="https://example.com/avatar.jpg"
                                className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("directors.first_name")}</label>
                            <input
                                {...register("first_name")}
                                placeholder="Xusan"
                                className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                            />
                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("directors.last_name")}</label>
                            <input
                                {...register("last_name")}
                                placeholder="Yarashev"
                                className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                            />
                        </div>
                    </div>

                    <Controller name="phone" control={control} render={({ field }) => (
                        <PhoneInput value={field.value || ""} onChange={field.onChange} error={errors.phone?.message} />
                    )} />

                    <div>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t("directors.email")}</label>
                        <input
                            {...register("email")}
                            placeholder="xusan@example.com"
                            className="mt-1 w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                        />
                    </div>

                    <PasswordInput register={register("password")} error={errors.password?.message} />

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center transition-colors disabled:opacity-60"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t("directors.create_btn")}
                    </button>
                </form>
            </div>
        </div>
    );
}