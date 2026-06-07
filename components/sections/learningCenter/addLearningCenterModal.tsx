"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { API } from "@/services/api";
import { Building2, Upload, Link, Image as ImageIcon, X, Search, ChevronDown, MapPin, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { t } from "i18next";
import Image from "next/image";

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
    latitude: yup.string().required("Xaritadan joylashuvni belgilang"),
    longitude: yup.string().required("Xaritadan joylashuvni belgilang"),
}).required();

type FormData = yup.InferType<typeof schema>;

let ymapsLoaded = false;
let ymapsPromise: Promise<void> | null = null;

function loadYandexMaps(): Promise<void> {
    if (ymapsLoaded) return Promise.resolve();
    if (ymapsPromise) return ymapsPromise;

    ymapsPromise = new Promise((resolve, reject) => {
        const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY;
        const script = document.createElement("script");
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
        script.async = true;
        script.onload = () => {
            (window as any).ymaps.ready(() => {
                ymapsLoaded = true;
                resolve();
            });
        };
        script.onerror = () => reject(new Error("Yandex Maps yuklanmadi"));
        document.head.appendChild(script);
    });

    return ymapsPromise;
}

export default function AddLearningCenterModal({ onClose }: { onClose?: () => void }) {
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const [phoneDisplay, setPhoneDisplay] = useState("");
    const [logoPreview, setLogoPreview] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Director dropdown
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDirectorName, setSelectedDirectorName] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Yandex Maps
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const placemarkRef = useRef<any>(null);
    const [mapLoading, setMapLoading] = useState(true);
    const [mapError, setMapError] = useState(false);
    const [coords, setCoords] = useState<{ lat: string; lng: string } | null>(null);
    const [addressSearchQuery, setAddressSearchQuery] = useState("");
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        setValue,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            status: "active",
            subscription_expires: new Date().toISOString().split("T")[0],
        },
    });

    useEffect(() => {
        setIsMounted(true);

        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setAddressSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Yandex Map init
    useEffect(() => {
        if (!isMounted) return;

        loadYandexMaps()
            .then(() => {
                if (!mapContainerRef.current) return;
                const ymaps = (window as any).ymaps;

                const map = new ymaps.Map(mapContainerRef.current, {
                    center: [41.2995, 69.2401], // Toshkent
                    zoom: 12,
                    controls: ["zoomControl"],
                });

                mapInstanceRef.current = map;
                setMapLoading(false);

                map.events.add("click", (e: any) => {
                    const coordinate = e.get("coords");
                    updateMarker(coordinate, ymaps, map);
                });
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
    }, [isMounted]);

    const updateMarker = useCallback((coordinate: number[], ymaps: any, map: any) => {
        const [lat, lng] = coordinate;
        const latStr = lat.toFixed(6);
        const lngStr = lng.toFixed(6);

        setCoords({ lat: latStr, lng: lngStr });
        setValue("latitude", latStr, { shouldValidate: true });
        setValue("longitude", lngStr, { shouldValidate: true });

        if (placemarkRef.current) {
            map.geoObjects.remove(placemarkRef.current);
        }

        const placemark = new ymaps.Placemark(
            coordinate,
            {},
            {
                preset: "islands#violetDotIconWithCaption",
                iconColor: "#4F46E5",
            }
        );

        map.geoObjects.add(placemark);
        placemarkRef.current = placemark;

        // Reverse geocode — manzilni olish
        ymaps.geocode(coordinate, { results: 1 }).then((res: any) => {
            const firstGeoObject = res.geoObjects.get(0);
            if (firstGeoObject) {
                const addressText = firstGeoObject.getAddressLine();
                setValue("address", addressText, { shouldValidate: true });
                setAddressSearchQuery(addressText);
            }
        });
    }, [setValue]);

    // Address qidiruv
    const handleAddressSearch = (query: string) => {
        setAddressSearchQuery(query);
        setValue("address", query, { shouldValidate: true });

        if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        if (!query.trim() || query.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        searchDebounceRef.current = setTimeout(async () => {
            const ymaps = (window as any).ymaps;
            if (!ymaps || !mapInstanceRef.current) return;

            setIsSearchingAddress(true);
            try {
                const res = await ymaps.geocode(query, {
                    results: 5,
                    boundedBy: mapInstanceRef.current.getBounds(),
                    strictBounds: false,
                });

                const suggestions: any[] = [];
                res.geoObjects.each((obj: any) => {
                    suggestions.push({
                        name: obj.getAddressLine(),
                        coords: obj.geometry.getCoordinates(),
                    });
                });
                setAddressSuggestions(suggestions);
            } catch {
                setAddressSuggestions([]);
            } finally {
                setIsSearchingAddress(false);
            }
        }, 400);
    };

    const selectSuggestion = (suggestion: { name: string; coords: number[] }) => {
        const ymaps = (window as any).ymaps;
        const map = mapInstanceRef.current;
        if (!ymaps || !map) return;

        map.setCenter(suggestion.coords, 15, { duration: 400 });
        updateMarker(suggestion.coords, ymaps, map);
        setAddressSearchQuery(suggestion.name);
        setValue("address", suggestion.name, { shouldValidate: true });
        setAddressSuggestions([]);
    };

    // Directors
    const { data: directors, isLoading: isDirectorsLoading } = useQuery({
        queryKey: ["directors-list"],
        queryFn: async () => {
            const res = await API.get("/api/v1/super-admin/directors/");
            return res?.data?.results || res?.data || [];
        },
    });

    const filteredDirectors = Array.isArray(directors)
        ? directors.filter((dir: any) => {
            const nameToSearch = (dir.full_name || dir.name || "").toLowerCase();
            return nameToSearch.includes(searchTerm.toLowerCase());
        })
        : [];

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
            formData.append("subscription_expires", body.subscription_expires);
            formData.append("latitude", body.latitude);
            formData.append("longitude", body.longitude);

            if (selectedFile) {
                formData.append("logo", selectedFile);
            }

            const res = await API.post("/api/v1/super-admin/centers/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data?.message || "Muvaffaqiyatli yaratildi!");
            reset();
            setPhoneDisplay("");
            setLogoPreview("");
            setSelectedFile(null);
            setSelectedDirectorName("");
            setSearchTerm("");
            setCoords(null);
            setAddressSearchQuery("");
            queryClient.invalidateQueries({ queryKey: ["learning-centers"] });
            onClose?.();
        },
        onError: (error: any) => {
            const responseData = error?.response?.data;
            if (responseData && typeof responseData === "object") {
                Object.keys(responseData).forEach((key) => {
                    if (key in schema.fields) {
                        setError(key as any, {
                            type: "manual",
                            message: responseData[key][0],
                        });
                    } else {
                        toast.error(`${key}: ${responseData[key][0]}`);
                    }
                });
            } else {
                toast.error("Xatolik yuz berdi, qaytadan urinib ko'ring");
            }
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
        setLogoPreview(URL.createObjectURL(file));
    };

    const clearLogo = () => {
        setSelectedFile(null);
        setLogoPreview("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, "");
        const withPrefix = raw.startsWith("998") ? raw : "998" + raw.replace(/^998/, "");
        const local = withPrefix.slice(3, 12);
        setPhoneDisplay(formatUzPhone(local));
        setValue("phone", "998" + local, { shouldValidate: true });
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue("name", val);
        const generatedSlug = val
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
        setValue("slug", generatedSlug, { shouldValidate: true });
    };

    const onSubmit = (data: FormData) => {
        addCenter(data);
    };

    const inputCls = (hasError?: boolean) =>
        `border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${hasError
            ? "border-red-300 dark:border-red-800 bg-red-50/10"
            : "border-slate-200 dark:border-slate-700 focus:border-indigo-400 dark:focus:border-indigo-600"
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"}`}
                onClick={onClose}
            />

            <div
                className={`bg-white dark:bg-slate-900 p-6 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 transform transition-all duration-500 ease-out ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-12 scale-95"
                    }`}
            >
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                <div className="mb-[10px] border border-slate-200 dark:border-slate-700 shadow-sm w-[44px] h-[44px] rounded-lg flex justify-center items-center text-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20">
                    <Building2 className="w-6 h-6" />
                </div>

                <h3 className="text-slate-900 dark:text-slate-100 text-[18px] font-semibold mb-4">
                    {t("centers.add_title")}
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Name & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("centers.center_name")}</label>
                            <input
                                {...register("name")}
                                type="text"
                                onChange={handleNameChange}
                                placeholder="E.g., Najot Ta'lim"
                                className={inputCls(!!errors.name)}
                            />
                            {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("centers.slug")}</label>
                            <input
                                {...register("slug")}
                                type="text"
                                placeholder="najot-talim"
                                className={inputCls(!!errors.slug)}
                            />
                            {errors.slug && <p className="text-red-400 text-[11px] mt-1">{errors.slug.message}</p>}
                        </div>
                    </div>

                    {/* Logo */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[14px] text-slate-600 dark:text-slate-300 font-semibold">{t("centers.logo")}</label>
                        </div>

                        <div className="flex gap-4 items-center border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                            <div className="relative w-16 h-16 min-w-16 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden group">
                                {logoPreview ? (
                                    <>
                                        <Image
                                            src={logoPreview}
                                            alt="Logo preview"
                                            width={200}
                                            height={200}
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
                                    <ImageIcon className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                                )}
                            </div>

                            <div className="w-full">
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
                                        className="inline-flex items-center gap-2 px-4 h-[38px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                                    >
                                        <Upload className="w-3.5 h-3.5" /> {t("centers.choose_image")}
                                    </label>
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t("centers.image_hint")}</p>
                                </>
                            </div>
                        </div>
                    </div>

                    {/* Director dropdown */}
                    <div ref={dropdownRef} className="relative">
                        <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("centers.director")}</label>
                        <div
                            onClick={() => !isDirectorsLoading && setIsOpen(!isOpen)}
                            className={`border rounded-lg w-full h-[40px] px-3 text-[14px] flex items-center justify-between cursor-pointer bg-white dark:bg-slate-800 transition-all
                            ${errors.director ? "border-red-300 dark:border-red-800" : "border-slate-200 dark:border-slate-700"}
                            ${isDirectorsLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                            <span className={selectedDirectorName ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}>
                                {isDirectorsLoading ? t("centers.loading_directors") : selectedDirectorName || t("centers.select_director")}
                            </span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </div>

                        {isOpen && (
                            <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 max-h-[220px] overflow-hidden flex flex-col">
                                <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 sticky top-0">
                                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder={t("centers.search_director")}
                                        className="w-full bg-transparent text-xs outline-none h-6 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                                        autoFocus
                                    />
                                    {searchTerm && (
                                        <X onClick={() => setSearchTerm("")} className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer" />
                                    )}
                                </div>
                                <div className="overflow-y-auto flex-1 max-h-[160px]">
                                    {filteredDirectors.length > 0 ? (
                                        filteredDirectors.map((dir: any) => {
                                            const nameText = dir.full_name || dir.name || dir.id;
                                            return (
                                                <div
                                                    key={dir.id}
                                                    onClick={() => {
                                                        setSelectedDirectorName(nameText);
                                                        setValue("director", dir.id, { shouldValidate: true });
                                                        setIsOpen(false);
                                                        setSearchTerm("");
                                                    }}
                                                    className={`px-3 py-2 text-[13px] text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-600 cursor-pointer transition-colors
                                                    ${selectedDirectorName === nameText ? "bg-indigo-50/60 dark:bg-indigo-950/40 font-medium text-indigo-600" : ""}`}
                                                >
                                                    {nameText}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-3 py-3 text-xs text-center text-slate-400 dark:text-slate-500">
                                            {t("common.no_results")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        {errors.director && <p className="text-red-400 text-[11px] mt-1">{errors.director.message}</p>}
                    </div>

                    {/* Phone & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("common.phone")}</label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3 flex items-center gap-1.5 select-none pointer-events-none">
                                    <span className="text-base leading-none">🇺🇿</span>
                                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-300">+998</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phoneDisplay}
                                    onChange={handlePhoneChange}
                                    placeholder="90-123-45-67"
                                    className={`border rounded-lg w-full h-[40px] pl-[90px] pr-[10px] text-[14px] outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${errors.phone ? "border-red-300 dark:border-red-800 bg-red-50/10" : "border-slate-200 dark:border-slate-700"
                                        }`}
                                />
                            </div>
                            {errors.phone && <p className="text-red-400 text-[11px] mt-1 ml-2">{errors.phone.message}</p>}
                        </div>
                        <div>
                            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("directors.email")}</label>
                            <input
                                {...register("email")}
                                type="email"
                                placeholder="center@example.com"
                                className={inputCls(!!errors.email)}
                            />
                            {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email.message}</p>}
                        </div>
                    </div>

                    {/* ═══════════════════════ YANDEX MAP ═══════════════════════ */}
                    <div>
                        <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {t("centers.location") || "Joylashuv"}
                        </label>

                        {/* Address search */}
                        <div className="relative mb-2" ref={suggestionsRef}>
                            <div className="relative flex items-center">
                                <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                <input
                                    type="text"
                                    value={addressSearchQuery}
                                    onChange={(e) => handleAddressSearch(e.target.value)}
                                    placeholder={t("centers.address_placeholder") || "Manzilni kiriting yoki xaritadan tanlang..."}
                                    className={`border rounded-lg w-full h-[40px] pl-9 pr-9 text-[14px] outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 ${errors.address
                                        ? "border-red-300 dark:border-red-800"
                                        : "border-slate-200 dark:border-slate-700 focus:border-indigo-400 dark:focus:border-indigo-600"
                                        }`}
                                />
                                {isSearchingAddress && (
                                    <Loader2 className="absolute right-3 w-3.5 h-3.5 text-indigo-400 animate-spin" />
                                )}
                                {!isSearchingAddress && addressSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAddressSearchQuery("");
                                            setValue("address", "", { shouldValidate: true });
                                            setAddressSuggestions([]);
                                        }}
                                        className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Suggestions */}
                            {addressSuggestions.length > 0 && (
                                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                                    {addressSuggestions.map((s, i) => (
                                        <div
                                            key={i}
                                            onClick={() => selectSuggestion(s)}
                                            className="flex items-start gap-2 px-3 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                                        >
                                            <MapPin className="w-3.5 h-3.5 mt-0.5 text-indigo-400 shrink-0" />
                                            <span>{s.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {errors.address && <p className="text-red-400 text-[11px] mb-1.5">{errors.address.message}</p>}

                        {/* Map */}
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                            {mapLoading && (
                                <div className="absolute inset-0 z-10 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Xarita yuklanmoqda...</span>
                                </div>
                            )}
                            {mapError && (
                                <div className="absolute inset-0 z-10 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2">
                                    <MapPin className="w-6 h-6 text-red-400" />
                                    <span className="text-xs text-slate-500 dark:text-slate-400">Xarita yuklanmadi</span>
                                </div>
                            )}
                            {!mapLoading && !mapError && !coords && (
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 text-[11px] font-medium px-3 py-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-700 whitespace-nowrap pointer-events-none backdrop-blur-sm">
                                    📍 Joylashuvni belgilash uchun xaritaga bosing
                                </div>
                            )}
                            <div ref={mapContainerRef} className="w-full h-[220px]" />
                        </div>

                        {/* Coords badge */}
                        {coords && (
                            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg px-3 py-2">
                                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span>
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Lat:</span> {coords.lat}
                                    <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">Lng:</span> {coords.lng}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (placemarkRef.current && mapInstanceRef.current) {
                                            mapInstanceRef.current.geoObjects.remove(placemarkRef.current);
                                            placemarkRef.current = null;
                                        }
                                        setCoords(null);
                                        setValue("latitude", "");
                                        setValue("longitude", "");
                                    }}
                                    className="ml-auto text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}

                        {(errors.latitude || errors.longitude) && (
                            <p className="text-red-400 text-[11px] mt-1">
                                {errors.latitude?.message || errors.longitude?.message}
                            </p>
                        )}

                        <input type="hidden" {...register("latitude")} />
                        <input type="hidden" {...register("longitude")} />
                    </div>

                    {/* Status & Subscription */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("centers.col_status")}</label>
                            <select
                                {...register("status")}
                                className="border border-slate-200 dark:border-slate-700 rounded-lg w-full h-[40px] px-3 text-[14px] outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors cursor-pointer"
                            >
                                <option value="active">{t("centers.status.active")}</option>
                                <option value="pending">{t("centers.status.pending")}</option>
                                <option value="inactive">{t("centers.status.inactive")}</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("centers.subscription_expires")}</label>
                            <input
                                {...register("subscription_expires")}
                                type="date"
                                className={`border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${errors.subscription_expires ? "border-red-300 dark:border-red-800" : "border-slate-200 dark:border-slate-700"
                                    }`}
                            />
                            {errors.subscription_expires && <p className="text-red-400 text-[11px] mt-1">{errors.subscription_expires.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-[40px] mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg text-[14px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isPending ? t("centers.creating") : t("centers.create_btn")}
                    </button>
                </form>
            </div>
        </div>
    );
}