import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { categories, formatUZS, products } from '../data/mock';
import { localizeProducts } from '../data/productI18n';
import { cartCount, cartDetails, useShop } from '../lib/store';
import { Ms } from './Ms';

const CATEGORY_KEYS = {
  vegetables: 'catVegetables',
  fruits: 'catFruits',
  dairy: 'catDairy',
  meat: 'catMeat',
  bakery: 'catBakery',
  drinks: 'catDrinks',
  snacks: 'catSnacks',
  household: 'catHousehold',
};

const LANGS = [
  { code: 'uz', label: "O'zb" },
  { code: 'ru', label: 'Рус' },
  { code: 'en', label: 'Eng' },
];

export const HomeHeader = ({ activeCategoryId }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { cart, favorites, pushToast } = useShop();
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  const count = cartCount(cart);
  const { subtotal } = cartDetails(cart);
  const currentCategory = new URLSearchParams(search).get('category');

  const localizedProducts = useMemo(() => localizeProducts(products, i18n.language), [i18n.language]);
  const needle = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (!needle) return [];
    const rank = (name) => {
      const lower = name.toLowerCase();
      if (lower.startsWith(needle)) return 0;
      if (lower.split(/[^\p{L}\p{N}]+/u).some((word) => word.startsWith(needle))) return 1;
      return 2;
    };
    return localizedProducts
      .filter((product) =>
        `${product.name} ${product.origin ?? ''} ${product.unit ?? ''} ${(product.tags ?? []).join(' ')}`
          .toLowerCase()
          .includes(needle),
      )
      .sort((a, b) => rank(a.name) - rank(b.name));
  }, [localizedProducts, needle]);
  const suggestions = matches.slice(0, 6);
  const suggestionsVisible = showSuggestions && needle.length > 0;

  useEffect(() => {
    setShowSuggestions(false);
  }, [pathname, search]);

  useEffect(() => {
    const onPointerDown = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false);
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowSuggestions(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    setShowSuggestions(false);
    navigate(value ? `/catalog?q=${encodeURIComponent(value)}` : '/catalog');
  };

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    document.documentElement.style.colorScheme = next ? 'dark' : 'light';
    localStorage.setItem('maxshop-theme', next ? 'dark' : 'light');
    window.dispatchEvent(new Event('maxshop-theme'));
  };

  const changeLang = (code) => {
    i18n.changeLanguage(code);
    pushToast(t('languageChanged'), 'info');
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      {/* Top info bar */}
      <div className="bg-surface-container-low">
        <div className="mx-auto flex min-h-9 max-w-7xl items-center justify-between gap-space-md px-gutter py-1 font-label-sm text-label-sm text-on-surface-variant">
          <div className="flex min-w-0 items-center gap-space-lg">
            <Link
              className="flex shrink-0 items-center gap-space-xs transition-colors hover:text-primary"
              to="/profile?tab=addresses"
            >
              <Ms className="text-primary" name="location_on" size={16} />
              <span className="hidden font-label-md text-label-md font-bold text-on-surface sm:inline">
                {t('headerCityFull')}
              </span>
              <span className="font-label-md text-label-md font-bold text-on-surface sm:hidden">{t('headerCity')}</span>
              <Ms name="keyboard_arrow_down" size={14} />
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-space-md sm:gap-space-lg">
            <a className="flex items-center gap-space-xs transition-colors hover:text-primary" href="tel:+998781401414">
              <Ms name="call" size={16} />
              <span className="font-label-md text-label-md font-bold text-on-surface">+998 78 140 14 14</span>
            </a>
            <span className="text-outline-variant">|</span>
            <div className="flex items-center gap-0.5">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  className={`rounded-md px-1.5 py-1 font-label-sm text-label-sm transition-colors ${
                    i18n.language === l.code
                      ? 'bg-primary/10 font-bold text-primary'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => changeLang(l.code)}
                  type="button"
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              className="flex h-7 w-7 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary"
              onClick={toggleTheme}
              title={dark ? t('light') : t('dark')}
              type="button"
            >
              <Ms name={dark ? 'light_mode' : 'dark_mode'} size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-space-md px-gutter lg:gap-space-lg">
        <Link className="group flex shrink-0 items-center gap-space-xs" to="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-on-primary shadow-sm">
            <Ms name="eco" size={26} />
          </div>
          <div className="hidden flex-col leading-none sm:flex">
            <span className="font-headline-md text-headline-md font-extrabold tracking-tight text-primary">
              Max<span className="text-secondary-container">Shop</span>
            </span>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Supermarket</span>
          </div>
        </Link>
        <Link
          className="hidden items-center gap-space-xs rounded-xl bg-primary px-space-lg py-3 font-label-md text-label-md text-on-primary transition-colors hover:bg-primary-container sm:flex"
          to="/catalog"
        >
          <Ms name="grid_view" size={20} />
          <span>{t('catalog')}</span>
        </Link>
        <div className="relative min-w-0 flex-1" ref={searchRef}>
          <form className="flex min-w-0 w-full items-center gap-space-sm rounded-xl bg-surface-container px-space-sm py-2 md:px-space-md" onSubmit={submitSearch}>
            <div className="hidden cursor-pointer items-center gap-1 pr-space-sm font-label-md text-label-md text-on-surface-variant lg:flex">
              <span>{t('all')}</span>
              <Ms name="expand_more" size={16} />
            </div>
            <div className="hidden h-5 w-px bg-outline-variant lg:block"></div>
            <div className="flex min-w-0 flex-1 items-center gap-space-sm">
              <Ms className="text-outline" name="search" size={20} />
              <input
                className="w-full min-w-0 border-0 bg-transparent text-body-md font-body-md text-on-surface outline-none placeholder:text-outline"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder={t('searchPlaceholder')}
                type="search"
                value={query}
              />
            </div>
            <button className="shrink-0 cursor-pointer rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface" type="submit" aria-label={t('search')}>
              <Ms name="search" size={20} />
            </button>
          </form>

          {suggestionsVisible && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-outline-variant/60 bg-[var(--surface-solid)] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.25)]">
              {suggestions.length > 0 ? (
                <div className="max-h-[70vh] overflow-y-auto py-1">
                  {suggestions.map((product) => (
                    <Link
                      key={product.id}
                      className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-surface-container"
                      onClick={() => setShowSuggestions(false)}
                      to={`/product/${product.id}`}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container">
                        {product.img ? (
                          <img alt={product.name} className="h-full w-full object-contain" loading="lazy" src={product.img} />
                        ) : (
                          <span className="text-xl">{product.emoji}</span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-body-md text-body-md font-bold text-on-surface">
                          {product.name}
                        </span>
                        <span className="block truncate font-label-sm text-label-sm text-on-surface-variant">
                          {[product.unit, product.origin].filter(Boolean).join(' \u00b7 ')}
                        </span>
                      </span>
                      <span className="shrink-0 whitespace-nowrap font-label-md text-label-md font-extrabold text-primary">
                        {formatUZS(product.price)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 px-3 py-3.5">
                  <Ms className="text-outline" name="search_off" size={22} />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{t('searchNothingFound')}</span>
                </div>
              )}
              <Link
                className="flex items-center justify-between gap-2 border-t border-outline-variant/60 bg-surface-container px-3 py-2.5 font-label-md text-label-md font-bold text-primary transition-colors hover:bg-surface-container-high"
                onClick={() => setShowSuggestions(false)}
                to={`/catalog?q=${encodeURIComponent(query.trim())}`}
              >
                <span className="truncate">
                  {t('searchResults')}
                  {matches.length > 0 ? ` \u00b7 ${matches.length}` : ''}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  {t('viewAll')}
                  <Ms name="arrow_forward" size={16} />
                </span>
              </Link>
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-space-xs sm:gap-space-md">
          <Link
            className={`relative flex flex-col items-center gap-0.5 px-2 py-1 transition-colors hover:text-primary ${
              pathname === '/favorites' ? 'text-primary' : 'text-on-surface-variant'
            }`}
            to="/favorites"
            title={t('favorites')}
          >
            <Ms name="favorite" size={24} />
            <span className="hidden font-label-sm text-label-sm lg:block">{t('favorites')}</span>
            {favorites.length > 0 && (
              <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-tertiary px-1 font-label-sm text-[10px] font-bold text-on-tertiary">
                {favorites.length}
              </span>
            )}
          </Link>
          <Link
            className={`hidden flex-col items-center gap-0.5 px-2 py-1 transition-colors hover:text-primary sm:flex ${
              pathname === '/orders' ? 'text-primary' : 'text-on-surface-variant'
            }`}
            to="/orders"
            title={t('orders')}
          >
            <Ms name="receipt_long" size={24} />
            <span className="font-label-sm text-label-sm">{t('orders')}</span>
          </Link>
          <Link
            className={`hidden items-center gap-space-xs px-2 py-1 transition-colors hover:text-primary md:flex ${
              pathname === '/profile' ? 'text-primary' : 'text-on-surface-variant'
            }`}
            to="/profile"
            title={t('profile')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <Ms className="text-on-primary" name="person" size={18} />
            </div>
            <span className="hidden font-label-md text-label-md lg:block">{t('profile')}</span>
          </Link>
          <Link
            className="flex items-center gap-space-sm rounded-xl bg-primary-container px-space-sm py-2.5 text-on-primary-container shadow-sm transition-colors hover:bg-primary sm:px-space-md"
            to="/cart"
            title={t('cart')}
          >
            <div className="relative flex items-center">
              <Ms name="shopping_cart" size={24} />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-container px-1 font-label-sm text-[10px] font-bold text-on-secondary-fixed">
                  {count}
                </span>
              )}
            </div>
            <div className="hidden flex-col text-left sm:flex">
              <span className="font-label-sm text-label-sm text-on-primary-container/80">{t('cart')}</span>
              <span className="whitespace-nowrap font-price-sm text-price-sm font-extrabold text-on-primary-container">
                {subtotal > 0 ? formatUZS(subtotal) : t('emptyShort')}
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Category nav */}
      <div className="bg-surface-container-lowest shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
        <div className="mx-auto max-w-7xl px-gutter">
          <nav className="no-scrollbar flex h-11 items-center gap-space-lg overflow-x-auto">
            <Link
              className={`flex items-center gap-1 whitespace-nowrap font-label-md text-label-md transition-colors ${
                pathname === '/'
                  ? 'font-bold text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              to="/"
            >
              <Ms name="home" size={18} />
              {t('home')}
            </Link>
            <Link className="flex items-center gap-1 whitespace-nowrap font-label-md text-label-md text-tertiary hover:text-tertiary-container" to="/promotions">
              <Ms className="text-tertiary" name="local_fire_department" size={18} />
              {t('navDeals')}
            </Link>
            {categories.map((category) => {
              const active = activeCategoryId === category.id || (pathname !== '/catalog' && currentCategory === category.id);
              return (
                <Link
                  key={category.id}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'whitespace-nowrap font-label-md text-label-md font-bold text-primary transition-colors'
                      : 'whitespace-nowrap font-label-md text-label-md text-on-surface-variant transition-colors hover:text-on-surface'
                  }
                  to={`/catalog?category=${category.id}`}
                >
                  {t(CATEGORY_KEYS[category.id])}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
