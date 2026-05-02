import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import ar from "./locales/ar";

const savedLang = typeof window !== "undefined"
  ? (localStorage.getItem("sk-lang") ?? "en")
  : "en";

i18n.use(initReactI18next).init({
  resources: {
    en,
    ar,
  },
  lng: savedLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Apply RTL direction on init
if (typeof document !== "undefined") {
  document.documentElement.lang = savedLang;
  document.documentElement.dir = savedLang === "ar" ? "rtl" : "ltr";
}

export function setLanguage(lang: "en" | "ar") {
  i18n.changeLanguage(lang);
  localStorage.setItem("sk-lang", lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

export default i18n;
