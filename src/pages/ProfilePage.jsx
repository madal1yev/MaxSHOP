import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Check,
  ChevronRight,
  Clock,
  CreditCard,
  Globe2,
  LogOut,
  MapPin,
  Moon,
  Navigation,
  Package,
  Pencil,
  Phone,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Store,
  Sun,
  Trash2,
  Truck,
  User
} from "lucide-react";
import { formatUZS, getProduct, localizeAddress, shopLocations } from "../data/mock";
import { useShop } from "../lib/store";
import { EmptyState, Modal, OrderProgress, OrderStatusBadge, cn } from "../lib/ui";
const tabs = [
  { key: "personal", label: "personalInfo", icon: User },
  { key: "orders", label: "orderHistory", icon: Package },
  { key: "addresses", label: "addresses", icon: MapPin },
  { key: "settings", label: "accountSettings", icon: Settings }
];
export const ProfilePage = () => {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const { user, orders, addresses, favorites, logout, updateUser, addAddress, removeAddress, setDefaultAddress, pushToast } = useShop();
  const initialTab = params.get("tab") || "personal";
  const [tab, setTab] = useState(["personal", "orders", "addresses", "settings"].includes(initialTab) ? initialTab : "personal");
  const [orderFilter, setOrderFilter] = useState("all");
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [addressOpen, setAddressOpen] = useState(false);
  const [newLabel, setNewLabel] = useState(t("addressPlaceholder"));
  const [newAddress, setNewAddress] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [notifications, setNotifications] = useState({ orders: true, promos: false });
  useEffect(() => {
    setName(user?.name ?? "");
    setPhone(user?.phone ?? "");
    setEmail(user?.email ?? "");
  }, [user]);
  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    window.addEventListener("maxshop-theme", sync);
    return () => window.removeEventListener("maxshop-theme", sync);
  }, []);
  const switchTab = (key) => {
    setTab(key);
    setParams(key === "personal" ? {} : { tab: key }, { replace: true });
  };
  const toggleTheme = (value) => {
    const isDark = value === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = value;
    localStorage.setItem("maxshop-theme", value);
    window.dispatchEvent(new Event("maxshop-theme"));
  };
  const saveProfile = (e) => {
    e.preventDefault();
    if (!name.trim() || phone.replace(/\D/g, "").length < 9) {
      pushToast(t("namePhoneInvalid"), "error");
      return;
    }
    updateUser({ name, phone, email });
  };
  const saveAddress = () => {
    if (!newAddress.trim()) {
      pushToast(t("addressRequired"), "error");
      return;
    }
    addAddress({ label: newLabel || t("addressPlaceholder"), address: newAddress, details: newDetails, isDefault: addresses.length === 0 });
    setNewAddress("");
    setNewDetails("");
    setAddressOpen(false);
  };
  if (!user) {
    return <div className="container-page py-10 sm:py-16">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400"><User size={34} /></span>
          <h1 className="mt-4 font-display text-2xl font-extrabold">{t("authTitle")}</h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{t("authSubtitle")}</p>
          <div className="mt-5 flex flex-col gap-2">
            <Link to="/auth" className="btn-primary">{t("login")}</Link>
            <Link to="/auth?mode=register" className="btn-secondary">{t("register")}</Link>
          </div>
        </div>
      </div>;
  }
  const spent = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);
  const activeStatuses = ["confirmed", "preparing", "delivering"];
  const orderFilters = [
    { key: "all", label: t("all"), count: orders.length },
    { key: "active", label: t("activeOrder"), count: orders.filter((o) => activeStatuses.includes(o.status)).length },
    { key: "delivered", label: t("statusDelivered"), count: orders.filter((o) => o.status === "delivered").length },
    { key: "cancelled", label: t("statusCancelled"), count: orders.filter((o) => o.status === "cancelled").length }
  ];
  const visibleOrders = orders.filter((o) => orderFilter === "all" ? true : orderFilter === "active" ? activeStatuses.includes(o.status) : o.status === orderFilter);
  return <div className="container-page py-5 sm:py-7">
      <div className="card relative overflow-hidden p-4 sm:p-6">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-brand-700 to-primary-container" />
        <div className="relative flex flex-col gap-4 pt-10 sm:flex-row sm:items-end">
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border-4 border-[var(--surface)] bg-gradient-to-br from-amber-300 to-orange-400 font-display text-2xl font-extrabold text-white shadow-lg">
            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-extrabold sm:text-2xl">{user.name}</h1>
              <span className="badge bg-brand-500/15 text-brand-700 dark:text-brand-300"><ShieldCheck size={11} /> {t("memberTier")}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:w-auto">
            <div className="card-soft px-3 py-2 text-center">
              <p className="font-display text-base font-extrabold">{orders.length}</p>
              <p className="text-[9px] font-bold text-[var(--muted)]">{t("orders")}</p>
            </div>
            <div className="card-soft px-3 py-2 text-center">
              <p className="font-display text-base font-extrabold">{favorites.length}</p>
              <p className="text-[9px] font-bold text-[var(--muted)]">{t("favorites")}</p>
            </div>
            <div className="card-soft px-3 py-2 text-center">
              <p className="font-display text-base font-extrabold">{new Intl.NumberFormat("ru-RU", { notation: "compact" }).format(spent)}</p>
              <p className="text-[9px] font-bold text-[var(--muted)]">{t("totalSpent")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[230px_1fr]">
        <aside className="card h-fit p-2">
          {tabs.map((item) => <button key={item.key} onClick={() => switchTab(item.key)} className={cn("flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-extrabold transition", tab === item.key ? "bg-brand-500/10 text-brand-600 dark:text-brand-400" : "text-[var(--muted)] hover:bg-[var(--surface-2)]")}>
              <item.icon size={16} /> {t(item.label)} <ChevronRight size={13} className="ml-auto" />
            </button>)}
          <button onClick={() => {
    logout();
  }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-extrabold text-rose-500 transition hover:bg-rose-500/10">
            <LogOut size={16} /> {t("logOut")}
          </button>
        </aside>

        <div>
          {tab === "personal" && <div className="card p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-extrabold">{t("personalInfo")}</h2>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{t("profileSubtitle")}</p>
                </div>
                <Pencil size={17} className="text-[var(--muted)]" />
              </div>
              <form onSubmit={saveProfile} className="mt-4 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">{t("fullName")}</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
                </div>
                <div>
                  <label className="label">{t("phone")}</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">{t("email")}</label>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="aziz@mail.uz" type="email" />
                </div>
                <div className="sm:col-span-2">
                  <button type="submit" className="btn-primary btn-sm"><Save size={14} /> {t("saveChanges")}</button>
                </div>
              </form>

              <div className="mt-5">
                <div className="card-soft p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">{t("memberSince")}</p>
                  <p className="mt-1 font-display text-lg font-extrabold">12.01.2025</p>
                  <p className="mt-0.5 text-[10px] text-[var(--muted)]">{t("memberTier")} · ⭐ 4.9</p>
                </div>
              </div>
            </div>}

          {tab === "orders" && <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-extrabold">{t("orderHistory")}</h2>
                  <p className="mt-0.5 text-[11px] text-[var(--muted)]">{t("ordersHistorySubtitle")}</p>
                </div>
                <Link to="/orders" className="inline-flex items-center gap-1 rounded-xl bg-brand-500/10 px-3 py-2 text-[11px] font-extrabold text-brand-600 transition hover:bg-brand-500/15 dark:text-brand-400">
                  {t("seeAll")} <ChevronRight size={13} />
                </Link>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {orderFilters.map((f) => <button
                    key={f.key}
                    className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-extrabold transition", orderFilter === f.key ? "bg-brand-600 text-white shadow-sm" : "bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)]")}
                    onClick={() => setOrderFilter(f.key)}
                  >
                    {f.label}
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[9px]", orderFilter === f.key ? "bg-white/25" : "bg-[var(--surface-3)]")}>{f.count}</span>
                  </button>)}
              </div>

              {orders.length === 0 ? <EmptyState icon={<Package size={26} />} title={t("emptyOrdersTitle")} description={t("emptyOrdersDesc")} action={<Link to="/catalog" className="btn-primary btn-sm">{t("emptyCartBtn")}</Link>} /> : visibleOrders.length === 0 ? <div className="card flex flex-col items-center gap-2 p-8 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--muted)]"><Package size={22} /></span>
                  <p className="text-xs font-extrabold">{t("emptyOrders")}</p>
                  <p className="text-[10px] text-[var(--muted)]">{t("ordersFilterEmpty")}</p>
                </div> : <div className="grid gap-3 sm:grid-cols-2">
                  {visibleOrders.map((o) => {
                    const isActive = activeStatuses.includes(o.status);
                    const isCancelled = o.status === "cancelled";
                    return <div key={o.id} className="card group flex flex-col overflow-hidden transition hover:shadow-soft">
                        <div className="flex items-start justify-between gap-2 border-b bg-[var(--surface-2)]/50 px-4 py-3">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", isCancelled ? "bg-rose-500/10 text-rose-500" : o.status === "delivered" ? "bg-brand-500/10 text-brand-600 dark:text-brand-400" : "bg-amber-400/15 text-amber-600")}>
                              {o.status === "delivered" ? <Check size={16} strokeWidth={3} /> : isCancelled ? <Trash2 size={15} /> : <Truck size={16} />}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate font-display text-xs font-extrabold">#{o.id}</p>
                              <p className="truncate text-[10px] text-[var(--muted)]">{o.date}</p>
                            </div>
                          </div>
                          <OrderStatusBadge status={o.status} />
                        </div>

                        <div className="flex-1 px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-1.5">
                              {o.items.slice(0, 4).map((item, i) => {
                                const product = getProduct(item.productId);
                                return <Link
                                    key={`${item.productId}-${i}`}
                                    aria-label={item.name}
                                    className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-[var(--border)] bg-white p-1 transition hover:border-brand-500 hover:shadow-sm"
                                    title={item.name}
                                    to={`/product/${item.productId}`}
                                  >
                                    {product?.img ? <img alt={item.name} className="h-full w-full object-contain" loading="lazy" src={product.img} /> : <span className="text-lg">{item.emoji}</span>}
                                    {item.qty > 1 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[8px] font-black text-white">{item.qty}</span>}
                                  </Link>;
                              })}
                              {o.items.length > 4 && <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--surface-2)] text-[10px] font-extrabold text-[var(--muted)]">+{o.items.length - 4}</span>}
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[9px] font-bold uppercase tracking-wide text-[var(--muted)]">{o.items.length} {t("productsCount")}</p>
                              <p className="font-display text-sm font-extrabold text-brand-700 dark:text-brand-400">{formatUZS(o.total)}</p>
                            </div>
                          </div>
                          {isActive && <div className="mt-3"><OrderProgress status={o.status} /></div>}
                        </div>

                        <div className="flex items-center justify-between gap-2 border-t px-4 py-2.5">
                          <p className="flex min-w-0 items-center gap-1.5 text-[10px] font-bold text-[var(--muted)]">
                            {o.pickup ? <Store size={13} /> : <Truck size={13} />}
                            <span className="truncate">{o.pickup ? o.shopName ?? t("pickupOrder") : o.courier ?? "Jasur Toshmatov"}</span>
                          </p>
                          <Link to={`/tracking/${o.id}`} className="btn-secondary btn-sm shrink-0">
                            {t("trackOrder")} <ChevronRight size={12} />
                          </Link>
                        </div>
                      </div>;
                  })}
                </div>}
            </div>}

          {tab === "addresses" && <div className="space-y-3">
              <div className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg font-extrabold">{t("addressesTitle")}</h2>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{t("addressesSubtitle")}</p>
                  </div>
                  <button onClick={() => setAddressOpen(true)} className="btn-primary btn-sm"><Plus size={14} /> {t("addAddress")}</button>
                </div>

                {addresses.length === 0 ? <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed p-8 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--muted)]"><MapPin size={22} /></span>
                    <p className="text-xs font-extrabold">{t("noAddresses")}</p>
                    <button onClick={() => setAddressOpen(true)} className="btn-primary btn-sm mt-1">{t("addAddress")}</button>
                  </div> : <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {addresses.map((a) => <div
                        key={a.id}
                        className={cn("flex flex-col gap-3 rounded-2xl border p-3.5 transition", a.isDefault ? "border-brand-500 bg-brand-500/5 shadow-soft" : "hover:border-brand-400/60")}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400"><MapPin size={18} /></span>
                          {a.isDefault ? <span className="badge bg-brand-500/15 text-brand-700 dark:text-brand-300"><Check size={10} /> {t("defaultAddress")}</span> : <button onClick={() => setDefaultAddress(a.id)} className="icon-btn h-7 w-7" title={t("setDefault")}><Check size={13} /></button>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-extrabold">{localizeAddress(a).label}</p>
                          <p className="mt-1 text-[11px] font-semibold leading-snug text-[var(--text)]">{localizeAddress(a).address}</p>
                          {a.details && <p className="mt-0.5 text-[10px] text-[var(--muted)]">{localizeAddress(a).details}</p>}
                        </div>
                        <div className="mt-auto flex items-center justify-between border-t pt-2.5">
                          <Link to="/cart" className="inline-flex items-center gap-1 text-[10px] font-extrabold text-brand-600 dark:text-brand-400">
                            <Navigation size={12} /> {t("deliveryToAddress")}
                          </Link>
                          <button onClick={() => removeAddress(a.id)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--muted)] transition hover:bg-rose-500/10 hover:text-rose-500" title={t("remove")}><Trash2 size={13} /></button>
                        </div>
                      </div>)}
                  </div>}
              </div>

              <div className="card p-4 sm:p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400"><Store size={20} /></span>
                  <div>
                    <h2 className="font-display text-lg font-extrabold">{t("shopsTitle")}</h2>
                    <p className="mt-0.5 text-xs text-[var(--muted)]">{t("shopsSubtitle")}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {shopLocations.map((shop) => <div key={shop.id} className="flex flex-col gap-2 rounded-xl bg-[var(--surface-2)] p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 text-xs font-extrabold">{shop.name}
                          <span className="rounded-full bg-brand-500/15 px-2 py-0.5 text-[9px] font-extrabold text-brand-700 dark:text-brand-300">{t("pickup")} · {t("free")}</span>
                        </p>
                        <p className="mt-0.5 text-[11px] text-[var(--muted)]">{shop.address}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3 text-[10px] font-bold text-[var(--muted)]">
                        <span className="inline-flex items-center gap-1"><Clock size={12} /> {shop.hours}</span>
                        <a className="inline-flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400" href={`tel:${shop.phone.replace(/[^\d+]/g, "")}`}><Phone size={12} /> {shop.phone}</a>
                      </div>
                    </div>)}
                </div>
                <Link to="/cart" className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-brand-600 dark:text-brand-400">
                  {t("pickupTitle")} <ChevronRight size={13} />
                </Link>
              </div>
            </div>}

          {tab === "settings" && <div className="space-y-3">
              <div className="card p-4 sm:p-5">
                <h2 className="font-display text-lg font-extrabold">{t("accountSettings")}</h2>
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="label flex items-center gap-1"><Sun size={12} /> {t("theme")}</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => toggleTheme("light")} className={cn("flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-extrabold transition", !dark ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400" : "text-[var(--muted)]")}><Sun size={15} /> {t("light")}</button>
                      <button onClick={() => toggleTheme("dark")} className={cn("flex items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-extrabold transition", dark ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400" : "text-[var(--muted)]")}><Moon size={15} /> {t("dark")}</button>
                    </div>
                  </div>
                  <div>
                    <label className="label flex items-center gap-1"><Globe2 size={12} /> {t("language")}</label>
                    <select className="select" value={i18n.language} onChange={(e) => i18n.changeLanguage(e.target.value)}>
                      <option value="uz">O'zbekcha</option>
                      <option value="ru">Русский</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    {[
    { key: "orders", label: t("orderStatus"), desc: t("notificationOrders") },
    { key: "promos", label: t("promotions"), desc: t("notificationPromos") }
  ].map((n) => <div key={n.key} className="flex items-center justify-between rounded-xl border p-3">
                        <div>
                          <p className="text-xs font-extrabold">{n.label}</p>
                          <p className="text-[10px] text-[var(--muted)]">{n.desc}</p>
                        </div>
                        <button onClick={() => setNotifications((v) => ({ ...v, [n.key]: !v[n.key] }))} className={cn("flex h-5 w-9 items-center rounded-full p-0.5 transition", notifications[n.key] ? "bg-brand-500" : "bg-[var(--surface-3)]")}>
                          <span className={cn("h-4 w-4 rounded-full bg-white shadow transition", notifications[n.key] && "ml-auto")} />
                        </button>
                      </div>)}
                  </div>
                </div>
              </div>

              <div className="card p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold">{t("changePassword")}</h3>
                    <p className="mt-0.5 text-[10px] text-[var(--muted)]">{t("otpNote")}</p>
                  </div>
                  <button onClick={() => pushToast(t("passwordChangeDemo"), "info")} className="btn-secondary btn-sm"><CreditCard size={13} /> {t("edit")}</button>
                </div>
              </div>

              <div className="card p-4 sm:p-5">
                <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500/10 py-2.5 text-xs font-extrabold text-rose-500 transition hover:bg-rose-500/15"><LogOut size={15} /> {t("logOut")}</button>
              </div>
            </div>}
        </div>
      </div>

      <Modal open={addressOpen} onClose={() => setAddressOpen(false)} title={t("addNewAddress")} size="sm">
        <div className="space-y-3">
          <div>
            <label className="label">{t("addressLabel")}</label>
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="input" placeholder={t("addressPlaceholder")} />
          </div>
          <div>
            <label className="label">{t("address")}</label>
            <input value={newAddress} onChange={(e) => setNewAddress(e.target.value)} className="input" placeholder={t("headerCityFull")} />
          </div>
          <div>
            <label className="label">{t("addressDetails")}</label>
            <input value={newDetails} onChange={(e) => setNewDetails(e.target.value)} className="input" placeholder={t("addressDetailsPlaceholder")} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAddressOpen(false)} className="btn-secondary flex-1">{t("cancel")}</button>
            <button onClick={saveAddress} className="btn-primary flex-1">{t("saveAddress")}</button>
          </div>
        </div>
      </Modal>
    </div>;
};
