import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Home, Search } from "lucide-react";
export const NotFound = () => {
  const { t } = useTranslation();
  return <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <p className="font-display text-[7rem] font-extrabold leading-none text-brand-500/15 sm:text-[10rem]">404</p>
      <h1 className="-mt-6 font-display text-2xl font-extrabold sm:text-3xl">{t("notFoundTitle")}</h1>
      <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">{t("notFoundDesc")}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Link to="/" className="btn-primary btn-sm"><Home size={14} /> {t("goHome")}</Link>
        <Link to="/catalog" className="btn-secondary btn-sm"><Search size={14} /> {t("catalog")}</Link>
        <button onClick={() => window.history.back()} className="btn-ghost btn-sm"><ArrowLeft size={14} /> {t("back")}</button>
      </div>
    </div>;
};
