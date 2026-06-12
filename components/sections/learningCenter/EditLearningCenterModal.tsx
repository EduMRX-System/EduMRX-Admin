"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { API } from "@/services/api";
import { ILearningCenter, Director } from "@/types";
import {
  X, Loader2, Building2, Upload, MapPin, Search,
  ChevronDown, Check, Sparkles, Zap, Award, HelpCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { t } from "i18next";
import { formatUzPhone } from "@/utils/formatters";
import { useUIStore } from "@/store/useUIStore";

// ═════════════════════════════════════════════════════════════════
// PHONE INPUT KOMPONENTI (ADD MODAL BILAN BIR XIL MUKAMMAL INTEGRATSIYA)
// ═════════════════════════════════════════════════════════════════
interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}



const PhoneInput = ({ value, onChange, error }: PhoneInputProps) => {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, "");

    // Agar foydalanuvchi tasodifan boshiga yana 998 yozsa qirqib tashlaymiz
    if (raw.startsWith("998") && raw.length > 3) {
      raw = raw.slice(3);
    }

    const local = raw.slice(0, 9);
    const full = "998" + local;
    onChange(full);
  };

  return (
    <div>
      <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">
        {t("common.phone")} *
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3 flex items-center gap-3 pointer-events-none select-none">
          <span className="text-base">🇺🇿</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">+998</span>
        </div>
        <input
          type="tel"
          value={formatUzPhone(value.startsWith("998") ? value.slice(3) : value)}
          onChange={handlePhoneChange}
          placeholder="90-123-45-67"
          className={`border rounded-lg w-full h-[40px] pl-[90px] pr-[10px] text-[14px] outline-none focus:border-indigo-500 dark:focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors ${error
            ? "border-red-300 dark:border-red-800 bg-red-50/10"
            : "border-slate-200 dark:border-slate-700"
            }`}
          required
        />
      </div>
      {error && <p className="text-red-400 dark:text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════
// GLOBAL YANDEX MAPS SCRIPT LOADING MEXANIZMI (DUBLIKAT YUKLANISH OLDINI OLADI)
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
    script.onload = () => {
      win.ymaps.ready(() => resolve());
    };
    script.onerror = () => {
      ymapsPromise = null;
      reject(new Error(t("map.load_error")));
    };
    document.head.appendChild(script);
  });

  return ymapsPromise;
}

// ═════════════════════════════════════════════════════════════════
// OPTIONS DATA CONVERTERS WITH DARK MODE INTEGRATION
// ═════════════════════════════════════════════════════════════════
type StatusType = "active" | "inactive" | "frozen" | "pending";
type PlanType = "trial" | "pro" | "max" | "enterprise";

const getStatusOptions = () => [
  { value: "active" as StatusType, label: t("centers.status.active") || "Active", color: "bg-emerald-500" },
  { value: "suspended" as StatusType, label: t("centers.status.suspended") || "Suspended", color: "bg-blue-500" },
  { value: "inactive" as StatusType, label: t("centers.status.inactive") || "Inactive", color: "bg-rose-500" },
];

const getPlanOptions = () => [
  {
    value: "trial" as PlanType,
    label: t("plan.trial_label") || "Trial",
    desc: t("plan.trial_desc") || "Trial period, limited features",
    icon: HelpCircle,
    color: "text-slate-400 bg-slate-100 dark:bg-slate-800",
    activeBorder: "focus-within:border-slate-400 border-slate-400 text-slate-500"
  },
  {
    value: "pro" as PlanType,
    label: t("plan.pro_label") || "Pro",
    desc: t("plan.pro_desc") || "Best choice for mid-sized centers",
    icon: Zap,
    color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
    activeBorder: "focus-within:border-amber-500 border-amber-500 text-amber-600 dark:text-amber-400"
  },
  {
    value: "max" as PlanType,
    label: t("plan.max_label") || "Max",
    desc: t("plan.max_desc") || "Ultimate power for big companies",
    icon: Sparkles,
    color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30",
    activeBorder: "focus-within:border-indigo-500 border-indigo-500 text-indigo-600 dark:text-indigo-400"
  },
  {
    value: "enterprise" as PlanType,
    label: t("plan.enterprise_label") || "Enterprise",
    desc: t("plan.enterprise_desc") || "Custom features for large schools",
    icon: Award,
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
    activeBorder: "focus-within:border-emerald-500 border-emerald-500 text-emerald-600 dark:text-emerald-400"
  },
];

interface EditModalProps {
  center: ILearningCenter;
  onClose: () => void;
}

interface FetchDirectorsResponse {
  count: number;
  results: Director[];
}

export default function EditLearningCenterModal({ center, onClose }: EditModalProps) {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    phone: "998",
    email: "",
    address: "",
    director: "",
    status: "active" as StatusType,
    plan: "trial" as PlanType,
    subscription_expires: "",
    latitude: "",
    longitude: "",
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropdown Ochilish Statelari
  const [isDirectorOpen, setIsDirectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDirectorName, setSelectedDirectorName] = useState("");
  const directorDropdownRef = useRef<HTMLDivElement>(null);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const planDropdownRef = useRef<HTMLDivElement>(null);

  // Yandex Map States
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

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);


  const theme = useUIStore((state) => state.theme);
  const isDark = theme === "dark";

  // Center ma'lumotlarini formaga o'rnatish (Initial Population)
  useEffect(() => {
    if (center) {
      const lat = (center as any).latitude || "";
      const lng = (center as any).longitude || "";
      const cleanPhone = center.phone ? center.phone.replace(/\D/g, "") : "";

      setFormData({
        name: center.name || "",
        slug: center.slug || "",
        phone: cleanPhone.startsWith("998") ? cleanPhone : "998" + cleanPhone,
        email: center.email || "",
        address: center.address || "",
        director: (center as any).director || "",
        status: (center.status as StatusType) || "active",
        plan: ((center as any).plan as PlanType) || "trial",
        subscription_expires: center.subscription_expires ? center.subscription_expires.split("T")[0] : "",
        latitude: lat,
        longitude: lng,
      });

      setLogoPreview(center.logo || "");
      setAddressSearchQuery(center.address || "");
      setSelectedDirectorName((center as any).director_name || "");

      if (lat && lng) {
        setCoords({ lat, lng });
      }
    }
  }, [center]);

  // Kliklarni tashqarida ushlash (Dropdownlarni yopish uchun)
  useEffect(() => {
    setIsMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (directorDropdownRef.current && !directorDropdownRef.current.contains(event.target as Node)) setIsDirectorOpen(false);
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) setIsStatusOpen(false);
      if (planDropdownRef.current && !planDropdownRef.current.contains(event.target as Node)) setIsPlanOpen(false);
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) setAddressSuggestions([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Marker Yangilash Funksiyasi
  const updateMarker = useCallback((coordinate: number[], ymaps: any, map: any, shouldGeocode = true) => {
    const [lat, lng] = coordinate;
    const latStr = lat.toFixed(6);
    const lngStr = lng.toFixed(6);

    setCoords({ lat: latStr, lng: lngStr });
    setFormData(prev => ({ ...prev, latitude: latStr, longitude: lngStr }));

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

    if (shouldGeocode) {
      ymaps.geocode(coordinate, { results: 1 }).then((res: any) => {
        const firstGeoObject = res.geoObjects.get(0);
        if (firstGeoObject) {
          const addressText = firstGeoObject.getAddressLine();
          setFormData(prev => ({ ...prev, address: addressText }));
          setAddressSearchQuery(addressText);
        }
      });
    }
  }, []);

  // Yandex Map Yuklash va Mavjud Koordinataga Marker qo'yish
  useEffect(() => {
    if (!isMounted) return;

    loadYandexMaps()
      .then(() => {
        if (!mapContainerRef.current) return;
        const ymaps = (window as any).ymaps;

        const hasCoords = !!(formData.latitude && formData.longitude);
        const initialCenter = hasCoords
          ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
          : [41.2995, 69.2401]; // Toshkent

        const map = new ymaps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: hasCoords ? 15 : 12,
          controls: ["zoomControl"],
        }, { suppressMapOpenBlock: true });

        mapInstanceRef.current = map;
        setMapLoading(false);

        // ═════════════════════════════════════════════════════════════════
        // 3. FAQAT XARITA FONINI (GROUND) DARK MODE QILISH
        // ═════════════════════════════════════════════════════════════════
        if (isDark) {
          const groundElement = map.panes.get("ground").getElement();
          if (groundElement) {
            groundElement.style.filter = "invert(1) hue-rotate(180deg) brightness(0.85) contrast(1)";
          }
        }

        if (hasCoords) {
          ymaps.ready(() => {
            updateMarker([parseFloat(formData.latitude), parseFloat(formData.longitude)], ymaps, map, false);
          });
        }

        map.events.add("click", (e: any) => {
          const coordinate = e.get("coords");
          updateMarker(coordinate, ymaps, map, true);
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
  }, [isMounted, updateMarker, theme]);

  // Manzil qidirish mexanizmi
  const handleAddressSearch = (query: string) => {
    setAddressSearchQuery(query);
    setFormData(prev => ({ ...prev, address: query }));

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
      }
      setIsSearchingAddress(false);
    }, 400);
  };

  const selectSuggestion = (suggestion: { name: string; coords: number[] }) => {
    const ymaps = (window as any).ymaps;
    const map = mapInstanceRef.current;
    if (!ymaps || !map) return;

    map.setCenter(suggestion.coords, 15, { duration: 400 });
    updateMarker(suggestion.coords, ymaps, map, false);
    setAddressSearchQuery(suggestion.name);
    setFormData(prev => ({
      ...prev,
      address: suggestion.name,
      latitude: suggestion.coords[0].toFixed(6),
      longitude: suggestion.coords[1].toFixed(6)
    }));
    setAddressSuggestions([]);
  };

  // Directorlarni yuklash zanjiri
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: directorsData, isLoading: isDirectorsLoading } = useQuery<FetchDirectorsResponse>({
    queryKey: ["directors", currentPage, debouncedSearch],
    queryFn: async () => {
      const res = await API.get("super-admin/directors/", {
        params: { page: currentPage, page_size: 5, search: debouncedSearch || undefined },
      });
      return res.data;
    },
    enabled: isDirectorOpen,
  });

  const directorsList = directorsData?.results || [];
  const totalCount = directorsData?.count || 0;
  const totalPages = Math.ceil(totalCount / 5);

  // Yangilash (PUT) Mutation so'rovi
  const { mutate: updateCenter, isPending } = useMutation({
    mutationFn: async () => {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("slug", formData.slug);
      payload.append("phone", formData.phone);
      payload.append("email", formData.email);
      payload.append("address", formData.address);
      payload.append("director", formData.director);
      payload.append("status", formData.status);
      payload.append("plan", formData.plan);
      payload.append("subscription_expires", formData.subscription_expires);
      payload.append("latitude", formData.latitude);
      payload.append("longitude", formData.longitude);

      if (selectedFile) payload.append("logo", selectedFile);

      const res = await API.put(`super-admin/centers/${center.id}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(`${t("centers.save_btn")} ${t("api_messages.success_created").toLowerCase()}`);
      onClose();
      queryClient.invalidateQueries({ queryKey: ["learning-centers", "learning-center-detail"] });
    },
    onError: (err: any) => {
      const errData = err?.response?.data;
      if (errData?.detail?.includes("users_email_key")) return toast.error(t("api_messages.email_exists"));
      if (errData && typeof errData === "object") {
        const firstKey = Object.keys(errData)[0];
        if (firstKey) {
          const text = Array.isArray(errData[firstKey]) ? errData[firstKey][0] : errData[firstKey];
          return toast.error(`${firstKey}: ${typeof text === "string" ? text.replace(/["']/g, "") : text}`);
        }
      }
      toast.error(t("common.error"));
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t("centers.image_hint_edit"));
      return;
    }
    setSelectedFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
    setFormData(prev => ({ ...prev, name: val, slug: generatedSlug }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      toast.error(t("map.load_error") || "Iltimos, xaritadan joylashuvni tanlang");
      return;
    }
    updateCenter();
  };

  const currentPlanObj = getPlanOptions().find(o => o.value === formData.plan) || getPlanOptions()[0];
  const PlanIcon = currentPlanObj.icon;

  const inputCls = "border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700 focus:border-indigo-400 dark:focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 placeholder:text-slate-400 dark:placeholder:text-slate-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Orqa fon blur effekti */}
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500 ${isMounted ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* Modal Oynasi */}
      <div
        className={`bg-white dark:bg-slate-900 p-6 rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800 transform transition-all duration-500 ease-out ${isMounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-12 scale-95"}`}
      >
        {/* QOTIB TURUVCHI (STICKY) YOPISH TUGMASI */}
        <div className="sticky top-0 z-50 h-0 w-full flex justify-end items-start pointer-events-none">
          <button
            type="button"
            onClick={onClose}
            className="pointer-events-auto -mt-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-md cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Sarlavhasi */}
        <div className="mb-[10px] border border-slate-200 dark:border-slate-700 shadow-sm w-[44px] h-[44px] rounded-lg flex justify-center items-center text-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20">
          <Building2 className="w-6 h-6" />
        </div>

        <h3 className="text-slate-900 dark:text-slate-100 text-[18px] font-semibold mb-4">
          {t("centers.edit_title") || "O'quv markazini tahrirlash"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Ism va Slug inputlari */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("centers.center_name")} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("centers.slug")} *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                className={`${inputCls} font-mono`}
                required
              />
            </div>
          </div>

          {/* Logotip qismi */}
          <div>
            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1.5 block font-semibold">{t("centers.logo")}</label>
            <div className="flex gap-4 items-center border border-slate-200 dark:border-slate-700 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-800/50">
              <div className="relative w-16 h-16 min-w-16 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden group">
                {logoPreview ? (
                  <>
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setLogoPreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Building2 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                )}
              </div>

              <div className="w-full">
                <input
                  ref={fileInputRef}
                  id="logo-edit-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="logo-edit-file"
                  className="inline-flex items-center gap-2 px-4 h-[38px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> {t("centers.choose_image") || "Rasm tanlash"}
                </label>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{t("centers.image_hint_edit") || "Maksimal hajm: 2MB"}</p>
              </div>
            </div>
          </div>

          {/* Direktor tanlash Dropdown */}
          <div ref={directorDropdownRef} className="relative">
            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">
              {t("centers.director") || "Direktor"}
            </label>
            <div
              onClick={() => setIsDirectorOpen(!isDirectorOpen)}
              className="border border-slate-200 dark:border-slate-700 rounded-lg w-full h-[40px] px-3 text-[14px] flex items-center justify-between cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            >
              <span className={selectedDirectorName ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}>
                {selectedDirectorName || t("centers.select_director") || "Direktorni tanlang"}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDirectorOpen ? "rotate-180" : ""}`} />
            </div>

            {isDirectorOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t("centers.search_director") || "Direktor ismini qidirish..."}
                    className="w-full bg-transparent text-xs outline-none h-6 text-slate-900 dark:text-slate-100"
                    autoFocus
                  />
                </div>

                <div className="overflow-y-auto max-h-[180px] divide-y divide-slate-50 dark:divide-slate-700/50">
                  {directorsList.length > 0 ? (
                    directorsList.map((dir) => {
                      const fullName = `${dir.first_name || ""} ${dir.last_name || ""}`.trim();
                      return (
                        <div
                          key={dir.id}
                          onClick={() => {
                            setSelectedDirectorName(fullName);
                            setFormData(prev => ({ ...prev, director: dir.id }));
                            setIsDirectorOpen(false);
                          }}
                          className={`px-3 py-2 text-[13px] hover:bg-indigo-50 dark:hover:bg-indigo-950/60 cursor-pointer flex flex-col ${formData.director === dir.id ? "bg-indigo-50 dark:bg-indigo-950/40 font-medium text-indigo-600" : "text-slate-900 dark:text-slate-100"}`}
                        >
                          <span className="font-medium">{fullName}</span>
                          {dir.phone && <span className="text-[11px] text-slate-400 dark:text-slate-500">+{dir.phone}</span>}
                        </div>
                      );
                    })
                  ) : (
                    <div className="px-3 py-4 text-xs text-center text-slate-400 dark:text-slate-500">
                      {isDirectorsLoading ? t("common.loading") : t("common.no_results")}
                    </div>
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-700 dark:text-slate-300">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                      className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded disabled:opacity-50 cursor-pointer"
                    >
                      {t("common.previous") || "Orqaga"}
                    </button>
                    <span>{currentPage} / {totalPages}</span>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                      className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded disabled:opacity-50 cursor-pointer"
                    >
                      {t("common.next") || "Oldinga"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* INTEGRATSIYA QILINGAN TELEFON VA EMAIL QISMI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PhoneInput
              value={formData.phone}
              onChange={(val) => setFormData(prev => ({ ...prev, phone: val }))}
            />
            <div>
              <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("directors.email")} *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={inputCls}
                required
              />
            </div>
          </div>

          {/* Yandex Map Joylashuv Qismi */}
          <div>
            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 font-semibold flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
              {t("map.location_label") || "Manzil va Xaritadagi joylashuv"} *
            </label>

            <div className="relative mb-2" ref={suggestionsRef}>
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={addressSearchQuery}
                  onChange={(e) => handleAddressSearch(e.target.value)}
                  placeholder={t("map.search_placeholder") || "Manzilni kiriting yoki xaritadan tanlang..."}
                  className={inputCls}
                />
                {isSearchingAddress && <Loader2 className="absolute right-3 w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                {!isSearchingAddress && addressSearchQuery && (
                  <X onClick={() => { setAddressSearchQuery(""); setFormData(prev => ({ ...prev, address: "" })); setAddressSuggestions([]); }} className="absolute right-3 w-3.5 h-3.5 text-slate-400 cursor-pointer" />
                )}
              </div>

              {addressSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                  {addressSuggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => selectSuggestion(s)}
                      className="flex items-start gap-2 px-3 py-2.5 text-[13px] text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors border-b border-slate-100 dark:border-slate-700/50 last:border-0"
                    >
                      <MapPin className="w-3.5 h-3.5 mt-0.5 text-indigo-400 shrink-0" />
                      <span>{s.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              {(mapLoading || mapError) && (
                <div className="absolute inset-0 z-10 bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2">
                  {mapError ? <span className="text-xs text-red-500 font-semibold">{t("map.load_error")}</span> : <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />}
                </div>
              )}
              <div ref={mapContainerRef} className="w-full h-[200px]" style={{ overflow: "visible" }} />
            </div>
          </div>

          {/* Koordinata nishonlari */}
          {coords && (
            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span>Lat: {coords.lat} | Lng: {coords.lng}</span>
            </div>
          )}

          {/* TUNGI REJIMDA HOVER HOLATI TUZATILGAN PLAN DROPDOWNI */}
          <div ref={planDropdownRef} className="relative">
            <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">
              {t("centers.col_plan") || "Tarif rejasi"}
            </label>
            <div
              onClick={() => setIsPlanOpen(!isPlanOpen)}
              className={`border border-slate-200 dark:border-slate-700 rounded-lg w-full min-h-[48px] px-3 py-2 text-[14px] flex items-center justify-between cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all shadow-sm ${currentPlanObj.activeBorder}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentPlanObj.color}`}>
                  <PlanIcon className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-sm leading-tight">{currentPlanObj.label}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 max-w-[340px] truncate leading-normal">{currentPlanObj.desc}</span>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isPlanOpen ? "rotate-180" : ""}`} />
            </div>

            {isPlanOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col p-1">
                {getPlanOptions().map((option) => {
                  const isSelected = option.value === formData.plan;
                  const IconComp = option.icon;
                  return (
                    <div
                      key={option.value}
                      onClick={() => { setFormData(prev => ({ ...prev, plan: option.value })); setIsPlanOpen(false); }}
                      className={`px-3 py-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between mb-0.5 last:mb-0 group ${isSelected
                        ? "bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-100 dark:border-indigo-900/50"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${option.color}`}><IconComp className="w-4 h-4" /></div>
                        <div className="flex flex-col">
                          <span className={`font-semibold text-sm ${isSelected ? "text-indigo-600" : "text-slate-800 dark:text-slate-200"}`}>{option.label}</span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{option.desc}</span>
                        </div>
                      </div>
                      {isSelected && <div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TUNGI REJIMDA HOVER HOLATI TUZATILGAN STATUS DROPDOWNI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div ref={statusDropdownRef} className="relative">
              <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("centers.col_status")} *</label>
              <div
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="border border-slate-200 dark:border-slate-700 rounded-lg w-full h-[40px] px-3 text-[14px] flex items-center justify-between cursor-pointer bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${getStatusOptions().find(o => o.value === formData.status)?.color}`} />
                  <span>{getStatusOptions().find(o => o.value === formData.status)?.label}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isStatusOpen ? "rotate-180" : ""}`} />
              </div>

              {isStatusOpen && (
                <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
                  {getStatusOptions().map((option) => {
                    const isSelected = option.value === formData.status;
                    return (
                      <div
                        key={option.value}
                        onClick={() => { setFormData(prev => ({ ...prev, status: option.value })); setIsStatusOpen(false); }}
                        className={`px-3 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${option.color}`} />
                          <span>{option.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="text-[14px] text-slate-600 dark:text-slate-300 mb-1 block font-semibold">{t("centers.subscription_expires")} *</label>
              <input
                type="date"
                value={formData.subscription_expires}
                onChange={(e) => setFormData(prev => ({ ...prev, subscription_expires: e.target.value }))}
                className="border rounded-lg w-full h-[40px] px-3 text-[14px] outline-none transition-all bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-700"
                required
              />
            </div>
          </div>

          {/* Pastki Harakat Tugmalari */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-sm font-semibold rounded-lg cursor-pointer transition-colors"
            >
              {t("common.cancel") || "Bekor qilish"}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 cursor-pointer transition-colors"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? t("centers.saving") : t("centers.save_btn") || "Saqlash"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}