import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Apple, Clock, Facebook, Instagram, Mail, MapPin, Phone, Send, Smartphone, Youtube } from "lucide-react";
import { categories, localizeCategories } from "../data/mock";
import { useShop } from "../lib/store";
import { Logo } from "../lib/ui";
export const Footer = () => {
  const { t } = useTranslation();
  const { pushToast } = useShop();
  const [email, setEmail] = useState("");
  const subscribe = (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      pushToast(t("emailInvalid"), "error");
      return;
    }
    pushToast(t("subscribed"), "success");
    setEmail("");
  };
  return <footer className="mt-16 border-t bg-[var(--surface)]">
      <div className="container-page py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-[var(--muted)]">{t("footerDesc")}</p>
            <div className="mt-4 flex items-center gap-2">
              {[Instagram, Facebook, Send, Youtube].map((Icon, i) => <a key={i} href="#" onClick={(e) => e.preventDefault()} className="flex h-8 w-8 items-center justify-center rounded-lg border text-[var(--muted)] transition hover:border-brand-400 hover:text-brand-600" aria-label="social">
                  <Icon size={14} />
                </a>)}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => pushToast(t("appComingSoon"), "info")} className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition hover:bg-[var(--surface-2)]"><Smartphone size={13} /> App Store</button>
              <button onClick={() => pushToast(t("appComingSoon"), "info")} className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition hover:bg-[var(--surface-2)]"><Apple size={13} /> Google Play</button>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider">{t("footerShop")}</h3>
            <ul className="mt-3 space-y-2 text-xs font-semibold text-[var(--muted)]">
              <li><Link to="/catalog" className="transition hover:text-brand-600">{t("allProducts")}</Link></li>
              {localizeCategories(categories).slice(0, 4).map((c) => <li key={c.id}><Link to={`/catalog?category=${c.id}`} className="transition hover:text-brand-600">{c.name}</Link></li>)}
              <li><Link to="/promotions" className="transition hover:text-brand-600">{t("promotions")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider">{t("footerHelp")}</h3>
            <ul className="mt-3 space-y-2 text-xs font-semibold text-[var(--muted)]">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="transition hover:text-brand-600">{t("aboutLink")}</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="transition hover:text-brand-600">{t("faqLink")}</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="transition hover:text-brand-600">{t("termsLink")}</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="transition hover:text-brand-600">{t("privacyLink")}</a></li>
              <li><Link to="/orders" className="transition hover:text-brand-600">{t("tracking")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider">{t("footerContact")}</h3>
            <ul className="mt-3 space-y-2.5 text-xs font-semibold text-[var(--muted)]">
              <li className="flex items-center gap-2"><Phone size={13} className="text-brand-500" /> {t("contactPhone")}</li>
              <li className="flex items-center gap-2"><Mail size={13} className="text-brand-500" /> {t("contactEmail")}</li>
              <li className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 text-brand-500" /> {t("city")}, Amir Temur 108</li>
              <li className="flex items-center gap-2"><Clock size={13} className="text-brand-500" /> {t("openingHours")}</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-gradient-to-r from-brand-700 to-brand-500 p-5 text-white sm:p-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-lg font-extrabold">{t("newsletterTitle")}</h3>
              <p className="mt-1 max-w-md text-xs text-white/80">{t("newsletterDesc")}</p>
            </div>
            <form onSubmit={subscribe} className="flex w-full gap-2 sm:w-auto">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="h-11 w-full rounded-xl border-0 bg-white/15 px-3.5 text-sm font-semibold text-white outline-none placeholder:text-white/60 sm:w-64" placeholder={t("emailPlaceholder")} />
              <button type="submit" className="btn h-11 shrink-0 bg-white px-4 text-brand-700 hover:bg-lime-300">{t("subscribe")}</button>
            </form>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t pt-5 text-[11px] font-semibold text-[var(--muted)] sm:flex-row">
          <p>© 2026 MaxSHOP. {t("rights")}</p>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[var(--surface-2)] px-2 py-1">Payme</span>
            <span className="rounded-md bg-[var(--surface-2)] px-2 py-1">Click</span>
            <span className="rounded-md bg-[var(--surface-2)] px-2 py-1">Uzum Bank</span>
            <span className="rounded-md bg-[var(--surface-2)] px-2 py-1">Visa</span>
            <span className="rounded-md bg-[var(--surface-2)] px-2 py-1">Mastercard</span>
          </div>
        </div>
      </div>
    </footer>;
};
