import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { FilterSidebar } from '../components/FilterSidebar';
import { CatalogProductCard } from '../components/CatalogProductCard';
import { BackButton } from '../components/BackButton';
import { Ms } from '../components/Ms';
import { catalogProducts } from '../data/displayProducts';
import { baseProducts } from '../data/mock';
import { localizeProducts } from '../data/productI18n';

const CATALOG_PRODUCTS = [...baseProducts, ...catalogProducts];
const PAGE_SIZE = 12;

const POPULAR_CHIPS = {
  uz: ['Banan', 'Pomidor', 'Qulupnay', 'Apelsin', 'Avokado', 'Bodring'],
  ru: ['Бананы', 'Помидоры', 'Клубника', 'Апельсины', 'Авокадо', 'Огурцы'],
  en: ['Bananas', 'Tomatoes', 'Strawberries', 'Oranges', 'Avocado', 'Cucumbers'],
};

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

const isOrganic = (product) => (product.tags ?? []).some((tag) => /organik|bio|eko|eco|органик|био|эко/i.test(tag));
const isExpress = (product) => (product.badges ?? []).some((badge) => badge.express) || (product.tags ?? []).includes('Tezkor');

const SORT_OPTIONS = [
  { value: 'popular', label: 'sortPopular' },
  { value: 'price-asc', label: 'priceLowHigh' },
  { value: 'price-desc', label: 'priceHighLow' },
  { value: 'rating', label: 'sortRating' },
  { value: 'discount', label: 'discount' },
];

export const Catalog = () => {
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();
  const localizedProducts = useMemo(
    () => localizeProducts(CATALOG_PRODUCTS, i18n.language),
    [i18n.language],
  );
  const chips = POPULAR_CHIPS[i18n.language] ?? POPULAR_CHIPS.uz;

  const query = (params.get('q') ?? '').trim();
  const category = params.get('category') ?? '';
  const discount = params.get('discount') === '1';
  const organic = params.get('organic') === '1';
  const express = params.get('express') === '1';
  const origin = params.get('origin') ?? '';
  const sort = params.get('sort') ?? 'popular';
  const page = Math.max(1, Number(params.get('page')) || 1);

  const filtered = localizedProducts.filter((product) => {
    const haystack = `${product.name} ${product.origin ?? ''} ${product.unit} ${(product.tags ?? []).join(' ')}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (category && product.categoryId !== category) return false;
    if (discount && !product.oldPrice) return false;
    if (organic && !isOrganic(product)) return false;
    if (express && !isExpress(product)) return false;
    if (origin && product.origin !== origin) return false;
    return true;
  });

  const list = [...filtered];
  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
  else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
  else if (sort === 'discount') {
    list.sort((a, b) => (b.oldPrice ? b.oldPrice - b.price : 0) - (a.oldPrice ? a.oldPrice - a.price : 0));
  }

  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = list.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const title = query
    ? `${t('searchResults')}: "${query}"`
    : category
      ? t(CATEGORY_KEYS[category] ?? 'allProducts')
      : t('allProducts');

  const setParam = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '' || value === false) next.delete(key);
      else next.set(key, String(value));
    });
    next.delete('page');
    setParams(next);
  };

  const goPage = (target) => {
    const next = new URLSearchParams(params);
    if (target <= 1) next.delete('page');
    else next.set('page', String(target));
    setParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    setParams(next);
  };

  const filters = {
    category,
    discount,
    organic,
    express,
    origin,
  };

  const pageNumbers = (() => {
    const pages = [];
    const from = Math.max(1, Math.min(safePage - 2, totalPages - 4));
    const to = Math.min(totalPages, from + 4);
    for (let i = from; i <= to; i += 1) pages.push(i);
    return pages;
  })();

  return (
    <div className="mx-auto w-full max-w-7xl px-gutter py-6">
          {/* Back + breadcrumbs */}
          <div className="mb-6 flex flex-col justify-between gap-space-md md:flex-row md:items-center">
            <div className="flex flex-col gap-2">
              <BackButton className="w-fit" />
              <nav className="flex flex-wrap items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
                <Link className="flex items-center gap-1 transition-colors hover:text-primary" to="/">
                  <Ms name="home" size={16} />
                  <span>{t('home')}</span>
                </Link>
                <Ms className="text-outline" name="chevron_right" size={14} />
                <Link className="transition-colors hover:text-primary" to="/catalog">
                  {t('catalog')}
                </Link>
                <Ms className="text-outline" name="chevron_right" size={14} />
                <span className="font-semibold text-on-surface">{title}</span>
              </nav>
              <div className="mt-1 flex flex-wrap items-baseline gap-3">
                <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">{title}</h1>
                <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-label-md text-label-md font-bold text-primary">
                  {list.length} {t('productsCount')}
                </span>
              </div>
            </div>
          </div>

          {/* Chips strip */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-space-md rounded-xl bg-surface-container-lowest p-3 shadow-sm">
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto py-1">
              <span className="whitespace-nowrap pl-1 font-label-sm text-label-sm uppercase tracking-wider text-outline">
                {t('popularChips')}
              </span>
              {chips.map((label, i) => (
                <button
                  key={label}
                  className={`flex cursor-pointer items-center whitespace-nowrap rounded-full px-3 py-1.5 font-label-md text-label-md transition-all ${
                    query.toLowerCase() === label.toLowerCase()
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface hover:bg-primary/10 hover:text-primary'
                  } ${i === 0 ? 'gap-1.5' : 'gap-1'}`}
                  onClick={() => setParams({ q: label })}
                  type="button"
                >
                  {i === 0 && <Ms className="text-tertiary" name="trending_up" size={14} />}
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 font-label-sm text-label-sm transition-colors ${
                  discount
                    ? 'bg-tertiary text-on-tertiary'
                    : 'bg-primary-fixed/40 text-on-primary-fixed-variant hover:bg-primary-fixed/60'
                }`}
                onClick={() => setParam({ discount: discount ? null : '1' })}
                type="button"
              >
                <span>{t('discountChip')}</span>
                <Ms name={discount ? 'close' : 'add'} size={14} />
              </button>
              <button
                className="flex cursor-pointer items-center gap-1 pl-2 font-label-sm text-label-sm text-tertiary transition-colors hover:text-tertiary-container"
                onClick={resetFilters}
                type="button"
              >
                <Ms name="refresh" size={14} />
                <span>{t('resetAll')}</span>
              </button>
            </div>
          </div>

          {/* Sidebar + grid */}
          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            <FilterSidebar
              products={localizedProducts}
              value={filters}
              onChange={setParam}
              onReset={resetFilters}
              resultCount={list.length}
            />

            <section className="space-y-6 lg:col-span-9" id="catalog-results">
              {/* Control bar */}
              <div className="flex flex-col justify-between gap-4 rounded-xl bg-surface-container-lowest p-3 shadow-sm sm:flex-row sm:items-center">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Ms className="text-outline" name="sort" size={18} />
                    <span className="font-label-md text-label-md text-on-surface-variant">{t('sortBy')}:</span>
                  </div>
                  <div className="relative inline-block">
                    <select
                      className="cursor-pointer appearance-none rounded-lg bg-surface-container py-2 pl-3.5 pr-8 font-label-md text-label-md font-bold text-on-surface outline-none"
                      onChange={(event) => setParam({ sort: event.target.value === 'popular' ? null : event.target.value })}
                      value={sort}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {t(option.label)}
                        </option>
                      ))}
                    </select>
                    <Ms className="pointer-events-none absolute right-2 top-2.5 text-on-surface" name="expand_more" size={16} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-label-md text-label-md font-bold transition-colors ${
                      express
                        ? 'bg-secondary text-white'
                        : 'bg-secondary-fixed/50 text-on-secondary-fixed hover:bg-secondary-fixed'
                    }`}
                    onClick={() => setParam({ express: express ? null : '1' })}
                    type="button"
                  >
                    <Ms className={express ? 'text-white' : 'text-secondary'} name="bolt" size={16} />
                    <span>{t('only25')}</span>
                  </button>
                </div>
              </div>

              {/* Product grid */}
              {pageItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {pageItems.map((product) => (
                    <CatalogProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl bg-surface-container-lowest p-10 text-center shadow-sm">
                  <Ms className="text-outline" name="search_off" size={36} />
                  <h3 className="mt-3 font-headline-sm text-headline-sm font-bold text-on-surface">{t('searchEmpty')}</h3>
                  <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">{t('searchEmptyDesc')}</p>
                  <button
                    className="mt-4 rounded-xl bg-primary px-5 py-2.5 font-label-md text-label-md font-bold text-on-primary transition-colors hover:bg-primary-container"
                    onClick={resetFilters}
                    type="button"
                  >
                    {t('resetAll')}
                  </button>
                </div>
              )}

              {/* Pagination */}
              <div className="mt-8 flex flex-col items-center gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-sm">
                <div className="flex w-full flex-wrap items-center justify-between gap-3">
                  <button
                    className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 font-label-md text-label-md font-bold text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:text-outline disabled:opacity-50"
                    disabled={safePage <= 1}
                    onClick={() => goPage(safePage - 1)}
                    type="button"
                  >
                    <Ms name="arrow_back" size={18} />
                    <span>{t('prevPage')}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    {pageNumbers.map((number) => (
                      <button
                        key={number}
                        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl font-label-md text-label-md transition-colors ${
                          number === safePage
                            ? 'bg-primary font-extrabold text-on-primary shadow-xs'
                            : 'bg-surface-container font-semibold text-on-surface hover:bg-surface-container-high'
                        }`}
                        onClick={() => goPage(number)}
                        type="button"
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                  <button
                    className="flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 font-label-md text-label-md font-bold text-primary transition-colors hover:bg-surface-container disabled:cursor-not-allowed disabled:text-outline disabled:opacity-50"
                    disabled={safePage >= totalPages}
                    onClick={() => goPage(safePage + 1)}
                    type="button"
                  >
                    <span>{t('nextPage')}</span>
                    <Ms name="arrow_forward" size={18} />
                  </button>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  {t('showingProducts')} {pageItems.length} / {list.length}
                </p>
              </div>

              {/* SEO info */}
              <div className="space-y-2 rounded-xl bg-surface-container-low p-5 text-on-surface">
                <h4 className="flex items-center gap-2 font-headline-sm text-headline-sm font-bold text-on-surface">
                  <Ms className="text-primary" name="local_shipping" size={20} />
                  {t('seoTitle')}
                </h4>
                <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{t('seoText')}</p>
              </div>
            </section>
          </div>
    </div>
  );
};
