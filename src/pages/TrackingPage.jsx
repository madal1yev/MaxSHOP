import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Ban,
  Check,
  Clock3,
  Copy,
  Headphones,
  MapPin,
  MessageCircle,
  Package,
  PackageCheck,
  Phone,
  RotateCcw,
  Star,
  Timer,
  Truck,
  Wallet,
  X
} from "lucide-react";
import { formatUZS, getProduct, localizeSlot } from "../data/mock";
import { localizeOrderItem } from "../data/productI18n";
import { useShop } from "../lib/store";
import { EmptyState, Modal, OrderStatusBadge, Stars, cn } from "../lib/ui";
import { BackButton } from "../components/BackButton";
import { formatCountdown, getOrderTracking } from "../lib/tracking";

const statusLabelKeys = {
  confirmed: "statusConfirmed",
  preparing: "statusPreparing",
  delivering: "statusDelivering",
  delivered: "statusDelivered",
  cancelled: "statusCancelled"
};

const statusDescKeys = {
  confirmed: "trackingConfirmedDesc",
  preparing: "trackingPreparingDesc",
  delivering: "trackingDeliveringDesc",
  delivered: "trackingDeliveredDesc",
  cancelled: "trackingCancelledDesc"
};

const ROUTE_PATH = "M100 230 C230 230 330 150 510 100";
const STORE_POINT = { x: 16.7, y: 71.9 };

// Point on the courier route (matches the SVG cubic curve above).
const cubicPoint = (t) => {
  const p0 = [100, 230];
  const p1 = [230, 230];
  const p2 = [330, 150];
  const p3 = [510, 100];
  const mt = 1 - t;
  const x =
    mt ** 3 * p0[0] +
    3 * mt * mt * t * p1[0] +
    3 * mt * t * t * p2[0] +
    t ** 3 * p3[0];
  const y =
    mt ** 3 * p0[1] +
    3 * mt * mt * t * p1[1] +
    3 * mt * t * t * p2[1] +
    t ** 3 * p3[1];
  return { x: (x / 600) * 100, y: (y / 320) * 100 };
};

const TrackingMap = ({ order, tracking, countdown }) => {
  const { t } = useTranslation();
  const delivered = tracking.status === "delivered";
  const cancelled = tracking.status === "cancelled";
  const moving = tracking.status === "delivering";
  const courierPoint =
    moving || delivered
      ? cubicPoint(tracking.riderProgress)
      : { x: STORE_POINT.x + 6, y: STORE_POINT.y - 11 };

  return (
    <div className="map-grid relative h-[340px] overflow-hidden rounded-2xl border bg-[#eaf3ec] dark:bg-[#0d2018] sm:h-[380px]">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 320"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <rect x="28" y="18" width="160" height="86" rx="18" fill="#c7e6d0" opacity=".65" />
        <rect x="320" y="212" width="140" height="92" rx="18" fill="#c7e6d0" opacity=".55" />
        <rect x="500" y="18" width="80" height="70" rx="14" fill="#d7ebdc" opacity=".7" />

        <path d="M0 120 H600" stroke="#ffffff" strokeWidth="20" opacity=".85" />
        <path d="M0 250 H600" stroke="#ffffff" strokeWidth="22" opacity=".85" />
        <path d="M145 0 V320" stroke="#ffffff" strokeWidth="16" opacity=".8" />
        <path d="M470 0 V320" stroke="#ffffff" strokeWidth="14" opacity=".75" />
        <path d="M290 0 V320" stroke="#dcebdf" strokeWidth="5" />
        <path d="M0 178 H600" stroke="#dcebdf" strokeWidth="5" />

        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="#006b2c"
          strokeOpacity=".16"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d={ROUTE_PATH}
          fill="none"
          stroke="#00873a"
          strokeWidth="4.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={1 - tracking.riderProgress}
          style={{ transition: "stroke-dashoffset 900ms linear" }}
        />
      </svg>

      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-xl border bg-surface-container-lowest/90 px-2.5 py-1.5 text-[10px] font-extrabold shadow-sm backdrop-blur">
        {delivered || cancelled ? (
          <>
            {delivered ? <Check size={11} className="text-brand-600" /> : <Ban size={11} className="text-rose-500" />}
            {t(statusLabelKeys[tracking.status])}
          </>
        ) : (
          <>
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-500" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
            </span>
            {t("liveTracking")}
          </>
        )}
      </div>

      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-xl border bg-surface-container-lowest/90 px-2.5 py-1.5 text-[10px] font-extrabold shadow-sm backdrop-blur">
        <Truck size={11} className="text-brand-600 dark:text-brand-400" />
        {t("trackingMapTitle")}
      </div>

      {/* Store */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${STORE_POINT.x}%`, top: `${STORE_POINT.y}%` }}
      >
        <div className="flex flex-col items-center">
          <span className="mb-1 rounded-lg bg-[var(--surface)] px-2 py-1 text-[9px] font-extrabold shadow">
            MaxSHOP
          </span>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-brand-600 text-sm shadow-lg">
            🏪
          </span>
        </div>
      </div>

      {/* Destination */}
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: "85%", top: "31.25%" }}
      >
        <div className="flex flex-col items-center">
          <span className="mb-1 max-w-[128px] truncate rounded-lg bg-[var(--surface)] px-2 py-1 text-[9px] font-extrabold shadow">
            📍 {order.address}
          </span>
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border-4 border-white text-sm text-white shadow-lg",
              delivered ? "bg-brand-600" : "bg-rose-500"
            )}
          >
            {delivered ? <Check size={15} strokeWidth={3} /> : "🏠"}
          </span>
        </div>
      </div>

      {/* Courier */}
      {!delivered && !order.pickup && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-[left,top] duration-1000 ease-linear"
          style={{ left: `${courierPoint.x}%`, top: `${courierPoint.y}%` }}
        >
          <div className="flex flex-col items-center">
            <span className="mb-1 whitespace-nowrap rounded-lg bg-brand-600 px-2 py-1 text-[9px] font-extrabold text-white shadow-lg">
              {order.courier?.split(" ")[0] ?? "Jasur"}
              {moving ? ` · ${countdown}` : ""}
            </span>
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-amber-400 text-base shadow-xl">
              {moving && (
                <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/70" />
              )}
              <span className="relative">🛵</span>
            </span>
          </div>
        </div>
      )}

      <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl border bg-surface-container-lowest/95 p-2.5 shadow-lg backdrop-blur sm:inset-x-4 sm:p-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-lg">
          {order.pickup ? "🏬" : "🛵"}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[11px] font-extrabold">
              {order.pickup ? order.shopName ?? t("pickupOrder") : order.courier ?? "Jasur Toshmatov"}
            </p>
            <p className="shrink-0 text-[10px] font-extrabold text-brand-600 dark:text-brand-400">
              {cancelled
                ? t("statusCancelled")
                : delivered
                  ? t("statusDelivered")
                  : `${order.pickup ? t("readyIn") : t("estimatedArrival")} · ${countdown}`}
            </p>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-700",
                cancelled
                  ? "bg-rose-400"
                  : "bg-gradient-to-r from-brand-500 to-lime-400"
              )}
              style={{ width: `${Math.max(3, Math.round(tracking.progress * 100))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const TrackingPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const { orders, addToCart, pushToast, syncOrders, cancelOrder, rateCourier } = useShop();
  const [now, setNow] = useState(() => Date.now());
  const [cancelOpen, setCancelOpen] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [pendingRating, setPendingRating] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    syncOrders();
  }, [syncOrders]);

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={<Package size={28} />}
          title={t("emptyOrdersTitle")}
          description={t("emptyOrdersDesc")}
          action={
            <Link to="/orders" className="btn-primary btn-sm">
              {t("myOrders")}
            </Link>
          }
        />
      </div>
    );
  }

  const tracking = getOrderTracking(order, now);
  const delivered = tracking.status === "delivered";
  const cancelled = tracking.status === "cancelled";
  const active = !delivered && !cancelled;
  const canCancel = ["confirmed", "preparing"].includes(tracking.status);
  const countdown = formatCountdown(tracking.remainingMs);
  const statusLabel = t(statusLabelKeys[tracking.status]);
  const statusDesc = t(statusDescKeys[tracking.status]);
  const finishedAt = cancelled ? tracking.cancelledAt : tracking.deliveredAt;
  const finishedClock =
    finishedAt && (delivered || cancelled)
      ? new Date(finishedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        })
      : "";
  const timeOf = (ms) =>
    new Date(ms).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });

  const heroTone = cancelled
    ? "from-rose-600 via-rose-500 to-orange-400"
    : delivered
      ? "from-emerald-700 via-emerald-600 to-lime-500"
      : "from-brand-700 via-brand-600 to-emerald-500";

  const heroDesc = cancelled
    ? t("trackingCancelledHeroDesc")
    : delivered
      ? t("trackingDeliveredHeroDesc")
      : statusDesc;

  const loc = (item) => localizeOrderItem(item, i18n.language);
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address)}`;

  const reorder = () => {
    order.items.forEach((item) => addToCart(item.productId, item.qty));
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(order.id);
      pushToast(t("trackingCopied"), "success");
    } catch {
      pushToast(t("trackingCopyFailed"), "error");
    }
  };

  const submitRating = () => {
    if (!pendingRating) {
      pushToast(t("trackingRateSelect"), "error");
      return;
    }
    rateCourier(order.id, pendingRating);
  };

  const confirmCancel = () => {
    cancelOrder(order.id);
    setCancelOpen(false);
  };

  return (
    <div className="container-page py-5 sm:py-7">
      <div className="mb-4">
        <BackButton to="/orders" />
      </div>

      {/* Hero */}
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-glow sm:p-7",
          heroTone
        )}
      >
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 h-56 w-56 rounded-full bg-lime-300/25 blur-2xl" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] backdrop-blur">
              {active ? (
                <>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-lime-300" />
                  </span>
                  {statusLabel}
                </>
              ) : (
                <>
                  {delivered ? <PackageCheck size={12} /> : <Ban size={12} />}
                  {statusLabel}
                </>
              )}
            </span>

            <h1 className="mt-3 font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-[30px]">
              {cancelled
                ? t("statusCancelled")
                : delivered
                  ? t("statusDelivered")
                  : t("trackingTitle")}
            </h1>
            <p className="mt-1.5 max-w-md text-xs font-semibold leading-relaxed text-white/85 sm:text-[13px]">
              {heroDesc}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-bold text-white/85">
              <span className="rounded-lg bg-black/15 px-2 py-1">#{order.id}</span>
              <button
                type="button"
                onClick={copyId}
                className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 transition hover:bg-white/20"
              >
                <Copy size={11} /> {t("trackingCopyId")}
              </button>
              <span className="inline-flex items-center gap-1">
                <Clock3 size={11} /> {order.date}
              </span>
            </div>
          </div>

          <div className="shrink-0 sm:text-right">
            {active ? (
              <>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/70">
                  {t("trackingEtaLabel")}
                </p>
                <p className="font-display text-4xl font-extrabold tabular-nums sm:text-5xl">
                  {countdown}
                </p>
                <p className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-white/75">
                  <Timer size={11} /> {localizeSlot(order.slot)}
                </p>
              </>
            ) : (
              <div className="inline-flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-left backdrop-blur">
                {delivered ? <PackageCheck size={26} /> : <Ban size={26} />}
                <div>
                  <p className="font-display text-lg font-extrabold">{statusLabel}</p>
                  <p className="text-[10px] font-bold text-white/75">
                    {cancelled ? t("statusCancelled") : t("trackingDeliveredAt")}
                    {finishedClock ? ` · ${finishedClock}` : ""}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-5">
          <div className="flex items-center justify-between text-[10px] font-extrabold text-white/75">
            <span>{t("orderProgress")}</span>
            <span>{Math.round(tracking.progress * 100)}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/20">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-700",
                cancelled ? "bg-rose-200" : "bg-gradient-to-r from-lime-300 to-white"
              )}
              style={{ width: `${Math.max(2, Math.round(tracking.progress * 100))}%` }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reorder}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-extrabold text-brand-700 shadow-sm transition hover:bg-white/90 active:scale-95"
            >
              <RotateCcw size={13} /> {t("orderAgain")}
            </button>
            <a
              href="tel:+998712000000"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-extrabold text-white backdrop-blur transition hover:bg-white/25 active:scale-95"
            >
              <Headphones size={13} /> {t("contactSupport")}
            </a>
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2 text-xs font-extrabold text-white backdrop-blur transition hover:bg-white/25 active:scale-95"
            >
              {t("myOrders")}
            </Link>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <div className="space-y-5">
          <div className="card p-2 sm:p-3">
            <TrackingMap order={order} tracking={tracking} countdown={countdown} />
            <div className="flex items-start gap-2 px-2 py-2 text-[9px] leading-relaxed text-[var(--muted)]">
              <MapPin size={11} className="mt-0.5 shrink-0 text-brand-500" />
              <span>{t("mapNote")}</span>
            </div>
          </div>

          {/* Timeline */}
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-extrabold">{t("trackingTimeline")}</h2>
              <OrderStatusBadge status={tracking.status} />
            </div>

            <ol className="mt-4">
              {tracking.steps.map((step, i) => {
                const reached = tracking.index >= i;
                const complete =
                  tracking.index > i ||
                  (delivered && i === tracking.steps.length - 1) ||
                  (cancelled && tracking.index >= i);
                const current = active && tracking.index === i;
                return (
                  <li key={step.status} className="relative flex gap-3 pb-5 last:pb-0">
                    {i < tracking.steps.length - 1 && (
                      <span
                        className={cn(
                          "absolute left-[15px] top-8 h-[calc(100%-1.25rem)] w-0.5 rounded-full",
                          tracking.index > i ? "bg-brand-500" : "bg-[var(--surface-3)]"
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black transition",
                        complete
                          ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                          : current
                            ? "border-2 border-brand-500 bg-[var(--surface)] text-brand-600 dark:text-brand-400"
                            : "bg-[var(--surface-2)] text-[var(--muted)]"
                      )}
                    >
                      {complete ? (
                        <Check size={14} strokeWidth={3} />
                      ) : current ? (
                        <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
                      ) : (
                        i + 1
                      )}
                    </span>

                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <p
                          className={cn(
                            "text-xs font-extrabold",
                            reached ? "text-[var(--text)]" : "text-[var(--muted)]"
                          )}
                        >
                          {t(statusLabelKeys[step.status])}
                        </p>
                        <span className="shrink-0 text-[10px] font-bold tabular-nums text-[var(--muted)]">
                          {reached ? timeOf(step.at) : "—"}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--muted)]">
                        {t(statusDescKeys[step.status])}
                      </p>
                      {current && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-0.5 text-[9px] font-extrabold text-brand-600 dark:text-brand-400">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                          {t("trackingNow")}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}

              {cancelled && (
                <li className="relative flex gap-3">
                  <span className="relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-lg shadow-rose-500/25">
                    <X size={14} strokeWidth={3} />
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                        {t("statusCancelled")}
                      </p>
                      <span className="shrink-0 text-[10px] font-bold tabular-nums text-[var(--muted)]">
                        {tracking.cancelledAt ? timeOf(tracking.cancelledAt) : ""}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--muted)]">
                      {t("trackingCancelledDesc")}
                    </p>
                  </div>
                </li>
              )}
            </ol>
          </div>

          {/* Order summary */}
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-extrabold">{t("yourOrder")}</h2>
              <span className="badge bg-[var(--surface-2)] text-[var(--muted)]">
                {order.items.length} {t("itemsCount")}
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {order.items.map((item, i) => {
                const product = getProduct(item.productId);
                return (
                <div
                  key={`${item.productId}-${i}`}
                  className="flex items-center gap-2.5 rounded-xl bg-[var(--surface-2)] p-2"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-1">
                    {product?.img ? (
                      <img alt={item.name} className="h-full w-full object-contain" loading="lazy" src={product.img} />
                    ) : (
                      <span className="text-base">{item.emoji}</span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-extrabold">{loc(item).name}</p>
                    <p className="text-[9px] text-[var(--muted)]">
                      {item.qty} × {formatUZS(item.price)}
                    </p>
                  </div>
                  <p className="shrink-0 text-[10px] font-extrabold">
                    {formatUZS(item.price * item.qty)}
                  </p>
                </div>
                );
              })}
            </div>

            <div className="mt-3 space-y-1.5 border-t pt-3 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">{t("subtotal")}</span>
                <b>{formatUZS(order.subtotal)}</b>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-brand-600 dark:text-brand-400">
                  <span>{t("discount")}</span>
                  <b>−{formatUZS(order.discount)}</b>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--muted)]">{t("deliveryFee")}</span>
                <b>{order.delivery > 0 ? formatUZS(order.delivery) : t("free")}</b>
              </div>
              <div className="flex items-center justify-between pt-1.5">
                <span className="text-xs font-extrabold">{t("total")}</span>
                <span className="font-display text-lg font-extrabold text-brand-700 dark:text-brand-400">
                  {formatUZS(order.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Courier / pickup */}
          {order.pickup ? (
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-extrabold">{t("pickupTitle")}</h2>
              {active && (
                <span className="badge bg-brand-500/15 text-brand-700 dark:text-brand-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                  {t(statusLabelKeys[tracking.status])}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-2xl">
                🏬
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold">{order.shopName ?? t("pickupOrder")}</p>
                <p className="mt-0.5 text-[10px] font-bold leading-snug text-[var(--muted)]">{order.address}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-xl bg-brand-500/10 px-3 py-2">
              <span className="text-[10px] font-extrabold text-brand-700 dark:text-brand-300">{t("pickupTime")}</span>
              <span className="text-[11px] font-extrabold text-brand-700 dark:text-brand-300">{localizeSlot(order.slot)}</span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-[var(--muted)]">{t("pickupSubtitle")}</p>
          </div>
          ) : (
          <div className="card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-base font-extrabold">{t("courier")}</h2>
              {active && (
                <span className="badge bg-brand-500/15 text-brand-700 dark:text-brand-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
                  {tracking.status === "delivering" ? t("courierOnWay") : t(statusLabelKeys[tracking.status])}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300/40 to-amber-500/20 text-2xl">
                🛵
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold">{order.courier ?? "Jasur Toshmatov"}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <Stars rating={order.courierRating ?? 4.9} size={10} />
                  <span className="text-[10px] font-extrabold text-[var(--muted)]">
                    {order.courierRating ?? 4.9}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold text-[var(--muted)]">{t("estimatedArrival")}</p>
                <p className="font-display text-sm font-extrabold text-brand-600 dark:text-brand-400">
                  {cancelled ? "—" : delivered ? "✓" : countdown}
                </p>
              </div>
            </div>

            <a
              href={`tel:${(order.courierPhone ?? "+998901234567").replace(/[^\d+]/g, "")}`}
              className="btn-primary btn-sm mt-3 w-full"
            >
              <Phone size={13} /> {t("callCourier")}
            </a>

            {delivered && (
              <div className="mt-4 rounded-2xl border border-dashed p-3">
                {order.rating ? (
                  <div className="flex items-center gap-2">
                    <Stars rating={order.rating} size={14} />
                    <p className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400">
                      {t("trackingRateThanks")}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-extrabold">{t("trackingRateTitle")}</p>
                    <p className="mt-1 text-[10px] leading-relaxed text-[var(--muted)]">
                      {t("trackingRateDesc")}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const filled = star <= (hoveredStar || pendingRating);
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(0)}
                            onClick={() => setPendingRating(star)}
                            className="transition hover:scale-110"
                            aria-label={`${star}`}
                          >
                            <Star
                              size={20}
                              className={cn(
                                "transition",
                                filled
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-[var(--surface-3)]"
                              )}
                            />
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={submitRating}
                        disabled={!pendingRating}
                        className="btn-primary btn-sm ml-auto"
                      >
                        {t("trackingRateSubmit")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          )}

          {/* Delivery details */}
          <div className="card p-4 sm:p-5">
            <h2 className="font-display text-base font-extrabold">{t("deliveryDetails")}</h2>
            <div className="mt-3 space-y-3 text-[11px]">
              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <MapPin size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-extrabold uppercase tracking-wide text-[var(--muted)]">
                    {t("deliveryAddress")}
                  </p>
                  <p className="mt-0.5 font-bold leading-snug">{order.address}</p>
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-block text-[10px] font-extrabold text-brand-600 hover:underline dark:text-brand-400"
                  >
                    {t("trackingOpenMaps")} →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Clock3 size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-extrabold uppercase tracking-wide text-[var(--muted)]">
                    {t("deliverySlot")}
                  </p>
                  <p className="mt-0.5 font-bold leading-snug">{localizeSlot(order.slot)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                  <Wallet size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-extrabold uppercase tracking-wide text-[var(--muted)]">
                    {t("paymentMethod")}
                  </p>
                  <p className="mt-0.5 font-bold leading-snug">{order.payment}</p>
                </div>
              </div>

              {order.note ? (
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400">
                    <MessageCircle size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-extrabold uppercase tracking-wide text-[var(--muted)]">
                      {t("orderNote")}
                    </p>
                    <p className="mt-0.5 font-bold leading-snug">{order.note}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Support + cancel */}
          <div className="card p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                <Headphones size={20} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold">{t("contactSupport")}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--muted)]">
                  {t("trackingSupportHours")}
                </p>
                <a
                  href="tel:+998712000000"
                  className="mt-1 inline-block text-xs font-extrabold text-brand-600 dark:text-brand-400"
                >
                  +998 71 200 00 00
                </a>
              </div>
            </div>

            {canCancel && (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="btn btn-sm mt-3 w-full border border-rose-500/40 text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
              >
                <Ban size={13} /> {t("trackingCancel")}
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title={t("trackingCancelTitle")}
        size="sm"
      >
        <p className="text-xs leading-relaxed text-[var(--muted)]">{t("trackingCancelDesc")}</p>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => setCancelOpen(false)}
            className="btn-secondary btn-sm flex-1"
          >
            {t("trackingKeep")}
          </button>
          <button
            type="button"
            onClick={confirmCancel}
            className="btn btn-sm flex-1 bg-rose-500 text-white hover:bg-rose-600"
          >
            <Ban size={13} /> {t("trackingCancelConfirm")}
          </button>
        </div>
      </Modal>
    </div>
  );
};
