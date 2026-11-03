import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Globe2,
  Heart,
  LayoutGrid,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  Sun,
  User,
  X
} from "lucide-react";
import { categories, localizeAddress, localizeCategories } from "../data/mock";
import { cartCount, cartDetails, useShop } from "../lib/store";
import { Logo, Modal, cn } from "../lib/ui";
const navItems = [
  { to: "/", label: "home" },
  { to: "/catalog", label: "catalog" },
  { to: "/promotions", label: "promotions" },
  { to: "/orders", label: "orders" }
];
export const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, favorites, addresses, user, logout, setDefaultAddress, pushToast } = useShop();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const profileRef = useRef(null);
  const count = cartCount(cart);
  const { subtotal } = cartDetails(cart);
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const localizedCategories = localizeCategories(categories);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQuery(params.get("q") ?? "");
  }, [location.search]);
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const onClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("maxshop-theme", next ? "dark" : "light");
  };
  const changeLang = (lang) => {
    i18n.changeLanguage(lang);
    pushToast(t("languageChanged"), "info");
  };
  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/catalog?q=${encodeURIComponent(q)}` : "/catalog");
  };
  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };
  return <header className="sticky top-0 z-50">
      <div className="hidden bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 text-white sm:block">
        <div className="container-page flex h-8 items-center justify-between text-[11px] font-bold">
          <span className="flex items-center gap-1.5">{t("openingHours")}</span>
          <a href="tel:+998712000000" className="transition hover:text-lime-300">+998 71 200 00 00</a>
        </div>
      </div>

      <div className="border-b bg-[var(--surface)]/90 backdrop-blur-xl">
        <div className="container-page flex h-16 items-center gap-2.5 sm:gap-4">
          <button onClick={() => setMenuOpen(true)} className="icon-btn lg:hidden" aria-label="menu">
            <Menu size={19} />
          </button>

          <Logo />

          <button
    onClick={() => setLocationOpen(true)}
    className="hidden items-center gap-2 rounded-xl border px-3 py-2 text-left transition hover:bg-[var(--surface-2)] lg:flex"
  >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400"><MapPin size={16} /></span>
            <span>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-[var(--muted)]">{t("deliveryTo")}</span>
              <span className="block max-w-[170px] truncate text-[11px] font-extrabold">{defaultAddress ? localizeAddress(defaultAddress).address : t("selectAddress")}</span>
            </span>
            <ChevronDown size={14} className="text-[var(--muted)]" />
          </button>

          <form onSubmit={submitSearch} className="relative hidden flex-1 md:block">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="input h-11 rounded-2xl bg-[var(--surface-2)] pl-10 pr-24"
    placeholder={t("searchPlaceholder")}
  />
            <button type="submit" className="absolute right-1.5 top-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-brand-700">
              {t("search")}
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1 sm:gap-1.5">
            <button onClick={toggleTheme} className="icon-btn" aria-label="theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="group relative hidden sm:block">
              <button className="icon-btn" aria-label="language"><Globe2 size={18} /></button>
              <div className="invisible absolute right-0 top-full z-50 w-32 translate-y-1 rounded-xl border bg-[var(--surface)] p-1 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {[
    { code: "uz", label: "O'zbekcha" },
    { code: "ru", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439" },
    { code: "en", label: "English" }
  ].map((l) => <button
    key={l.code}
    onClick={() => changeLang(l.code)}
    className={cn("block w-full rounded-lg px-2.5 py-1.5 text-left text-[11px] font-bold transition hover:bg-[var(--surface-2)]", i18n.language === l.code && "text-brand-600 dark:text-brand-400")}
  >
                    {l.label}
                  </button>)}
              </div>
            </div>

            <Link to="/favorites" className="icon-btn relative hidden sm:inline-flex" aria-label="favorites">
              <Heart size={18} />
              {favorites.length > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">{favorites.length}</span>}
            </Link>

            <Link to="/cart" className="relative flex h-10 items-center gap-2 rounded-xl bg-brand-600 px-2.5 text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-700 sm:px-3">
              <span className="relative">
                <ShoppingCart size={18} />
                {count > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-lime-400 px-1 text-[9px] font-black text-brand-900">{count}</span>}
              </span>
              <span className="hidden text-[11px] font-extrabold lg:block">{subtotal > 0 ? new Intl.NumberFormat("ru-RU").format(subtotal) : t("cart")}</span>
            </Link>

            <div className="relative hidden sm:block" ref={profileRef}>
              <button onClick={() => setProfileOpen((v) => !v)} className="icon-btn" aria-label="profile">
                <User size={18} />
              </button>
              {profileOpen && <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-2xl border bg-[var(--surface)] p-1.5 shadow-2xl animate-fade-up">
                  {user ? <>
                      <div className="rounded-xl bg-[var(--surface-2)] px-3 py-2.5">
                        <p className="text-xs font-extrabold">{user.name}</p>
                        <p className="mt-0.5 text-[10px] text-[var(--muted)]">{user.phone}</p>
                      </div>
                      <Link to="/profile" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition hover:bg-[var(--surface-2)]"><User size={14} /> {t("profile")}</Link>
                      <Link to="/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition hover:bg-[var(--surface-2)]"><Package size={14} /> {t("orders")}</Link>
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-500/10"><LogOut size={14} /> {t("logOut")}</button>
                    </> : <>
                      <Link to="/auth" className="block rounded-lg bg-brand-600 px-3 py-2 text-center text-xs font-extrabold text-white">{t("login")}</Link>
                      <Link to="/auth?mode=register" className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition hover:bg-[var(--surface-2)]"><Sparkles size={14} /> {t("register")}</Link>
                      <Link to="/orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition hover:bg-[var(--surface-2)]"><Package size={14} /> {t("orders")}</Link>
                    </>}
                </div>}
            </div>
          </div>
        </div>

        <form onSubmit={submitSearch} className="container-page pb-2.5 md:hidden">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="input h-10 rounded-xl bg-[var(--surface-2)] pl-9 pr-20" placeholder={t("searchPlaceholder")} />
            <button type="submit" className="absolute right-1 top-1 rounded-lg bg-brand-600 px-3 py-1.5 text-[11px] font-extrabold text-white">{t("search")}</button>
          </div>
        </form>

        <nav className="container-page hidden items-center gap-1 border-t py-1.5 md:flex">
          <NavLink to="/catalog" className="mr-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold text-brand-600 transition hover:bg-brand-500/10 dark:text-brand-400">
            <LayoutGrid size={14} /> {t("allProducts")}
          </NavLink>
          {localizedCategories.slice(0, 6).map((c) => <Link key={c.id} to={`/catalog?category=${c.id}`} className="rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-brand-600">
              {c.emoji} {c.name}
            </Link>)}
        </nav>
      </div>

      {menuOpen && <div className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto bg-[var(--surface)] p-5 shadow-2xl animate-slide-in-right">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setMenuOpen(false)} className="icon-btn h-9 w-9"><X size={18} /></button>
            </div>
            <nav className="mt-6 space-y-1">
              {navItems.map((item) => <NavLink
    key={item.to}
    to={item.to}
    className={({ isActive }) => cn("flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-extrabold transition", isActive ? "bg-brand-500/10 text-brand-600 dark:text-brand-400" : "hover:bg-[var(--surface-2)]")}
  >
                  {t(item.label)} <span className="text-[var(--muted)]">→</span>
                </NavLink>)}
              <NavLink to="/favorites" className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-extrabold transition hover:bg-[var(--surface-2)]">{t("favorites")} <Heart size={15} /></NavLink>
              <NavLink to="/profile" className="flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-extrabold transition hover:bg-[var(--surface-2)]">{t("profile")} <User size={15} /></NavLink>
            </nav>
            <p className="mb-2 mt-6 text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)]">{t("categories")}</p>
            <div className="grid grid-cols-2 gap-2">
              {localizedCategories.map((c) => <Link key={c.id} to={`/catalog?category=${c.id}`} className="card-soft flex items-center gap-2 p-2.5 text-[11px] font-bold">
                  <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-base", c.bg)}>{c.emoji}</span> {c.name}
                </Link>)}
            </div>
            <div className="mt-6 rounded-2xl bg-brand-600 p-4 text-white">
              <p className="text-xs font-extrabold">{t("needHelp")}</p>
              <a href="tel:+998712000000" className="mt-1 block text-lg font-extrabold">+998 71 200 00 00</a>
              <p className="mt-0.5 text-[10px] opacity-80">{t("openingHours")}</p>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border p-2.5">
              <span className="text-xs font-bold">{t("language")}</span>
              <select className="select h-9 w-32 py-1 text-xs" value={i18n.language} onChange={(e) => changeLang(e.target.value)}>
                <option value="uz">O'zbekcha</option>
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>
            <button onClick={toggleTheme} className="mt-2 flex w-full items-center justify-between rounded-xl border p-2.5 text-xs font-bold">
              {t("theme")} <span className="flex items-center gap-1">{dark ? <Sun size={14} /> : <Moon size={14} />} {dark ? t("light") : t("dark")}</span>
            </button>
          </div>
        </div>}

      <Modal open={locationOpen} onClose={() => setLocationOpen(false)} title={t("deliveryTo")} size="sm">
        <div className="space-y-2">
          {addresses.map((a) => <button
    key={a.id}
    onClick={() => {
      setDefaultAddress(a.id);
      setLocationOpen(false);
      pushToast(t("addressSelected"), "success");
    }}
    className={cn("flex w-full items-start gap-2.5 rounded-xl border p-3 text-left transition hover:bg-[var(--surface-2)]", a.isDefault && "border-brand-500 bg-brand-500/5")}
  >
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400"><MapPin size={15} /></span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-xs font-extrabold">{localizeAddress(a).label} {a.isDefault && <span className="badge bg-brand-500/15 text-brand-700 dark:text-brand-300">{t("mainBadge")}</span>}</span>
                <span className="mt-0.5 block text-[11px] text-[var(--muted)]">{localizeAddress(a).address}</span>
                {a.details && <span className="block text-[10px] text-[var(--muted)]">{localizeAddress(a).details}</span>}
              </span>
            </button>)}
          <Link to="/profile?tab=addresses" onClick={() => setLocationOpen(false)} className="btn-secondary w-full"><MapPin size={15} /> {t("addAddress")}</Link>
        </div>
      </Modal>
    </header>;
};
