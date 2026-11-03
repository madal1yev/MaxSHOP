import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Heart } from "lucide-react";
import { products } from "../data/mock";
import { useShop } from "../lib/store";
import { EmptyState, ProductCard } from "../lib/ui";
export const FavoritesPage = () => {
  const { t } = useTranslation();
  const { favorites } = useShop();
  const list = products.filter((p) => favorites.includes(p.id));
  const recommended = products.filter((p) => !favorites.includes(p.id)).slice(0, 4);
  return <div className="container-page py-5 sm:py-7">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">{t("favoritesTitle")}</h1>
          <p className="mt-1 text-xs text-[var(--muted)]">{t("favoritesSubtitle")} · {list.length} {t("itemsCount")}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500"><Heart size={20} className="fill-rose-500" /></span>
      </div>

      {list.length === 0 ? <EmptyState
    icon={<Heart size={28} />}
    title={t("emptyFavorites")}
    description={t("emptyFavoritesDesc")}
    action={<Link to="/catalog" className="btn-primary btn-sm">{t("browseProducts")}</Link>}
  /> : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>}

      <div className="mt-10">
        <h2 className="mb-4 section-title">{t("recommended")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {recommended.map((p) => <ProductCard key={p.id} product={p} compact />)}
        </div>
      </div>
    </div>;
};
