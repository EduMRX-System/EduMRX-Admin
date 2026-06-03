import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./public/locales/en.json";
import uz from "./public/locales/uz.json";
import ru from "./public/locales/ru.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en }, 
    uz: { translation: uz },
    ru: { translation: ru },
  },
  lng: "uz",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
