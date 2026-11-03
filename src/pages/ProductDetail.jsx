import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { discountPercent, formatUZS, getCategory, getProduct, localizeCategory, products } from '../data/mock';
import { localizeProduct, localizeProducts } from '../data/productI18n';
import { useShop } from '../lib/store';
import { Ms } from '../components/Ms';
import { EmptyState, Modal, cn } from '../lib/ui';

/* ---------- static demo data ---------- */

const NUTRITION = {
  fruits: { kcal: 89, protein: 1.1, fat: 0.3, carbs: 22.8, daily: 4.5 },
  vegetables: { kcal: 34, protein: 2.8, fat: 0.4, carbs: 6.6, daily: 1.7 },
  dairy: { kcal: 64, protein: 3.3, fat: 3.2, carbs: 4.7, daily: 3.2 },
  meat: { kcal: 187, protein: 19.4, fat: 12.1, carbs: 0, daily: 9.4 },
  bakery: { kcal: 265, protein: 8.1, fat: 4.2, carbs: 48.8, daily: 13.3 },
  drinks: { kcal: 42, protein: 0.5, fat: 0.1, carbs: 10.2, daily: 2.1 },
  snacks: { kcal: 214, protein: 2.5, fat: 12.4, carbs: 23.9, daily: 10.7 },
};

const REVIEWS = [
  { key: 'pdReview1', name: 'Madina Karimova', initials: 'MK', rating: 5, tone: 'bg-primary-fixed text-on-primary-fixed' },
  { key: 'pdReview2', name: 'Bekzod Ergashev', initials: 'BE', rating: 5, tone: 'bg-secondary-fixed text-on-secondary-fixed' },
];

const DISTRIBUTION = [
  { stars: 5, percent: 88 },
  { stars: 4, percent: 10 },
  { stars: 3, percent: 2 },
];

const bundleOptions = (unit) => [1, 2, 3].map((amount) => ({ amount, label: `${amount} × ${unit}` }));

/* ---------- page ---------- */

export const ProductDetail = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, favorites, pushToast, user } = useShop();

  const rawProduct = getProduct(id ?? '');
  const product = rawProduct ? localizeProduct(rawProduct, i18n.language) : undefined;
  const category = product ? localizeCategory(getCategory(product.categoryId)) : undefined;
  const nutrition = product ? NUTRITION[product.categoryId] ?? null : null;

  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState(nutrition ? 'nutrition' : 'description');
  const [zoomed, setZoomed] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [myReviews, setMyReviews] = useState([]);

  useEffect(() => {
    setQty(1);
    setZoomed(false);
  }, [id]);

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-7xl px-gutter py-16">
        <EmptyState
          title={t('productNotFound')}
          description={t('notFoundDesc')}
          action={<Link className="btn-primary btn-sm" to="/catalog">{t('catalog')}</Link>}
        />
      </div>
    );
  }

  const off = discountPercent(product);
  const isFav = favorites.includes(product.id);
  const total = product.price * qty;
  const totalOld = (product.oldPrice ?? product.price) * qty;
  const savings = totalOld - total;
  const maxQty = Math.max(1, Math.min(product.stock, 20));
  const related = localizeProducts(
    products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4),
    i18n.language,
  );

  const tabs = [
    ...(nutrition ? [{ key: 'nutrition', label: t('pdNutritionTab') }] : []),
    { key: 'description', label: t('pdDescriptionTab') },
    { key: 'reviews', label: t('pdReviewsTab', { count: product.reviews }) },
  ];
  const activeTab = tabs.some((item) => item.key === tab) ? tab : tabs[0].key;

  const setAmount = (amount) => setQty(Math.min(amount, maxQty));
  const changeQty = (delta) => setQty((current) => Math.min(maxQty, Math.max(1, current + delta)));

  const handleAdd = () => addToCart(product.id, qty);

  const buyNow = () => {
    addToCart(product.id, qty);
    navigate('/cart');
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
        return;
      } catch {
        /* user dismissed the share sheet */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      pushToast(t('pdShareCopied'), 'success');
    } catch {
      pushToast(url, 'info');
    }
  };

  const submitReview = (event) => {
    event.preventDefault();
    const text = reviewText.trim();
    if (!text) {
      pushToast(t('pdReviewEmpty'), 'error');
      return;
    }
    setMyReviews((current) => [
      {
        key: `mine-${current.length}`,
        name: user?.name ?? t('pdGuest'),
        initials: (user?.name ?? t('pdGuest')).slice(0, 2).toUpperCase(),
        rating: reviewRating,
        tone: 'bg-primary text-on-primary',
        text,
        fresh: true,
      },
      ...current,
    ]);
    setReviewText('');
    setReviewRating(5);
    setReviewOpen(false);
    pushToast(t('pdReviewThanks'), 'success');
  };

  const goToReviews = () => {
    setTab('reviews');
    document.getElementById('product-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-gutter py-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
        <Link className="flex items-center gap-1 transition-colors hover:text-primary" to="/">
          <Ms name="home" size={16} />
          <span>{t('home')}</span>
        </Link>
        <Ms className="text-outline-variant" name="chevron_right" size={14} />
        <Link className="transition-colors hover:text-primary" to="/catalog">{t('catalog')}</Link>
        <Ms className="text-outline-variant" name="chevron_right" size={14} />
        <Link className="transition-colors hover:text-primary" to={`/catalog?category=${product.categoryId}`}>
          {t(`cat${product.categoryId.charAt(0).toUpperCase()}${product.categoryId.slice(1)}`)}
        </Link>
        <Ms className="text-outline-variant" name="chevron_right" size={14} />
        <span className="max-w-xs truncate font-semibold text-on-surface">{product.name}</span>
      </nav>

      {/* Product presentation */}
      <div className="mb-16 grid grid-cols-12 items-start gap-8">
        {/* Media + specs */}
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-7">
          <div className="relative flex min-h-[360px] flex-1 items-center justify-center overflow-hidden rounded-2xl bg-surface-container-lowest p-6 shadow-md sm:min-h-[460px]">
            <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
              {off > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-tertiary px-3 py-1 font-label-md text-label-md font-bold text-on-tertiary shadow-sm">
                  <Ms name="local_fire_department" size={15} />
                  <span>{t('pdBadgeDeal')} -{off}%</span>
                </span>
              )}
              {product.popular && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 font-label-md text-label-md font-bold text-on-primary shadow-sm">
                  <Ms name="nest_eco_leaf" size={15} />
                  <span>{t('popular')}</span>
                </span>
              )}
            </div>

            <div className="absolute right-4 top-4 z-10 flex flex-col gap-2">
              <button
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full bg-surface-container text-on-surface-variant shadow-sm transition-all hover:bg-surface-container-high hover:text-tertiary',
                  isFav && 'text-tertiary',
                )}
                onClick={() => toggleFavorite(product.id)}
                title={isFav ? t('removeFromFavorites') : t('addToFavorites')}
                type="button"
              >
                <Ms filled={isFav} name="favorite" size={22} />
              </button>
            </div>

            {product.img ? (
              <img
                alt={product.name}
                className={cn('max-h-[340px] w-auto object-contain transition-transform duration-300', zoomed && 'scale-150')}
                src={product.img}
              />
            ) : (
              <span className={cn('text-[8rem] transition-transform duration-300', zoomed && 'scale-125')}>{product.emoji}</span>
            )}

            <button
              className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-surface-container-low px-3 py-1.5 text-left transition-colors hover:bg-surface-container"
              onClick={() => setZoomed((v) => !v)}
              type="button"
            >
              <Ms className="text-primary" name={zoomed ? 'zoom_out' : 'zoom_in'} size={18} />
              <span className="font-label-sm text-label-sm text-on-surface">{zoomed ? t('pdZoomOut') : t('pdZoomIn')}</span>
            </button>

            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-xl bg-surface-container-low/90 px-3 py-1.5">
              <Ms className="text-primary" name="verified_user" size={18} />
              <span className="font-label-sm text-label-sm text-on-surface">{t('pdFreshTag')}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { icon: 'public', label: t('pdSpecOrigin'), value: product.origin ?? category?.name ?? '—' },
              { icon: 'scale', label: t('pdSpecUnit'), value: product.unit },
              { icon: 'inventory_2', label: t('pdSpecStock'), value: `${product.stock} ${t('perUnit')}` },
            ].map((tile) => (
              <div key={tile.label} className="rounded-xl bg-surface-container-low p-3">
                <Ms className="text-primary" name={tile.icon} size={20} />
                <p className="mt-1.5 font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{tile.label}</p>
                <p className="font-label-md text-label-md font-bold text-on-surface">{tile.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Commerce engine */}
        <div className="col-span-12 flex flex-col gap-5 lg:col-span-5">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="rounded-md bg-surface-container px-2.5 py-1 font-label-md text-label-md font-bold uppercase tracking-wider text-primary">
                  {product.origin ?? category?.name ?? t('catalog')}
                </span>
                <Ms className="text-primary" name="verified" size={18} />
              </span>
              <span className="font-body-sm text-body-sm text-outline">
                {t('pdArticle')}: {product.id.toUpperCase()}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg font-extrabold leading-tight tracking-tight text-on-surface">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 rounded-lg bg-secondary-fixed/40 px-2.5 py-1">
                <Ms className="text-secondary" filled name="star" size={18} />
                <span className="font-price-sm text-price-sm font-bold text-on-surface">{product.rating}</span>
              </span>
              <button className="font-body-md text-body-md font-semibold text-primary hover:underline" onClick={goToReviews} type="button">
                {product.reviews} {t('reviews')}
              </button>
              <span className="text-outline-variant">•</span>
              <span className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                <Ms className="text-primary" name="thumb_up" size={16} />
                <span>{t('pdRecommend', { percent: Math.round(product.rating * 20) })}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="font-display-lg text-display-lg font-extrabold leading-none text-primary">{formatUZS(total)}</span>
                {product.oldPrice && (
                  <span className="font-body-md text-body-md text-outline line-through">{formatUZS(totalOld)}</span>
                )}
              </div>
              {savings > 0 && (
                <span className="rounded-full bg-error-container px-2.5 py-1 font-label-sm text-label-sm font-bold text-on-error-container">
                  {t('pdSave', { amount: formatUZS(savings) })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <Ms className="text-primary" name="price_check" size={16} />
              <span>{t('pdPriceNote', { unit: product.unit })}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="flex items-center justify-between font-label-md text-label-md font-bold text-on-surface">
              <span>{t('pdWeightLabel')}</span>
              <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">
                {t('pdSelected', { qty, unit: product.unit })}
              </span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {bundleOptions(product.unit).filter((option) => option.amount <= maxQty).map((option) => (
                <button
                  key={option.amount}
                  className={cn(
                    'rounded-xl px-3 py-2.5 text-center font-label-md text-label-md transition-all',
                    qty === option.amount
                      ? 'bg-primary font-bold text-on-primary shadow-sm'
                      : 'bg-surface-container font-semibold text-on-surface hover:bg-surface-container-high',
                  )}
                  onClick={() => setAmount(option.amount)}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex shrink-0 items-center rounded-xl bg-surface-container-lowest p-1 shadow-sm">
              <button
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
                onClick={() => changeQty(-1)}
                type="button"
              >
                <Ms name="remove" size={20} />
              </button>
              <div className="w-16 text-center">
                <span className="font-price-lg text-price-lg font-bold text-on-surface">{qty}</span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">{product.unit}</span>
              </div>
              <button
                className="flex h-11 w-11 items-center justify-center rounded-lg bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high"
                onClick={() => changeQty(1)}
                type="button"
              >
                <Ms name="add" size={20} />
              </button>
            </div>
            <button
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-primary font-label-md text-label-md font-extrabold text-on-primary shadow-md transition-all hover:bg-primary-container active:scale-95"
              onClick={handleAdd}
              type="button"
            >
              <Ms name="shopping_cart" size={22} />
              <span>{t('pdAddToCartAmount', { total: formatUZS(total) })}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-surface-container-low font-label-md text-label-md font-bold text-primary shadow-sm transition-colors hover:bg-surface-container"
              onClick={buyNow}
              type="button"
            >
              <Ms name="bolt" size={18} />
              <span>{t('pdBuyNow')}</span>
            </button>
            <button
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-surface-container-lowest px-4 font-label-md text-label-md text-on-surface-variant shadow-sm transition-colors hover:bg-surface-container hover:text-on-surface"
              onClick={share}
              title={t('pdShare')}
              type="button"
            >
              <Ms name="share" size={18} />
              <span>{t('pdShare')}</span>
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-low p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-fixed/40 text-primary">
                <Ms name="verified" size={20} />
              </span>
              <div>
                <p className="font-label-md text-label-md font-bold text-on-surface">{t('pdQualityTitle')}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('pdQualityText')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-16 rounded-3xl bg-surface-container-lowest p-6 shadow-sm md:p-8" id="product-tabs">
        <div className="no-scrollbar mb-6 flex items-center gap-3 overflow-x-auto pb-4">
          {tabs.map((item) => (
            <button
              key={item.key}
              className={cn(
                'whitespace-nowrap rounded-full px-5 py-2.5 font-label-md text-label-md transition-all',
                activeTab === item.key
                  ? 'bg-primary font-bold text-on-primary shadow-sm'
                  : 'font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              )}
              onClick={() => setTab(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>

        {activeTab === 'nutrition' && nutrition && (
          <div>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              {[
                { label: t('pdEnergy'), value: nutrition.kcal, unit: 'kkal', accent: 'text-primary', bar: null },
                { label: t('pdProtein'), value: nutrition.protein, unit: 'g', accent: 'text-on-surface', bar: 12 },
                { label: t('pdFat'), value: nutrition.fat, unit: 'g', accent: 'text-on-surface', bar: 4 },
                { label: t('pdCarbs'), value: nutrition.carbs, unit: 'g', accent: 'text-secondary', bar: 65 },
              ].map((item) => (
                <div key={item.label} className="flex flex-col justify-between rounded-2xl bg-surface-container-low p-4">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">{item.label}</span>
                  <div className="my-2">
                    <span className={cn('font-headline-lg text-headline-lg font-black', item.accent)}>{item.value}</span>
                    <span className="font-label-md text-label-md font-semibold text-on-surface"> {item.unit}</span>
                  </div>
                  {item.bar ? (
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-highest">
                      <div className="h-full bg-primary" style={{ width: `${item.bar}%` }}></div>
                    </div>
                  ) : (
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {t('pdDaily', { percent: nutrition.daily })}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-surface-container-low p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Ms name="vital_signs" size={24} />
              </span>
              <div className="min-w-[12rem] flex-1">
                <p className="font-label-md text-label-md font-bold text-on-surface">{t('pdNutriNoteTitle')}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('pdNutriNoteText')}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'description' && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-4 md:col-span-2">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('pdAboutTitle')}</h3>
              <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">
                {product.description} {t('pdAboutExtra')}
              </p>
              <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
                <div className="flex items-center gap-2.5">
                  <Ms className="text-primary" name="public" size={24} />
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{t('origin')}</p>
                    <p className="font-label-md text-label-md font-bold text-on-surface">{product.origin ?? t('originValue')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Ms className="text-primary" name="local_shipping" size={24} />
                  <div>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">{t('pdSupplier')}</p>
                    <p className="font-label-md text-label-md font-bold text-on-surface">{t('pdSupplierValue')}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {(product.tags ?? [category?.name]).filter(Boolean).map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-surface-container px-3 py-1 font-label-sm text-label-sm font-bold text-on-surface-variant">
                    <Ms className="text-primary" name="check" size={14} /> {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-3 rounded-2xl bg-surface-container-low p-5">
              <h4 className="flex items-center gap-2 font-label-md text-label-md font-bold text-on-surface">
                <Ms className="text-secondary" name="thermostat" size={20} />
                {t('pdStorageRules')}
              </h4>
              <div className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                <div className="flex justify-between gap-2 py-1">
                  <span>{t('pdStorageTemp')}</span>
                  <span className="font-bold text-on-surface">{t('pdStorageTempValue')}</span>
                </div>
                <div className="flex justify-between gap-2 py-1">
                  <span>{t('pdStorageDays')}</span>
                  <span className="font-bold text-on-surface">{t('pdStorageDaysValue')}</span>
                </div>
                <div className="flex justify-between gap-2 py-1">
                  <span>{t('pdStorageFridge')}</span>
                  <span className="font-bold text-tertiary">{t('pdStorageFridgeValue')}</span>
                </div>
              </div>
              <p className="rounded-xl bg-surface-container p-2.5 font-label-sm text-label-sm text-on-surface-variant">
                💡 {t('pdStorageTip')}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
            <div className="flex flex-col items-center rounded-2xl bg-surface-container-low p-6 text-center md:col-span-4">
              <span className="font-display-lg text-display-lg font-black leading-none text-on-surface">{product.rating}</span>
              <span className="my-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ms key={i} className="text-secondary" filled={i <= Math.round(product.rating)} name={i <= Math.round(product.rating) ? 'star' : 'star_half'} size={22} />
                ))}
              </span>
              <span className="mb-6 font-body-sm text-body-sm text-on-surface-variant">
                {t('pdReviewsBased', { count: product.reviews })}
              </span>
              <div className="w-full space-y-2 font-label-sm text-label-sm text-on-surface-variant">
                {DISTRIBUTION.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2">
                    <span className="w-6 text-right">{row.stars} ★</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${row.percent}%` }}></div>
                    </div>
                    <span className="w-8 text-right font-semibold">{row.percent}%</span>
                  </div>
                ))}
              </div>
              <button
                className="mt-6 w-full rounded-xl bg-surface-container py-2.5 font-label-md text-label-md font-bold text-primary transition-colors hover:bg-surface-container-high"
                onClick={() => setReviewOpen(true)}
                type="button"
              >
                {t('pdLeaveReview')}
              </button>
            </div>

            <div className="space-y-4 md:col-span-8">
              {[...myReviews, ...REVIEWS.map((review) => ({ ...review, text: t(review.key) }))].map((review) => (
                <div key={review.key} className="space-y-2 rounded-2xl bg-surface-container-low p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={cn('flex h-10 w-10 items-center justify-center rounded-full font-bold', review.tone)}>
                        {review.initials}
                      </span>
                      <div>
                        <h5 className="font-label-md text-label-md font-bold text-on-surface">{review.name}</h5>
                        {review.fresh ? (
                          <span className="font-label-sm text-label-sm text-on-surface-variant">{t('pdJustNow')}</span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Ms className="text-primary" name="verified" size={14} />
                            <span className="font-label-sm text-label-sm text-primary">{t('pdVerified')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <Ms name="more_horiz" size={20} />
                  </div>
                  <div className="flex gap-0.5 text-secondary">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Ms key={i} filled={i <= review.rating} name={i <= review.rating ? 'star' : 'star_border'} size={16} />
                    ))}
                  </div>
                  <p className="font-body-md text-body-md leading-relaxed text-on-surface-variant">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Frequently bought together */}
      {related.length > 0 && (
        <div className="mb-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider text-primary">{t('pdTogetherEyebrow')}</span>
              <h2 className="font-headline-md text-headline-md font-extrabold text-on-surface">{t('pdTogether')}</h2>
            </div>
            <Link className="flex items-center gap-1 font-label-md text-label-md font-bold text-primary hover:underline" to={`/catalog?category=${product.categoryId}`}>
              <span>{t('seeAll')}</span>
              <Ms name="arrow_forward" size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {related.map((item) => (
              <div key={item.id} className="group flex flex-col justify-between rounded-2xl bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md">
                <div>
                  <Link className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-surface-container-low p-3" to={`/product/${item.id}`}>
                    {item.img ? (
                      <img alt={item.name} className="h-full w-full object-contain transition-transform group-hover:scale-105" src={item.img} />
                    ) : (
                      <span className="text-5xl transition-transform group-hover:scale-110">{item.emoji}</span>
                    )}
                  </Link>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">{item.unit}</span>
                  <Link className="line-clamp-2 font-headline-sm text-headline-sm font-bold text-on-surface transition-colors group-hover:text-primary" to={`/product/${item.id}`}>
                    {item.name}
                  </Link>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2">
                  <div>
                    <span className="block font-price-sm text-price-sm font-extrabold text-on-surface">{formatUZS(item.price)}</span>
                    {item.oldPrice && (
                      <span className="font-body-sm text-body-sm text-outline line-through">{formatUZS(item.oldPrice)}</span>
                    )}
                  </div>
                  <button
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container text-primary shadow-sm transition-colors hover:bg-primary hover:text-on-primary"
                    onClick={() => addToCart(item.id)}
                    title={t('addToCart')}
                    type="button"
                  >
                    <Ms name="add" size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review form */}
      <Modal open={reviewOpen} onClose={() => setReviewOpen(false)} title={t('pdLeaveReview')} size="sm">
        <form className="space-y-4" onSubmit={submitReview}>
          <div>
            <span className="label">{t('pdYourRating')}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} className="text-secondary" onClick={() => setReviewRating(i)} type="button">
                  <Ms filled={i <= reviewRating} name={i <= reviewRating ? 'star' : 'star_border'} size={26} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label">{t('pdReviewComment')}</span>
            <textarea
              className="input min-h-[110px] resize-none"
              onChange={(event) => setReviewText(event.target.value)}
              placeholder={t('pdReviewPlaceholder')}
              value={reviewText}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary flex-1" onClick={() => setReviewOpen(false)} type="button">{t('cancel')}</button>
            <button className="btn-primary flex-1" type="submit">{t('pdSend')}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
