import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API } from "@/services/api";
import { ILearningCenter } from "@/types";
import { X, Loader2, Building2, Upload, MapPin, Search } from "lucide-react";
import { toast } from "react-toastify";
import { t } from "i18next";
import Image from "next/image";

interface EditModalProps {
  center: ILearningCenter;
  onClose: () => void;
}

const formatPhoneInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits.startsWith("998")) return "+998 ";
  let formatted = "+998 ";
  if (digits.length > 3) formatted += `(${digits.slice(3, 5)}`;
  if (digits.length > 5) formatted += `) ${digits.slice(5, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  if (digits.length > 10) formatted += `-${digits.slice(10, 12)}`;
  return formatted.trim();
};

function loadYandexMaps(): Promise<void> {
  const win = window as any;
  if (win.__ymapsReady) return Promise.resolve();
  if (win.__ymapsPromise) return win.__ymapsPromise;

  if (win.ymaps) {
    win.__ymapsPromise = new Promise<void>((resolve) => {
      win.ymaps.ready(() => {
        win.__ymapsReady = true;
        resolve();
      });
    });
    return win.__ymapsPromise;
  }

  win.__ymapsPromise = new Promise<void>((resolve, reject) => {
    const apiKey = process.env.NEXT_PUBLIC_YANDEX_MAPS_KEY;
    const existing = document.querySelector(`script[src*="api-maps.yandex.ru"]`);
    if (existing) {
      const wait = () => {
        if (win.ymaps) {
          win.ymaps.ready(() => {
            win.__ymapsReady = true;
            resolve();
          });
        } else {
          setTimeout(wait, 100);
        }
      };
      wait();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      win.ymaps.ready(() => {
        win.__ymapsReady = true;
        resolve();
      });
    };
    script.onerror = () => reject(new Error("Yandex Maps yuklanmadi"));
    document.head.appendChild(script);
  });

  return win.__ymapsPromise;
}

export default function EditLearningCenterModal({ center, onClose }: EditModalProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    phone: "",
    email: "",
    address: "",
    director: "",
    status: "active",
    subscription_expires: "",
    latitude: "",
    longitude: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

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
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Center ma'lumotlarini formaga to'ldirish
  useEffect(() => {
    if (center) {
      const lat = (center as any).latitude || "";
      const lng = (center as any).longitude || "";
      setFormData({
        name: center.name || "",
        slug: center.slug || "",
        phone: center.phone ? formatPhoneInput(center.phone) : "+998 ",
        email: center.email || "",
        address: center.address || "",
        director: (center as any).director || "",
        status: center.status || "active",
        subscription_expires: center.subscription_expires
          ? center.subscription_expires.split("T")[0]
          : "",
        latitude: lat,
        longitude: lng,
      });
      setLogoPreview(center.logo || "");
      setAddressSearchQuery(center.address || "");
      if (lat && lng) {
        setCoords({ lat, lng });
      }
    }
  }, [center]);

  // ─── Marker qo'yish (overflow-hidden muammosini hal qilgan) ───────────────
  const placeMarkerOnMap = useCallback(
    (
      coordinate: number[],
      ymaps: any,
      map: any,
      reverseGeocode = true,
      updateState = true,
    ) => {
      // Eski markerni o'chirish
      if (placemarkRef.current) {
        try {
          map.geoObjects.remove(placemarkRef.current);
        } catch (_) { }
        placemarkRef.current = null;
      }

      const placemark = new ymaps.Placemark(
        coordinate,
        {},
        {
          preset: "islands#violetDotIconWithCaption",
          iconColor: "#4F46E5",
        },
      );

      map.geoObjects.add(placemark);
      placemarkRef.current = placemark;

      if (updateState) {
        const latStr = coordinate[0].toFixed(6);
        const lngStr = coordinate[1].toFixed(6);
        setCoords({ lat: latStr, lng: lngStr });
        setFormData((prev) => ({ ...prev, latitude: latStr, longitude: lngStr }));
      }

      if (reverseGeocode) {
        ymaps.geocode(coordinate, { results: 1 }).then((res: any) => {
          const first = res.geoObjects.get(0);
          if (first) {
            const addressText = first.getAddressLine();
            setFormData((prev) => ({ ...prev, address: addressText }));
            setAddressSearchQuery(addressText);
          }
        });
      }
    },
    [],
  );

  // ─── Map init ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapInstanceRef.current) return;


    const lat = (center as any).latitude;
    const lng = (center as any).longitude;
    const hasCoords = !!(lat && lng);

    loadYandexMaps()
      .then(() => {
        if (!mapContainerRef.current) return;
        if (mapInstanceRef.current) return;

        const ymaps = (window as any).ymaps;

        const initialCenter = hasCoords
          ? [parseFloat(lat), parseFloat(lng)]
          : [41.2995, 69.2401];

        const map = new ymaps.Map(
          mapContainerRef.current,
          {
            center: initialCenter,
            zoom: hasCoords ? 15 : 12,
            controls: ["zoomControl"],
          },
          // ✅ overflow: visible — marker icon clip bo'lmasligi uchun
          { suppressMapOpenBlock: true },
        );

        mapInstanceRef.current = map;
        setMapLoading(false);

        // Mavjud koordinatalar bo'lsa marker qo'yamiz
        if (hasCoords) {
          // ymaps.ready ichida qo'shamiz — map to'liq tayyor bo'lishi uchun
          ymaps.ready(() => {
            placeMarkerOnMap(
              [parseFloat(lat), parseFloat(lng)],
              ymaps,
              map,
              false, // reverse geocode kerak emas, address allaqachon bor
              false, // state yangilanmaydi (formData allaqachon to'ldirilgan)
            );
          });
        }

        map.events.add("click", (e: any) => {
          const coordinate = e.get("coords");
          placeMarkerOnMap(coordinate, ymaps, map, true, true);
        });
      })
      .catch(() => {
        setMapError(true);
        setMapLoading(false);
      });

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
        } catch (_) { }
        mapInstanceRef.current = null;
        // ✅ Container ni ham tozalaymiz
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = "";
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Address search ───────────────────────────────────────────────────────
  const handleAddressSearch = (query: string) => {
    setAddressSearchQuery(query);
    setFormData((prev) => ({ ...prev, address: query }));

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
        const res = await ymaps.geocode(query, { results: 5 });
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

  const selectSuggestion = useCallback(
    (suggestion: { name: string; coords: number[] }) => {
      const ymaps = (window as any).ymaps;
      const map = mapInstanceRef.current;
      if (!ymaps || !map) return;

      setAddressSuggestions([]);
      setAddressSearchQuery(suggestion.name);
      setFormData((prev) => ({
        ...prev,
        address: suggestion.name,
        latitude: suggestion.coords[0].toFixed(6),
        longitude: suggestion.coords[1].toFixed(6),
      }));
      setCoords({
        lat: suggestion.coords[0].toFixed(6),
        lng: suggestion.coords[1].toFixed(6),
      });

      // Xaritani ko'chiramiz, keyin marker qo'yamiz
      map.panTo(suggestion.coords, { flying: true, duration: 400 }).then(() => {
        map.setZoom(15, { duration: 200 }).then(() => {
          placeMarkerOnMap(suggestion.coords, ymaps, map, false, false);
        });
      });
    },
    [placeMarkerOnMap],
  );

  const clearMarker = () => {
    if (placemarkRef.current && mapInstanceRef.current) {
      try {
        mapInstanceRef.current.geoObjects.remove(placemarkRef.current);
      } catch (_) { }
      placemarkRef.current = null;
    }
    setCoords(null);
    setFormData((prev) => ({ ...prev, latitude: "", longitude: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value;
    if (inputVal.length < 5) {
      setFormData((prev) => ({ ...prev, phone: "+998 " }));
      return;
    }
    setFormData((prev) => ({ ...prev, phone: formatPhoneInput(inputVal) }));
  };

  const { mutate: updateCenter, isPending } = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("slug", formData.slug);
      data.append("phone", formData.phone.replace(/\D/g, ""));
      data.append("email", formData.email);
      data.append("address", formData.address);
      data.append("director", formData.director);
      data.append("status", formData.status);
      data.append("subscription_expires", formData.subscription_expires);
      data.append("latitude", formData.latitude);
      data.append("longitude", formData.longitude);
      if (logoFile) data.append("logo", logoFile);
      await API.put(`super-admin/centers/${center.id}/`, data);
    },
    onSuccess: () => {
      toast.success("O'quv markazi muvaffaqiyatli yangilandi!");
      queryClient.invalidateQueries({ queryKey: ["learning-centers"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        "Yangilashda xatolik yuz berdi",
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      toast.error("Xaritadan joylashuvni belgilang");
      return;
    }
    updateCenter();
  };

  const inputCls =
    "w-full h-10 px-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500";

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl border border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-[10px] border border-slate-200 dark:border-slate-700 shadow-sm w-[44px] h-[44px] rounded-lg flex justify-center items-center text-indigo-600 bg-indigo-50/10 dark:bg-indigo-950/20">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-slate-900 dark:text-slate-100 text-[18px] font-semibold mb-4">
            {t("centers.edit_title")}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Logo */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                {t("centers.logo")}
              </label>
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-600 rounded-xl">
                <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Logo"
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div className="flex flex-col items-start gap-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 h-9 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-500" />
                    {t("centers.choose_image")}
                  </button>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    {t("centers.image_hint_edit")}
                  </span>
                </div>
              </div>
            </div>

            {/* Name & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t("centers.center_name")} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={inputCls}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t("centers.slug")} *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                    }))
                  }
                  className={`${inputCls} font-mono`}
                  required
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t("common.phone")} *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="+998 (90) 123-45-67"
                  maxLength={19}
                  className={inputCls}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t("directors.email")} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className={inputCls}
                  required
                />
              </div>
            </div>

            {/* ═══════════════════ YANDEX MAP ═══════════════════ */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                {t("centers.location") || "Joylashuv va manzil"} *
              </label>

              {/* Address search */}
              <div className="relative">
                <div className="relative flex items-center">
                  <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={addressSearchQuery}
                    onChange={(e) => handleAddressSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (addressSuggestions.length > 0) {
                          selectSuggestion(addressSuggestions[0]);
                        }
                      }
                    }}
                    placeholder={
                      t("centers.address_placeholder") ||
                      "Manzilni kiriting yoki xaritadan tanlang..."
                    }
                    className={`${inputCls} pl-9 pr-9`}
                  />
                  {isSearchingAddress && (
                    <Loader2 className="absolute right-3 w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  )}
                  {!isSearchingAddress && addressSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setAddressSearchQuery("");
                        setFormData((prev) => ({ ...prev, address: "" }));
                        setAddressSuggestions([]);
                      }}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

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

              {/* ✅ Map wrapper — overflow-hidden FAQAT tashqi border uchun,
                   map container o'zi overflow: visible bo'ladi */}
              <div className="relative mt-2 rounded-xl border border-slate-200 dark:border-slate-700">
                {/* Loading overlay */}
                {mapLoading && (
                  <div className="absolute inset-0 z-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    <span className="text-xs text-slate-500">
                      Xarita yuklanmoqda...
                    </span>
                  </div>
                )}
                {/* Error overlay */}
                {mapError && (
                  <div className="absolute inset-0 z-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-2">
                    <MapPin className="w-6 h-6 text-red-400" />
                    <span className="text-xs text-slate-500">
                      Xarita yuklanmadi
                    </span>
                  </div>
                )}
                {/* Hint */}
                {!mapLoading && !mapError && !coords && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 text-[11px] font-medium px-3 py-1.5 rounded-full shadow-md border border-slate-200 dark:border-slate-700 whitespace-nowrap pointer-events-none backdrop-blur-sm">
                    📍 Joylashuvni belgilash uchun xaritaga bosing
                  </div>
                )}

                {/* ✅ Map container — overflow visible, border-radius clip yo'q */}
                <div
                  ref={mapContainerRef}
                  className="w-full h-[220px] rounded-xl"
                  style={{ overflow: "visible" }}
                />
              </div>

              {/* Coords badge */}
              {coords && (
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-lg px-3 py-2">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      Lat:
                    </span>{" "}
                    {coords.lat}
                    <span className="mx-2 text-slate-300 dark:text-slate-600">|</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      Lng:
                    </span>{" "}
                    {coords.lng}
                  </span>
                  <button
                    type="button"
                    onClick={clearMarker}
                    className="ml-auto text-slate-400 hover:text-red-400 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Status & Subscription */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t("centers.col_status")} *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className={inputCls}
                >
                  <option value="active">{t("centers.status.active")}</option>
                  <option value="pending">{t("centers.status.pending")}</option>
                  <option value="inactive">{t("centers.status.inactive")}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t("centers.subscription_expires")} *
                </label>
                <input
                  type="date"
                  value={formData.subscription_expires}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      subscription_expires: e.target.value,
                    }))
                  }
                  className={inputCls}
                  required
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-semibold rounded-lg cursor-pointer transition-colors"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg disabled:opacity-60 cursor-pointer transition-colors"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("centers.saving")}</span>
                  </>
                ) : (
                  t("centers.save_btn")
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}