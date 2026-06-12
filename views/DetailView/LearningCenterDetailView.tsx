"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { API } from "@/services/api";
import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import {
    ArrowLeft, Building2, Phone, Mail, MapPin, Calendar,
    ShieldCheck, ShieldAlert, GraduationCap, Users, User, CreditCard,
    Edit2, Trash2, Loader2, Globe
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ILearningCenterDetailData } from "@/types";
import DeleteLearningCenterModal from "@/components/sections/learningCenter/DeleteLearningCenterModal";
import EditLearningCenterModal from "@/components/sections/learningCenter/EditLearningCenterModal";
import { useUIStore } from "@/store/useUIStore";


const BASE_URL = process.env.NEXT_PUBLIC_DataBaseURL;

// ═════════════════════════════════════════════════════════════════
// GLOBAL YANDEX MAPS SCRIPT LOADING (DUBLIKAT YUKLANISH OLDINI OLADI)
// ═════════════════════════════════════════════════════════════════
let ymapsPromise: Promise<void> | null = null;
function loadYandexMaps(): Promise<void> {
    const win = window as any;
    if (win.ymaps && typeof win.ymaps.ready === "function") {
        return new Promise((resolve) => win.ymaps.ready(() => resolve()));
    }
    if (ymapsPromise) return ymapsPromise;

    ymapsPromise = new Promise((resolve, reject) => {
        const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY;
        const scriptUrl = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;

        const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
        if (existingScript) {
            const checkYmaps = setInterval(() => {
                if (win.ymaps && typeof win.ymaps.ready === "function") {
                    clearInterval(checkYmaps);
                    win.ymaps.ready(() => resolve());
                }
            }, 100);
            return;
        }

        const script = document.createElement("script");
        script.src = scriptUrl;
        script.async = true;
        script.onload = () => { win.ymaps.ready(() => resolve()); };
        script.onerror = () => { ymapsPromise = null; reject(new Error("Map load error")); };
        document.head.appendChild(script);
    });
    return ymapsPromise;
}

export default function LearningCenterDetailView() {
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language || "uz";
    const params = useParams();
    const centerId = params?.id as string;

    const theme = useUIStore((state) => state.theme);

    // Modallar holati
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Map Statelari
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(false);

    // 1. O'quv markazi ma'lumotlarini yuklash
    const { data, isLoading, error } = useQuery<ILearningCenterDetailData>({
        queryKey: ["learning-center-detail", centerId],
        queryFn: async () => {
            const res = await API.get(`/super-admin/centers/${centerId}/`);
            return res?.data?.data ?? res?.data;
        },
        enabled: !!centerId,
    });

    // 2. Yandex Map yuklash va marker qo'yish
    useEffect(() => {
        if (isLoading || error || !data) return;

        const lat = data.latitude ? parseFloat(data.latitude) : null;
        const lng = data.longitude ? parseFloat(data.longitude) : null;

        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            setMapLoading(false);
            setMapError(true);
            return;
        }

        loadYandexMaps()
            .then(() => {
                if (!mapContainerRef.current) return;
                const ymaps = (window as any).ymaps;

                // Agar eski xarita obyekt mavjud bo'lsa, o'chiramiz (qayta chizish uchun)
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.destroy();
                }

                // Zustand'dagi theme qorong'i (dark) ekanligini tekshiramiz
                const isDark = theme === "dark";

                const map = new ymaps.Map(
                    mapContainerRef.current,
                    {
                        center: [lat, lng],
                        zoom: 10,
                        controls: ["zoomControl"],
                    },
                    { suppressMapOpenBlock: true }
                );

                mapInstanceRef.current = map;
                setMapLoading(false);

                // Marker (Placemark) rangini ham mavzuga qarab o'zgartiramiz
                const placemark = new ymaps.Placemark(
                    [lat, lng],
                    { balloonContent: data.name },
                    {
                        preset: "islands#violetDotIconWithCaption",
                        iconColor: isDark ? "#818CF8" : "#4F46E5", // Marker rangi endi buzilmaydi!
                    }
                );
                map.geoObjects.add(placemark);  

                // PROFESSIONAL DARK MODE: Xaritaning pastki qatlamiga CSS filter qo'llash
                if (isDark) {
                    // 'ground' qatlami bu yo'llar va uylar chizilgan asosiy fon qismi hisoblanadi
                    const groundElement = map.panes.get("ground").getElement();
                    if (groundElement) {
                        // Xaritani ko'k-qora ranglar uyg'unligidagi ajoyib dark modega o'tkazadi
                        groundElement.style.filter = "invert(1) hue-rotate(180deg) brightness(0.6) contrast(0.9)";
                    }
                }
            })
            .catch(() => {
                setMapError(true);
                setMapLoading(false);
            });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy();
                mapInstanceRef.current = null;
            }
        };
    }, [data, isLoading, error, theme]); // 3. MUHIM: dependency array ichiga "theme" qo'shildi!

    // Formatlash funksiyalari
    const formatPhone = (phone: string) => {
        if (!phone) return "—";
        const cleaned = phone.replace(/\D/g, "");
        if (cleaned.length === 12) {
            return `+${cleaned.slice(0, 3)} (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
        }
        return phone.startsWith("+") ? phone : `+${phone}`;
    };

    const getLogoUrl = (logoPath: string | null | undefined) => {
        if (!logoPath) return null;
        if (logoPath.startsWith("http")) return logoPath;
        return `${BASE_URL?.replace(/\/$/, "")}/${logoPath.replace(/^\//, "")}`;
    };

    const formatDate = (dateStr: string, includeTime = false) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        const locale = currentLang === "uz" ? "uz-UZ" : currentLang === "ru" ? "ru-RU" : "en-US";

        if (includeTime) {
            return `${date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" })} ${date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}`;
        }
        return date.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
    };

    // Skeleton Loader
    if (isLoading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800" />
                        <div className="space-y-2">
                            <div className="w-24 h-3 bg-slate-100 dark:bg-slate-800 rounded" />
                            <div className="w-48 h-5 bg-slate-100 dark:bg-slate-800 rounded" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-20 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                        <div className="w-20 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-48 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800" />
                        <div className="h-36 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800" />
                    </div>
                    <div className="h-96 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800" />
                </div>
            </div>
        );
    }

    // Error State
    if (error || !data) {
        return (
            <div className="p-8 text-center max-w-md mx-auto mt-10 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl">
                <ShieldAlert className="w-8 h-8 text-red-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                    {t("centers.error_loading", "O'quv markazi ma'lumotlarini yuklashda xatolik yuz berdi.")}
                </p>
                <Link href="/centers" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline mt-3 inline-block">
                    {t("common.back_to_list", "Ro'yxatga qaytish")}
                </Link>
            </div>
        );
    }

    const logoUrl = getLogoUrl(data.logo);

    return (
        <div className="space-y-6 animate-fade-in pb-10">

            {/* 1. Header qismi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
                <div className="flex items-center gap-3.5">
                    <Link
                        href="/centers"
                        className="p-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-2xs"
                    >
                        <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase">
                            {t("nav.centers_management", "O'quv Markazlari")}
                        </span>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
                            {data.name}
                        </h1>
                    </div>
                </div>

                {/* Edit va Delete tugmalari */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                        onClick={() => setIsEditOpen(true)}
                        className="inline-flex items-center gap-2 h-10 px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-sm font-semibold rounded-lg cursor-pointer transition-colors shadow-2xs"
                    >
                        <Edit2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        <span>{t("common.edit", "Tahrirlash")}</span>
                    </button>
                    <button
                        onClick={() => setIsDeleteOpen(true)}
                        className="inline-flex items-center gap-2 h-10 px-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100/70 dark:hover:bg-rose-950/40 text-sm font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{t("common.delete", "O'chirish")}</span>
                    </button>
                </div>
            </div>

            {/* 2. Tezkor Statistika Vidjetlari */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center gap-4 shadow-3xs">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t("centers.students", "O'quvchilar")}</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{data.students_count ?? 0}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center gap-4 shadow-3xs">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-600 dark:text-sky-400">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t("centers.teachers", "O'qituvchilar")}</p>
                        <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">{data.teachers_count ?? 0}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl flex items-center gap-4 shadow-3xs">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{t("centers.col_plan", "Tarif")}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 uppercase">{data.plan || "Trial"}</p>
                    </div>
                </div>
            </div>

            {/* 3. Asosiy Grid Tizimi */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* CHAP BLOK: Markaz Profili, Direktori va Xaritasi */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Markaz Asosiy Ma'lumotlari */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-6 shadow-3xs">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/60">
                            <div className="relative w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                                {logoUrl ? (
                                    <Image src={logoUrl} alt={data.name} width={64} height={64} className="w-full h-full object-cover" />
                                ) : (
                                    <Building2 className="w-7 h-7 text-slate-400" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg leading-tight">{data.name}</h3>
                                <p className="text-[11px] text-indigo-600 font-medium mt-1 font-mono">@{data.slug}</p>
                            </div>
                        </div>

                        {/* Aloqa va Manzil Maydonlari */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="space-y-1 bg-slate-50/40 dark:bg-slate-800/20 p-3.5 border border-slate-100 dark:border-slate-800/50 rounded-xl">
                                <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {t("common.phone", "Telefon raqam")}
                                </span>
                                <p className="text-slate-800 dark:text-slate-200 font-bold text-sm pt-0.5">{formatPhone(data.phone)}</p>
                            </div>

                            <div className="space-y-1 bg-slate-50/40 dark:bg-slate-800/20 p-3.5 border border-slate-100 dark:border-slate-800/50 rounded-xl">
                                <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {t("common.email", "Elektron pochta")}
                                </span>
                                <p className="text-slate-800 dark:text-slate-200 font-bold text-sm pt-0.5 truncate select-all">{data.email || "—"}</p>
                            </div>

                            <div className="space-y-1 bg-slate-50/40 dark:bg-slate-800/20 p-3.5 border border-slate-100 dark:border-slate-800/50 rounded-xl sm:col-span-2">
                                <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {t("common.address", "Manzil")}
                                </span>
                                <p className="text-slate-800 dark:text-slate-200 font-semibold text-sm pt-0.5">{data.address || "—"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dinamik Yandex Map Vidjeti */}
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-4 shadow-3xs">
                        <h4 className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {t("map.location_label") || "Xaritadagi joylashuv"}
                        </h4>
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950">
                            {(mapLoading || mapError) && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-50/90 dark:bg-slate-900/95">
                                    {mapError ? (
                                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{t("map.load_error") || "Koordinatalar topilmadi yoki xarita yuklanmadi"}</span>
                                    ) : (
                                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                    )}
                                </div>
                            )}
                            <div ref={mapContainerRef} className="w-full h-[260px] " />
                        </div>

                        {/* Latitude & Longitude ko'rsatkichlari */}
                        {data.latitude && data.longitude && (
                            <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2.5 font-mono">
                                <div>Latitude: <span className="font-bold text-slate-700 dark:text-slate-300">{data.latitude}</span></div>
                                <div className="hidden sm:block text-slate-300">|</div>
                                <div>Longitude: <span className="font-bold text-slate-700 dark:text-slate-300">{data.longitude}</span></div>
                            </div>
                        )}
                    </div>

                    {/* Direktor Haqida Karta */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-3xs">
                        <h4 className="text-[11px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4">
                            {t("centers.director_info", "Mas'ul Direktor")}
                        </h4>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800/60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100/40 flex items-center justify-center text-indigo-500 shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{data.director_name || "—"}</p>
                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">{formatPhone(data.director_phone)}</p>
                                </div>
                            </div>
                            {data.director && (
                                <Link
                                    href={`/directors/${data.director}`}
                                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors shrink-0"
                                >
                                    {t("common.view_profile", "Profilni ko'rish")} &rarr;
                                </Link>
                            )}
                        </div>
                    </div>

                </div>

                {/* O'NG BLOK: Status va Obuna Ma'lumotlari */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 space-y-5 h-fit shadow-3xs">

                    {/* Markaz Statusi */}
                    <div>
                        <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-2.5">
                            {t("common.center_status", "Markaz holati")}
                        </p>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-lg border inline-flex items-center gap-1.5 shadow-2xs ${data.status === "active"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50"
                            : "bg-red-50 text-red-600 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50"
                            }`}>
                            {data.status === "active" ? (
                                <>
                                    <ShieldCheck className="w-3.5 h-3.5" /> {t("common.active", "Faol")}
                                </>
                            ) : (
                                <>
                                    <ShieldAlert className="w-3.5 h-3.5" /> {t("common.inactive", "Nofaol")}
                                </>
                            )}
                        </span>
                    </div>

                    {/* Obuna (Subscription) Holati */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
                        <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                            {t("centers.subscription", "Tarif / Obuna holati")}
                        </p>

                        <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${data.is_subscription_active
                            ? "bg-emerald-50/30 border-emerald-100/70 dark:bg-emerald-950/10 dark:border-emerald-900/40"
                            : "bg-amber-50/40 border-amber-100/70 dark:bg-amber-950/10 dark:border-amber-900/40"
                            }`}>
                            <CreditCard className={`w-4 h-4 mt-0.5 shrink-0 ${data.is_subscription_active ? "text-emerald-500" : "text-amber-500"}`} />
                            <div className="text-xs">
                                <p className={`font-bold ${data.is_subscription_active ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                    {data.is_subscription_active ? t("centers.sub_active", "Obuna faol") : t("centers.sub_expired", "Muddati tugagan")}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                                    {t("centers.expires_at", "Tugash muddati")}: <span className="font-bold text-slate-600 dark:text-slate-300">{formatDate(data.subscription_expires)}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Ro'yxatdan o'tgan vaqt bloki */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-2">
                        <p className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                            {t("common.created_at", "Tizimga qo'shilgan vaqt")}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-semibold bg-slate-50/50 dark:bg-slate-800/30 px-3 py-2 rounded-xl border border-slate-100/80 dark:border-slate-800/60">
                            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                            <span>{formatDate(data.created_at, true)}</span>
                        </div>
                    </div>

                </div>
            </div>

            {/* ═════════════════════════════════════════════════════════════════
          TAHRIRLASH (EDIT) MODALI INTEGRATSIYASI
          ═════════════════════════════════════════════════════════════════ */}
            {isEditOpen && (
                <EditLearningCenterModal
                    center={data as any}
                    onClose={() => setIsEditOpen(false)}
                />
            )}

            {/* ═════════════════════════════════════════════════════════════════
          Sizdagi tayyor DELETE MODAL INTEGRATSIYASI
          ═════════════════════════════════════════════════════════════════ */}
            {isDeleteOpen && (
                <DeleteLearningCenterModal
                    centerId={data.id}
                    centerName={data.name}
                    onClose={() => setIsDeleteOpen(false)}
                />
            )}

        </div>
    );
}