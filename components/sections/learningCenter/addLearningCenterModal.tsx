"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { API } from "@/services/api";
import { Building2, Upload, Link, Image as ImageIcon, X } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import { icons } from "@/constants/icons";

function formatUzPhone(raw: string): string {
    const d = raw.slice(0, 9);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2, 5)}`;
    if (d.length <= 7) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5, 7)}-${d.slice(7)}`;
}

const schema = yup.object({
    name: yup.string().required("O'quv markazi nomi shart"),
    slug: yup.string().required("Slug shart").matches(/^[a-z0-9-_]+$/, "Faqat kichik harf, raqam va tire"),
    phone: yup
        .string()
        .required("Telefon raqam majburiy")
        .test("phone-complete", "Raqamni to'liq kiriting", (val) => {
            const digits = val?.replace(/\D/g, "") ?? "";
            return digits.length === 12;
        }),
    email: yup.string().email("Xato email formati").required("Email kiritilishi shart"),
    address: yup.string().required("Manzil kiritilishi shart"),
    director: yup.string().uuid("Direktor UUID formatida bo'lishi shart").required("Direktorni tanlash shart"),
    status: yup.string().oneOf(["active", "pending", "inactive"]).required("Status shart"),
    subscription_expires: yup.string().required("Obuna tugash sanasi shart"),
}).required();

type FormData = yup.InferType<typeof schema>;

export default function AddLearningCenterModal({ onClose }: { onClose?: () => void }) {
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const [phoneDisplay, setPhoneDisplay] = useState("");
    const [logoMode, setLogoMode] = useState<"upload" | "link">("upload");
    const [logoPreview, setLogoPreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Direktorlar ro'yxatini olish
    const { data: directors } = useQuery({
        queryKey: ["directors-list"],
        queryFn: async () => {
            const res = await API.get("/api/v1/super-admin/directors/");
            return res?.data?.results || res?.data || [];
        }
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            status: "active",
            subscription_expires: new Date().toISOString().split('T')[0]
        }
    });


    const { mutate: addCenter, isPending } = useMutation({
        mutationFn: async (body: FormData) => {
            const formData = new FormData();

            formData.append("name", body.name);
            formData.append("slug", body.slug);
            formData.append("phone", body.phone);
            formData.append("email", body.email);
            formData.append("address", body.address);
            formData.append("director", body.director);
            formData.append("status", body.status);
            formData.append(
                "subscription_expires",
                body.subscription_expires
            );

            if (selectedFile) {
                formData.append("logo", selectedFile);
            }

            const res = await API.post(
                "/api/v1/super-admin/centers/",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return res.data;
        },

        onSuccess: (data) => {
            toast.success(data?.message);

            reset();
            setPhoneDisplay("");
            setLogoPreview("");
            setSelectedFile(null);

            queryClient.invalidateQueries({
                queryKey: ["learning-centers"],
            });

            onClose?.();
        },
    });
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Rasm hajmi 2MB dan oshmasligi kerak!");
            return;
        }

        setSelectedFile(file);

        const previewUrl = URL.createObjectURL(file);
        setLogoPreview(previewUrl);
    };

    const clearLogo = () => {
        setSelectedFile(null);
        setLogoPreview("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Telefon raqam inputi handleri
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        const withPrefix = raw.startsWith("998") ? raw : "998" + raw.replace(/^998/, "");
        const local = withPrefix.slice(3, 12);
        setPhoneDisplay(formatUzPhone(local));
        const full = "998" + local;
        setValue("phone", full, { shouldValidate: true });
    };

    // Nomi o'zgarganda avtomatik slug yasash
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue("name", val);
        const generatedSlug = val
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "") // maxsus belgilarni o'chirish
            .replace(/\s+/g, "-")        // bo'shliqlarni tirega almashtirish
            .replace(/-+/g, "-");        // ketma-ket kelgan tirelarni bittaga keltirish
        setValue("slug", generatedSlug, { shouldValidate: true });
    };

    // Form topshirilganda ishlaydi
    const onSubmit = (data: FormData) => {
        addCenter(data);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Orqa fon (Backdrop) */}
            <div className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"}`} onClick={onClose} />

            {/* Modal Oynasi */}
            <div className={`bg-white p-6 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl border border-slate-100 transform transition-all duration-500 ease-out ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-12 scale-95"}`}>

                {onClose && (
                    <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <Image src={icons.learningCenterIcon} alt="learning-center-icon" className="w-5 h-5" />
                    </button>
                )}

                <div className="mb-[10px] border-[#C7C4D8] border shadow-sm w-[44px] h-[44px] rounded-lg flex justify-center items-center text-indigo-600 bg-indigo-50/10">
                    <Building2 className="w-6 h-6" />
                </div>

                <h3 className="text-[#313131] text-[18px] font-semibold mb-4">Add New Learning Center</h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Name & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Center Name</label>
                            <input {...register("name")} type="text" onChange={handleNameChange} placeholder="E.g., Najot Ta'lim" className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all ${errors.name ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`} />
                            {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Slug (Unique URL)</label>
                            <input {...register("slug")} type="text" placeholder="najot-talim" className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all ${errors.slug ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`} />
                            {errors.slug && <p className="text-red-400 text-[11px] mt-1">{errors.slug.message}</p>}
                        </div>
                    </div>

                    {/* LOGO INTEGRATSIYASI */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[14px] text-[#464555] font-semibold">
                                Center Logo
                            </label>

                            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium text-slate-600">
                                <button
                                    type="button"
                                    onClick={() => setLogoMode("upload")}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${logoMode === "upload"
                                        ? "bg-white text-indigo-600 shadow-xs"
                                        : "hover:text-slate-900"
                                        }`}
                                >
                                    <Upload className="w-3 h-3" />
                                    Upload
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setLogoMode("link")}
                                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer ${logoMode === "link"
                                        ? "bg-white text-indigo-600 shadow-xs"
                                        : "hover:text-slate-900"
                                        }`}
                                >
                                    <Link className="w-3 h-3" />
                                    URL Link
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 items-center border border-[#C7C4D8] rounded-xl p-3 bg-slate-50/50">
                            <div className="relative w-16 h-16 min-w-16 rounded-lg border border-dashed border-slate-300 bg-white flex items-center justify-center overflow-hidden group">
                                {logoPreview ? (
                                    <>
                                        <img
                                            src={logoPreview}
                                            alt="Logo preview"
                                            className="w-full h-full object-cover"
                                        />

                                        <button
                                            type="button"
                                            onClick={clearLogo}
                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-lg cursor-pointer"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-slate-300" />
                                )}
                            </div>

                            <div className="w-full">
                                {logoMode === "upload" ? (
                                    <>
                                        <input
                                            ref={fileInputRef}
                                            id="logo-file-input"
                                            type="file"
                                            accept="image/png,image/jpeg,image/jpg,image/webp"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />

                                        <label
                                            htmlFor="logo-file-input"
                                            className="inline-flex items-center gap-2 px-4 h-[38px] bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                                        >
                                            <Upload className="w-3.5 h-3.5" />
                                            Choose Image File
                                        </label>

                                        <p className="text-[11px] text-slate-400 mt-1">
                                            PNG, JPG, WEBP up to 2MB
                                        </p>
                                    </>
                                ) : (
                                    <input
                                        type="url"
                                        placeholder="https://example.com/logo.png"
                                        onChange={(e) => {
                                            setLogoPreview(e.target.value);
                                        }}
                                        className="border border-slate-200 rounded-lg w-full h-[38px] px-3 text-xs outline-none bg-white focus:border-indigo-500"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Director Select */}
                    <div>
                        <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Director</label>
                        <select {...register("director")} className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none bg-white text-[#191C1D] ${errors.director ? "border-red-300" : "border-[#C7C4D8]"}`}>
                            <option value="">Select Director...</option>
                            {Array.isArray(directors) ? directors.map((dir: any) => (
                                <option key={dir.id} value={dir.id}>{dir.full_name || dir.name || dir.id}</option>
                            )) : <option value="3fa85f64-5717-4562-b3fc-2c963f66afa6">Test Director</option>}
                        </select>
                        {errors.director && <p className="text-red-400 text-[11px] mt-1">{errors.director.message}</p>}
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Phone</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 flex items-center gap-1.5 select-none pointer-events-none">
                                    <span className="text-base leading-none">🇺🇿</span><span className="text-sm font-semibold text-[#191C1D]">+998</span>
                                </div>
                                <input type="tel" value={phoneDisplay} onChange={handlePhoneChange} placeholder="90-123-45-67" className={`border rounded-lg w-full h-[40px] pl-[90px] pr-[10px] text-[14px] outline-none transition-all ${errors.phone ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`} />
                            </div>
                            {errors.phone && <p className="text-red-400 text-[11px] mt-1 ml-2">{errors.phone.message}</p>}
                        </div>
                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Email Address</label>
                            <input {...register("email")} type="email" placeholder="center@example.com" className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all ${errors.email ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`} />
                            {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email.message}</p>}
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Address</label>
                        <input {...register("address")} type="text" placeholder="Toshkent sh., Chilonzor t." className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all ${errors.address ? "border-red-300 bg-red-50/10" : "border-[#C7C4D8]"}`} />
                        {errors.address && <p className="text-red-400 text-[11px] mt-1">{errors.address.message}</p>}
                    </div>

                    {/* Status & Subscription */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Status</label>
                            <select {...register("status")} className="border border-[#C7C4D8] rounded-lg w-full h-[40px] px-3 text-[14px] outline-none bg-white text-[#191C1D]">
                                <option value="active">Active</option>
                                <option value="pending">Pending</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[14px] text-[#464555] mb-1 block font-semibold">Subscription Expires</label>
                            <input {...register("subscription_expires")} type="date" className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all ${errors.subscription_expires ? "border-red-300" : "border-[#C7C4D8]"}`} />
                            {errors.subscription_expires && <p className="text-red-400 text-[11px] mt-1">{errors.subscription_expires.message}</p>}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={isPending} className="w-full h-[40px] mt-2 bg-[#4F46E5] hover:bg-[#4338CA] disabled:bg-indigo-300 text-white rounded-lg text-[14px] font-bold transition-colors cursor-pointer flex items-center justify-center">
                        {isPending ? "Creating Center..." : "Create Learning Center"}
                    </button>
                </form>
            </div>
        </div>
    );
}