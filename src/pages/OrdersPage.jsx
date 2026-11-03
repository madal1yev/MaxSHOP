import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Ban,
  ChevronRight,
  Clock3,
  MapPin,
  Package,
  PackageCheck,
  Plus,
  RotateCcw,
  Truck,
  Wallet
} from "lucide-react";
import { formatUZS, getProduct, localizeSlot } from "../data/mock";
import { localizeOrderItem } from "../data/productI18n";
import { useShop } from "../lib/store";
import { EmptyState, MapView, Modal, OrderProgress, OrderStatusBadge, cn } from "../lib/ui";
import { formatCountdown, getOrderTracking } from "../lib/tracking";

const tabs = [
  { key: "all", label: "all" },
  { key: "active", label: "activeOrder" },
  { key: "delivered", label: "statusDelivered" },
  { key: "cancelled", label: "statusCancelled" }
];

const statusIcons = {
  confirmed: Package,
  preparing: Package,
  delivering: Truck,
  delivered: PackageCheck,
  cancelled: Ban
};

const ProductThumb = ({ item, large = false }) => {
  const product = getProduct(item.productId);
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-white",
        large ? "h-14 w-14 p-1.5" : "h-11 w-11 p-1"
      )}
    >
      {product?.img ? (
        <img
          alt={item.name}
          className="h-full w-full object-contain"
          loading="lazy"
          src={product.img}
        />
      ) : (
        <span className={large ? "text-2xl" : "text-lg"}>{item.emoji}</span>
      )}
    </span>
  );
};

const OrderThumbs = ({ order, size = 4 }) => (
  <>
    {order.items.slice(0, size).map((item, i) => (
      <span key={`${item.productId}-${i}`} className="relative">
        <ProductThumb item={item} />
        {item.qty > 1 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[8px] font-black text-white shadow">
            {item.qty}
          </span>
        )}
      </span>
    ))}
    {order.items.length > size && (
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[10px] font-extrabold text-[var(--muted)]">
        +{order.items.length - size}
      </span>
    )}
  </>
);

export const OrdersPage = () => {
  const { t, i18n } = useTranslation();
  const { orders, addToCart, pushToast } = useShop();
  const loc = (item) => localizeOrderItem(item, i18n.language);
  const [tab, setTab] = useState("all");
  const [selected, setSelected] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    if (tab === "active") return orders.filter((o) => ["confirmed", "preparing", "delivering"].includes(o.status));
    if (tab === "delivered") return orders.filter((o) => o.status === "delivered");
    if (tab === "cancelled") return orders.filter((o) => o.status === "cancelled");
    return orders;
  }, [orders, tab]);

  const active = orders.find((o) => ["confirmed", "preparing", "delivering"].includes(o.status));
  const activeTracking = active ? getOrderTracking(active, now) : null;
  const activeCount = orders.filter((o) => ["confirmed", "preparing", "delivering"].includes(o.status)).length;
  const spent = orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.total, 0);

  const reorder = (order) => {
    order.items.forEach((item) => addToCart(item.productId, item.qty));
    pushToast(t("addedToCart"), "success");
  };

  const countFor = (key) => {
    if (key === "all") return orders.length;
    if (key === "active") return activeCount;
    return orders.filter((o) => o.status === key).length;
  };

  return (
    <div className="container-page py-5 sm:py-7">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-brand-800 via-brand-700 to-emerald-600 p-5 text-white shadow-glow sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-lime-300/20 blur-3xl" />
        <div className="pointer-events-none absolute right-6 top-6 hidden text-[6rem] font-black leading-none text-white/5 sm:block">
          #{orders.length > 0 ? String(orders.length).padStart(2, "0") : "00"}
        </div>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] backdrop-blur">
              <Package size={12} /> {t("orderHistory")}
            </span>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{t("myOrders")}</h1>
            <p className="mt-2 max-w-md text-xs font-semibold leading-relaxed text-white/80 sm:text-sm">{t("ordersSubtitle")}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/catalog" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-extrabold text-brand-700 shadow-sm transition hover:bg-white/90 active:scale-95">
                <Plus size={14} /> {t("emptyCartBtn")}
              </Link>
              {active && (
                <Link to={`/tracking/${active.id}`} className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2.5 text-xs font-extrabold text-white backdrop-blur transition hover:bg-white/25 active:scale-95">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-300" />
                  </span>
                  {t("trackOrder")}
                </Link>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {[
              { icon: Package, value: orders.length, label: t("orders") },
              { icon: Truck, value: activeCount, label: t("activeOrder") },
              {
                icon: Wallet,
                value: new Intl.NumberFormat("ru-RU", { notation: "compact", maximumFractionDigits: 1 }).format(spent),
                label: t("totalSpent")
              }
            ].map((stat) => (
              <div key={stat.label} className="min-w-[92px] rounded-2xl bg-white/10 p-3 backdrop-blur">
                <stat.icon size={15} className="text-lime-300" />
                <p className="mt-2 font-display text-xl font-extrabold leading-none tabular-nums">{stat.value}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live active order */}
      {active && activeTracking && (
        <section className="card mt-5 overflow-hidden">
          <div className="grid lg:grid-cols-[1.05fr_1fr]">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <span className="badge bg-brand-500/15 text-brand-700 dark:text-brand-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                  {t("activeOrder")}
                </span>
                <OrderStatusBadge status={active.status} />
              </div>

              <div className="mt-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--muted)]">{t("orderNumber")}</p>
                  <p className="font-display text-xl font-extrabold tracking-tight">#{active.id}</p>
                </div>
                <div className="rounded-xl bg-brand-500/10 px-3 py-2 text-right">
                  <p className="text-[9px] font-bold text-[var(--muted)]">{t("trackingEtaLabel")}</p>
                  <p className="font-display text-lg font-extrabold tabular-nums text-brand-600 dark:text-brand-400">
                    {formatCountdown(activeTracking.remainingMs)}
                  </p>
                </div>
              </div>

              <p className="mt-2 flex items-start gap-1.5 text-[11px] text-[var(--muted)]">
                <MapPin size={11} className="mt-0.5 shrink-0 text-brand-500" /> {active.address}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <OrderThumbs order={active} />
                <p className="hidden min-w-0 text-[10px] font-bold text-[var(--muted)] sm:block">
                  {active.items.map((item) => loc(item).name).slice(0, 2).join(", ")}
                  {active.items.length > 2 ? "…" : ""}
                </p>
              </div>

              <div className="mt-4 rounded-2xl bg-[var(--surface-2)] p-3">
                <OrderProgress status={active.status} />
              </div>

              <div className="mt-3 flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-lg">🛵</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold text-[var(--muted)]">{t("courier")}</p>
                  <p className="truncate text-[11px] font-extrabold">
                    {active.pickup ? active.shopName ?? t("pickupOrder") : active.courier ?? "Jasur Toshmatov"}
                  </p>
                </div>
                {!active.pickup && (
                  <span className="shrink-0 text-[10px] font-bold text-[var(--muted)]">⭐ {active.courierRating ?? 4.9}</span>
                )}
              </div>

              <Link to={`/tracking/${active.id}`} className="btn-primary mt-4 w-full btn-sm">
                <Truck size={14} /> {t("trackOrder")}
              </Link>
            </div>

            <div className="border-t p-3 lg:border-l lg:border-t-0 lg:p-4">
              <MapView
                courierName={active.pickup ? active.shopName ?? t("pickupOrder") : active.courier}
                eta={formatCountdown(activeTracking.remainingMs)}
                address={active.address}
              />
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-1.5 overflow-x-auto rounded-2xl border bg-[var(--surface)] p-1.5 no-scrollbar">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition",
              tab === item.key
                ? "bg-brand-600 text-white shadow-md shadow-brand-600/25"
                : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            )}
          >
            {t(item.label)}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[9px] tabular-nums",
                tab === item.key ? "bg-white/20 text-white" : "bg-[var(--surface-2)] text-[var(--muted)]"
              )}
            >
              {countFor(item.key)}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<Package size={28} />}
            title={t("emptyOrdersTitle")}
            description={t("emptyOrdersDesc")}
            action={<Link to="/catalog" className="btn-primary btn-sm">{t("emptyCartBtn")}</Link>}
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {filtered.map((order) => {
            const StatusIcon = statusIcons[order.status] ?? Package;
            return (
              <article
                key={order.id}
                className="card group flex flex-col overflow-hidden card-lift"
              >
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <StatusIcon size={19} />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-display text-sm font-extrabold tracking-tight">#{order.id}</p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-semibold text-[var(--muted)]">
                        <Clock3 size={10} /> {order.date}
                        <span className="text-[var(--border)]">•</span>
                        {order.items.length} {t("itemsCount")}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[8px] font-extrabold uppercase tracking-wider text-[var(--muted)]">{t("total")}</p>
                    <p className="font-display text-base font-extrabold text-brand-700 dark:text-brand-400">{formatUZS(order.total)}</p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-4 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <OrderThumbs order={order} size={5} />
                    <p className="min-w-0 flex-1 truncate text-[10px] font-bold text-[var(--muted)]">
                      {order.items.map((item) => loc(item).name).slice(0, 2).join(", ")}
                      {order.items.length > 2 ? "…" : ""}
                    </p>
                  </div>

                  <p className="mt-3 flex items-start gap-1.5 text-[10px] leading-relaxed text-[var(--muted)]">
                    <MapPin size={11} className="mt-0.5 shrink-0 text-brand-500" />
                    <span className="line-clamp-1">{order.address}</span>
                  </p>

                  {["confirmed", "preparing", "delivering"].includes(order.status) ? (
                    <div className="mt-auto pt-3">
                      <div className="rounded-xl bg-[var(--surface-2)] p-2.5">
                        <OrderProgress status={order.status} />
                      </div>
                    </div>
                  ) : (
                    <p className="mt-auto flex items-center gap-1 pt-3 text-[10px] font-bold text-[var(--muted)]">
                      <Clock3 size={10} />
                      {localizeSlot(order.slot)} · {order.payment}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t bg-[var(--surface-2)]/60 px-4 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-sm">🛵</span>
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-[var(--muted)]">{t("courier")}</p>
                      <p className="truncate text-[10px] font-extrabold">
                        {order.pickup ? order.shopName ?? t("pickupOrder") : order.courier ?? "Jasur Toshmatov"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button onClick={() => reorder(order)} className="btn-secondary btn-sm" title={t("orderAgain")}>
                      <RotateCcw size={12} />
                      <span className="hidden sm:inline">{t("orderAgain")}</span>
                    </button>
                    <Link to={`/tracking/${order.id}`} className="btn-secondary btn-sm" title={t("trackOrder")}>
                      <Truck size={12} />
                      <span className="hidden sm:inline">{t("tracking")}</span>
                    </Link>
                    <button onClick={() => setSelected(order)} className="btn-primary btn-sm">
                      {t("details")} <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? `#${selected.id}` : ""}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <OrderStatusBadge status={selected.status} />
              <span className="text-[10px] font-bold text-[var(--muted)]">{selected.date}</span>
            </div>
            <OrderProgress status={selected.status} />

            <div className="flex items-center gap-2.5 rounded-xl bg-[var(--surface-2)] p-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--surface)] text-lg">🛵</span>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-bold text-[var(--muted)]">{t("courier")}</p>
                <p className="truncate text-[11px] font-extrabold">
                  {selected.pickup ? selected.shopName ?? t("pickupOrder") : selected.courier ?? "Jasur Toshmatov"}
                </p>
              </div>
              {!selected.pickup && (
                <span className="shrink-0 text-[10px] font-bold text-[var(--muted)]">⭐ {selected.courierRating ?? 4.9}</span>
              )}
            </div>

            <div className="space-y-2">
              {selected.items.map((item, i) => (
                <div key={`${item.productId}-${i}`} className="flex items-center gap-2.5 rounded-xl bg-[var(--surface-2)] p-2.5">
                  <ProductThumb item={item} large />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-extrabold">{loc(item).name}</p>
                    <p className="text-[9px] text-[var(--muted)]">{item.qty} × {formatUZS(item.price)}</p>
                  </div>
                  <p className="text-[10px] font-extrabold">{formatUZS(item.price * item.qty)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 rounded-xl border p-3 text-[11px]">
              <div className="flex justify-between"><span className="text-[var(--muted)]">{t("subtotal")}</span><b>{formatUZS(selected.subtotal)}</b></div>
              {selected.discount > 0 && <div className="flex justify-between text-brand-600 dark:text-brand-400"><span>{t("discount")}</span><b>−{formatUZS(selected.discount)}</b></div>}
              <div className="flex justify-between"><span className="text-[var(--muted)]">{t("deliveryFee")}</span><b>{formatUZS(selected.delivery)}</b></div>
              <div className="flex justify-between border-t pt-1.5"><span className="font-extrabold">{t("total")}</span><b className="text-brand-700 dark:text-brand-400">{formatUZS(selected.total)}</b></div>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <p className="flex items-start gap-1.5"><MapPin size={12} className="mt-0.5 shrink-0 text-brand-500" /> <span className="text-[var(--muted)]">{selected.address}</span></p>
              <p className="flex items-center gap-1.5"><Clock3 size={12} className="text-brand-500" /> <span className="text-[var(--muted)]">{localizeSlot(selected.slot)} · {selected.payment}</span></p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => reorder(selected)} className="btn-secondary flex-1 btn-sm"><RotateCcw size={13} /> {t("orderAgain")}</button>
              <Link to={`/tracking/${selected.id}`} className="btn-primary flex-1 btn-sm"><Truck size={13} /> {t("trackOrder")}</Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
