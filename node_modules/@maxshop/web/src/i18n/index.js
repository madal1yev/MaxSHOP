import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import uz from "./locales/uz/translation.json";
import ru from "./locales/ru/translation.json";
import en from "./locales/en/translation.json";
import { extra } from "./extra";
const savedLang = typeof localStorage !== "undefined" && localStorage.getItem("maxshop-lang") || "uz";
if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    resources: {
      uz: { translation: { ...uz, ...extra.uz } },
      ru: { translation: { ...ru, ...extra.ru } },
      en: { translation: { ...en, ...extra.en } }
    },
    lng: savedLang,
    fallbackLng: "uz",
    interpolation: { escapeValue: false },
    react: { useSuspense: false }
  });
}
i18next.on("languageChanged", (lng) => {
  if (typeof document !== "undefined") document.documentElement.lang = lng;
  if (typeof localStorage !== "undefined") localStorage.setItem("maxshop-lang", lng);
});
export default i18next;
