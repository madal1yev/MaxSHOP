import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, Clock3, MapPin, Package, Truck } from "lucide-react";
import { useShop } from "../lib/store";
import { formatUZS, localizeSlot } from "../data/mock";
export const OrderSuccess = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { orders } = useShop();
  const order = orders.find((o) => o.id === id);
  return <div className="container-page py-10 sm:py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-500/15">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/30 animate-fade-up">
            <Check size={34} strokeWidth={3} />
          </span>
          <span className="absolute -left-2 top-2 text-xl animate-float">🎉</span>
          <span className="absolute -right-1 bottom-3 text-xl animate-float" style={{ animationDelay: "1s" }}>🥳</span>
        </div>
        <h1 className="mt-5 font-display text-2xl font-extrabold sm:text-3xl">{t("orderSuccess")}</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">{t("orderSuccessDesc")}</p>

        {order && <div className="card mt-6 p-4 text-left sm:p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{t("orderSuccessNote")}</p>
                <p className="font-display text-xl font-extrabold">#{order.id}</p>
              </div>
              <span className="badge bg-brand-500/15 text-brand-700 dark:text-brand-300"><Truck size={11} /> {t("statusConfirmed")}</span>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <p className="flex items-start gap-2"><MapPin size={13} className="mt-0.5 shrink-0 text-brand-500" /> <span className="text-[var(--muted)]">{order.address}</span></p>
              <p className="flex items-center gap-2"><Clock3 size={13} className="text-brand-500" /> <span className="text-[var(--muted)]">{localizeSlot(order.slot)}</span></p>
              <p className="flex items-center gap-2"><Package size={13} className="text-brand-500" /> <span className="text-[var(--muted)]">{order.items.length} {t("itemsCount")}</span></p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <span className="text-xs font-extrabold">{t("total")}</span>
              <span className="font-display text-lg font-extrabold text-brand-700 dark:text-brand-400">{formatUZS(order.total)}</span>
            </div>
          </div>}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {order && <Link to={`/tracking/${order.id}`} className="btn-primary flex-1"><Truck size={16} /> {t("trackOrder")}</Link>}
          <Link to="/orders" className="btn-secondary flex-1">{t("continueToOrders")}</Link>
        </div>
        <Link to="/catalog" className="mt-3 inline-block text-xs font-extrabold text-brand-600 dark:text-brand-400">{t("continueShopping")} →</Link>
        <p className="mt-4 text-[10px] text-[var(--muted)]">{t("orderTrackingNote")}</p>
      </div>
    </div>;
};
