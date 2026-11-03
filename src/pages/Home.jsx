import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Ms } from '../components/Ms';
import { formatUZS, products } from '../data/mock';
import { homeDeals, homeFrequent, homeHits } from '../data/displayProducts';
import { localizeProducts } from '../data/productI18n';
import { useShop } from '../lib/store';

/* ---------- data (static, no backend yet) ---------- */

const HERO_SLIDES = [
  {
    id: 's1',
    img: '/images/img-23.jpg',
    badgeKey: 'hero1Badge',
    titleKey: 'hero1Title',
    textKey: 'hero1Text',
    ctaKey: 'emptyCartBtn',
    to: '/catalog',
  },
  {
    id: 's2',
    img: '/images/img-24.jpg',
    badgeKey: 'hero2Badge',
    titleKey: 'hero2Title',
    textKey: 'hero2Text',
    ctaKey: 'hero2Cta',
    to: '/catalog?category=dairy',
  },
  {
    id: 's3',
    type: 'offer',
    img: '/images/img-28.jpg',
    titleKey: 'hero3Title',
    priceKey: 'hero3Price',
    oldPriceKey: 'hero3OldPrice',
    discount: '-35%',
    productId: 'd6',
    to: '/product/d6',
  },
];

const POPULAR_CATEGORIES = [
  { id: 'vegetables', labelKey: 'catVegetables', img: '/images/img-24.jpg' },
  { id: 'dairy', labelKey: 'catDairy', img: '/images/img-25.jpg' },
  { id: 'meat', labelKey: 'catMeat', img: '/images/img-26.jpg' },
  { id: 'drinks', labelKey: 'catDrinks', img: '/images/img-27.jpg' },
  { id: 'bakery', labelKey: 'catBakery', img: '/images/img-28.jpg' },
  { id: 'snacks', labelKey: 'catSnacks', img: '/images/img-29.jpg' },
  { id: 'household', labelKey: 'catHousehold', img: '/images/img-30.jpg' },
  { id: 'fruits', labelKey: 'catFruits', img: '/images/img-31.jpg' },
];

const FEATURES = [
  {
    iconClass: 'bg-primary-fixed-dim text-on-primary-fixed',
    icon: 'verified',
    titleKey: 'feature2Title',
    textKey: 'feature2Text',
  },
  {
    iconClass: 'bg-secondary-fixed text-on-secondary-fixed',
    icon: 'contactless',
    titleKey: 'feature3Title',
    textKey: 'feature3Text',
  },
  {
    iconClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
    icon: 'assignment_return',
    titleKey: 'feature4Title',
    textKey: 'feature4Text',
  },
];

/* ---------- hero carousel ---------- */

const HeroCarousel = ({ className = '' }) => {
  const { t } = useTranslation();
  const { addToCart } = useShop();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef(null);
  const total = HERO_SLIDES.length;
  const go = (next) => setIndex(((next % total) + total) % total);

  useEffect(() => {
    if (paused) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % total), 6000);
    return () => clearInterval(timer);
  }, [paused, total]);

  const onTouchStart = (event) => {
    startX.current = event.touches[0]?.clientX ?? null;
  };
  const onTouchEnd = (event) => {
    if (startX.current === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? startX.current) - startX.current;
    if (Math.abs(delta) > 45) go(index + (delta < 0 ? 1 : -1));
    startX.current = null;
  };

  const controls = (
    <div className="relative z-10 flex items-center justify-between gap-space-md pt-4">
      <div className="flex items-center gap-2">
        {HERO_SLIDES.map((item, dotIndex) => (
          <button
            key={item.id}
            aria-current={dotIndex === index}
            aria-label={item.titleKey ? t(item.titleKey) : t(item.badgeKey)}
            className={`h-2 rounded-full transition-all ${
              dotIndex === index ? 'w-8 bg-primary' : 'w-2.5 bg-white/50 hover:bg-white/80'
            }`}
            onClick={() => go(dotIndex)}
            type="button"
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label={t('prevPage')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/35"
          onClick={() => go(index - 1)}
          type="button"
        >
          <Ms name="chevron_left" size={20} />
        </button>
        <button
          aria-label={t('nextPage')}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition-colors hover:bg-white/35"
          onClick={() => go(index + 1)}
          type="button"
        >
          <Ms name="chevron_right" size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-surface-container-low shadow-sm ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {HERO_SLIDES.map((slide) =>
          slide.type === 'offer' ? (
            <div
              key={slide.id}
              className="relative flex min-h-[360px] w-full shrink-0 flex-col justify-between p-space-lg sm:p-space-xl"
            >
              <img
                alt={t(slide.titleKey)}
                className="absolute inset-0 h-full w-full select-none object-cover"
                draggable="false"
                src={slide.img}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-on-surface/90 via-on-surface/60 to-on-surface/15"></div>

              <div className="relative z-10 flex flex-wrap items-center gap-space-sm">
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 font-label-sm text-label-sm uppercase text-on-secondary shadow-sm">
                  <Ms filled name="star" size={14} />
                  {t('dealOfDay')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-tertiary px-3 py-1 font-label-sm text-label-sm uppercase text-on-tertiary shadow-sm">
                  <Ms name="local_fire_department" size={14} />
                  {slide.discount}
                </span>
              </div>

              <div className="relative z-10 max-w-lg space-y-space-sm text-left">
                <h1 className="font-display-lg text-headline-lg-mobile font-extrabold tracking-tight text-white drop-shadow-sm sm:text-display-lg">
                  {t(slide.titleKey)}
                </h1>
                <div className="flex items-baseline gap-space-sm">
                  <span className="font-price-lg text-price-lg font-extrabold text-white">{t(slide.priceKey)}</span>
                  <span className="font-body-md text-body-md text-white/60 line-through">{t(slide.oldPriceKey)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-space-md pt-2">
                  <button
                    className="inline-flex items-center gap-space-xs rounded-xl bg-primary px-6 py-3 font-label-md text-label-md text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-95"
                    onClick={() => addToCart(slide.productId)}
                    type="button"
                  >
                    <Ms name="add_shopping_cart" size={18} />
                    <span>{t('addToCart')}</span>
                  </button>
                  <Link
                    className="inline-flex items-center gap-1 rounded-xl border border-white/40 px-5 py-3 font-label-md text-label-md text-white backdrop-blur transition-colors hover:bg-white/15"
                    to={slide.to}
                  >
                    <span>{t('viewProduct')}</span>
                    <Ms name="arrow_forward" size={18} />
                  </Link>
                </div>
              </div>

              {controls}
            </div>
          ) : (
          <div
            key={slide.id}
            className="relative flex min-h-[360px] w-full shrink-0 flex-col justify-between p-space-lg sm:p-space-xl"
          >
            <img
              alt={t(slide.titleKey)}
              className="absolute inset-0 h-full w-full select-none object-cover"
              draggable="false"
              src={slide.img}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-on-surface/90 via-on-surface/55 to-on-surface/10"></div>

            <div className="relative z-10 flex flex-wrap items-center gap-space-sm">
              <span className="inline-flex items-center gap-1 rounded-full bg-tertiary px-3 py-1 font-label-sm text-label-sm uppercase text-on-tertiary shadow-sm">
                <Ms name="local_fire_department" size={14} />
                {t(slide.badgeKey)}
              </span>
            </div>

            <div className="relative z-10 max-w-lg space-y-space-sm text-left" key={`${slide.id}-${index}`}>
              <h1 className="animate-fade-up font-display-lg text-headline-lg-mobile font-extrabold tracking-tight text-white drop-shadow-sm sm:text-display-lg">
                {t(slide.titleKey)}
              </h1>
              <p className="max-w-md font-body-md text-body-md text-white/85">{t(slide.textKey)}</p>
              <div className="flex flex-wrap items-center gap-space-md pt-2">
                <Link
                  className="inline-flex items-center gap-space-xs rounded-xl bg-primary px-6 py-3 font-label-md text-label-md text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-95"
                  to={slide.to}
                >
                  <span>{t(slide.ctaKey)}</span>
                  <Ms name="arrow_forward" size={18} />
                </Link>
              </div>
            </div>

            {controls}
          </div>
          )
        )}
      </div>
    </div>
  );
};

/* ---------- shared card components ---------- */

const FavButton = ({ productId }) => {
  const { t } = useTranslation();
  const { favorites, toggleFavorite } = useShop();
  const active = favorites.includes(productId);
  return (
    <button
      className={`absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-low transition-colors hover:bg-surface-variant ${
        active ? 'text-tertiary' : 'text-on-surface-variant hover:text-tertiary'
      }`}
      onClick={() => toggleFavorite(productId)}
      title={active ? t('removeFromFavorites') : t('addToFavorites')}
      type="button"
    >
      <Ms filled={active} name="favorite" size={18} />
    </button>
  );
};

const AddToCartButton = ({ productId }) => {
  const { t } = useTranslation();
  const { addToCart } = useShop();
  return (
    <button
      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2.5 font-label-md text-label-md font-bold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
      onClick={() => addToCart(productId)}
      type="button"
    >
      <Ms name="add" size={18} />
      <span>{t('addToCartShort')}</span>
    </button>
  );
};

const CartQtyControl = ({ productId }) => {
  const { t } = useTranslation();
  const { addToCart, cart, setQty } = useShop();
  const item = cart.find((entry) => entry.productId === productId);
  if (!item) return <AddToCartButton productId={productId} />;
  return (
    <div className="flex w-full items-center justify-between rounded-lg bg-primary-fixed/30 p-1">
      <button
        className="flex h-8 w-8 items-center justify-center rounded bg-surface-container-lowest font-bold text-primary shadow-sm hover:bg-white"
        onClick={() => setQty(productId, item.qty - 1)}
        type="button"
      >
        -
      </button>
      <span className="font-label-md text-label-md font-extrabold text-primary">{item.qty} {t('pcsShort')}</span>
      <button
        className="flex h-8 w-8 items-center justify-center rounded bg-primary font-bold text-on-primary shadow-sm hover:bg-primary-container"
        onClick={() => (item ? setQty(productId, item.qty + 1) : addToCart(productId))}
        type="button"
      >
        +
      </button>
    </div>
  );
};

const DealCard = ({ item }) => (
  <div className="group relative flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
    <div className="absolute left-3 top-3 z-10">
      <span className="rounded-full bg-tertiary px-2 py-0.5 font-label-sm text-label-sm font-bold text-on-tertiary shadow-sm">{item.discount}</span>
    </div>
    <FavButton productId={item.id} />
    <Link
      className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-surface-container-low"
      to={`/product/${item.id}`}
    >
      {item.img ? (
        <img alt={item.name} className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105" src={item.img} />
      ) : (
        <span className="text-5xl transition-transform group-hover:scale-110">{item.emoji}</span>
      )}
    </Link>

    <div className="mb-3 space-y-1">
      <span className="font-body-sm text-body-sm text-on-surface-variant">{item.unit}</span>
      <Link className="block" to={`/product/${item.id}`}>
        <h3 className="line-clamp-2 font-headline-sm text-headline-sm font-semibold leading-snug text-on-surface transition-colors group-hover:text-primary">{item.name}</h3>
      </Link>
    </div>
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="whitespace-nowrap font-price-lg text-price-lg font-extrabold text-on-surface">{formatUZS(item.price)}</span>
        {item.oldPrice && <span className="whitespace-nowrap font-body-sm text-body-sm text-outline line-through">{formatUZS(item.oldPrice)}</span>}
      </div>
      <AddToCartButton productId={item.id} />
    </div>
  </div>
);

const HitCard = ({ item }) => (
  <div className="group relative flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
    <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-2 py-0.5 font-label-sm text-label-sm font-bold text-secondary shadow-sm">
      <Ms className="text-secondary" filled name="star" size={14} />
      <span>{item.rating}</span>
      <span className="text-[10px] font-normal text-on-surface-variant">({item.reviews})</span>
    </div>
    <FavButton productId={item.id} />
    <Link
      className="mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-surface-container-low"
      to={`/product/${item.id}`}
    >
      {item.img ? (
        <img alt={item.name} className="h-full w-full object-contain p-2 transition-transform group-hover:scale-105" src={item.img} />
      ) : (
        <span className="text-5xl transition-transform group-hover:scale-110">{item.emoji}</span>
      )}
    </Link>

    <div className="mb-3 space-y-1">
      <span className="font-body-sm text-body-sm text-on-surface-variant">{item.unit}</span>
      <Link className="block" to={`/product/${item.id}`}>
        <h3 className="line-clamp-2 font-headline-sm text-headline-sm font-semibold leading-snug text-on-surface transition-colors group-hover:text-primary">{item.name}</h3>
      </Link>
    </div>
    <div>
      <div className="mb-2">
        <span className="whitespace-nowrap font-price-lg text-price-lg font-extrabold text-on-surface">{formatUZS(item.price)}</span>
      </div>
      <CartQtyControl productId={item.id} />
    </div>
  </div>
);

/* ---------- countdown timer (23:14:02 → 0) ---------- */

const pad = (n) => (n < 10 ? '0' + n : String(n));
const START_SECONDS = 23 * 3600 + 14 * 60 + 2;

const useCountdown = (from) => {
  const [seconds, setSeconds] = useState(from);
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  return seconds;
};

/* ---------- page ---------- */

export const Home = () => {
  const { t, i18n } = useTranslation();
  const { addToCart } = useShop();
  const deals = localizeProducts(homeDeals, i18n.language);
  const hits = localizeProducts(homeHits, i18n.language);
  const frequent = localizeProducts(homeFrequent, i18n.language);
  const discountCount = products.filter((product) => product.oldPrice).length;
  const left = useCountdown(START_SECONDS);
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-space-xl px-gutter pb-16">
          {/* Full-width hero banner (deal of the day is one of the slides) */}
          <section className="pt-4">
            <HeroCarousel />
          </section>

          {/* Popular categories */}
          <section className="space-y-space-md">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">{t('popularCategories')}</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('popularCatsSub')}</p>
              </div>
              <Link className="flex items-center gap-1 font-label-md text-label-md font-bold text-primary hover:underline" to="/catalog">
                <span>{t('allCats')}</span>
                <Ms name="arrow_forward" size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-space-sm sm:grid-cols-8">
              {POPULAR_CATEGORIES.map((c) => (
                <Link
                  key={c.id}
                  className="group flex flex-col items-center rounded-xl bg-surface-container-lowest p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  to={`/catalog?category=${c.id}`}
                >
                  <div className="mb-2 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-surface-container transition-transform duration-300 group-hover:scale-110 sm:h-16 sm:w-16">
                    <img alt={t(c.labelKey)} className="h-full w-full object-cover" draggable="false" src={c.img} />
                  </div>
                  <span className="text-center font-label-md text-label-md font-semibold leading-tight text-on-surface transition-colors group-hover:text-primary">
                    {t(c.labelKey)}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Today's deals + countdown */}
          <section className="space-y-space-md rounded-xl bg-surface-container-low p-space-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-md">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tertiary text-on-tertiary shadow-sm">
                    <Ms name="timer" size={20} />
                  </div>
                  <div>
                    <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">{t('todayDeals')}</h2>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{t('todayDealsSub')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-surface-container-lowest px-3 py-1.5 shadow-sm">
                  <span className="font-label-sm text-label-sm font-bold uppercase text-tertiary">{t('endsIn')}</span>
                  <div className="flex items-center gap-1 font-price-sm text-price-sm font-extrabold tracking-widest text-on-surface">
                    <span className="rounded bg-surface-container px-1.5 py-0.5">{pad(h)}</span>
                    <span>:</span>
                    <span className="rounded bg-surface-container px-1.5 py-0.5">{pad(m)}</span>
                    <span>:</span>
                    <span className="rounded bg-surface-container px-1.5 py-0.5">{pad(s)}</span>
                  </div>
                </div>
              </div>
              <Link className="flex items-center gap-1 font-label-md text-label-md font-bold text-primary hover:underline" to="/promotions">
                <span>{t('allDeals')} ({discountCount})</span>
                <Ms name="chevron_right" size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-space-md sm:grid-cols-3 lg:grid-cols-5">
              {deals.map((item) => (
                <DealCard item={item} key={item.id} />
              ))}
            </div>
          </section>

          {/* Hit products */}
          <section className="space-y-space-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Ms className="text-secondary" name="verified" size={24} />
                  <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">{t('hitsTitle')}</h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('hitsSub')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high" type="button">
                  <Ms name="arrow_back" size={18} />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high" type="button">
                  <Ms name="arrow_forward" size={18} />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-space-md sm:grid-cols-3 lg:grid-cols-5">
              {hits.map((item) => (
                <HitCard item={item} key={item.id} />
              ))}
            </div>
          </section>

          {/* Why us */}
          <section className="rounded-xl bg-surface-container-lowest p-space-xl shadow-sm">
            <div className="mx-auto mb-10 max-w-xl space-y-2 text-center">
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">{t('whyEyebrow')}</span>
              <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">{t('whyTitle')}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('whySub')}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-space-lg sm:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.titleKey}
                  className="flex flex-col items-start space-y-space-sm rounded-xl bg-surface-container-low p-space-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-sm"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-sm ${f.iconClass}`}>
                    <Ms name={f.icon} size={26} />
                  </div>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t(f.titleKey)}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t(f.textKey)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Frequently bought */}
          <section className="space-y-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-fixed text-primary">
                  <Ms name="history" size={16} />
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">{t('frequentTitle')}</h2>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{t('frequentSub')}</span>
                </div>
              </div>
              <button
                className="font-label-md text-label-md font-bold text-primary hover:underline"
                onClick={() => frequent.forEach((item) => addToCart(item.id))}
                type="button"
              >
                {t('addAll')}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
              {frequent.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-xl bg-surface-container-lowest p-3 shadow-sm transition-shadow hover:shadow-md">
                  <Link
                    className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-low p-1"
                    to={`/product/${item.id}`}
                  >
                    {item.img ? (
                      <img alt={item.name} className="h-full w-full object-contain" src={item.img} />
                    ) : (
                      <span className="text-2xl">{item.emoji}</span>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link className="block" to={`/product/${item.id}`}>
                      <h4 className="truncate font-label-md text-label-md font-semibold text-on-surface transition-colors hover:text-primary">{item.name}</h4>
                    </Link>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{item.unit}</span>
                    <div className="font-price-sm text-price-sm font-bold text-on-surface">{formatUZS(item.price)}</div>
                  </div>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-fixed/40 text-primary transition-colors hover:bg-primary hover:text-on-primary"
                    onClick={() => addToCart(item.id)}
                    type="button"
                  >
                    <Ms name="add" size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>

    </div>
  );
};
