import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { categories } from '../data/mock';
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

const isOrganic = (product) =>
  (product.tags ?? []).some((tag) => /organik|bio|eko|eco/i.test(tag));
const isExpress = (product) =>
  (product.badges ?? []).some((badge) => badge.express) || (product.tags ?? []).includes('Tezkor');

export const FilterSidebar = ({ products, value, onChange, onReset, resultCount }) => {
  const { t } = useTranslation();

  const counts = useMemo(() => {
    const byCategory = {};
    let discounted = 0;
    let organic = 0;
    let express = 0;
    const origins = {};
    products.forEach((product) => {
      byCategory[product.categoryId] = (byCategory[product.categoryId] ?? 0) + 1;
      if (product.oldPrice) discounted += 1;
      if (isOrganic(product)) organic += 1;
      if (isExpress(product)) express += 1;
      if (product.origin) origins[product.origin] = (origins[product.origin] ?? 0) + 1;
    });
    return { byCategory, discounted, organic, express, origins };
  }, [products]);

  const selectedCount =
    (value.category ? 1 : 0) +
    (value.discount ? 1 : 0) +
    (value.organic ? 1 : 0) +
    (value.express ? 1 : 0);

  const features = [
    {
      key: 'discount',
      icon: 'percent',
      iconClass: 'text-tertiary',
      label: t('discountedOnly'),
      count: counts.discounted,
    },
    {
      key: 'organic',
      icon: 'eco',
      iconClass: 'text-primary',
      label: t('organic'),
      count: counts.organic,
    },
  ];

  return (
    <aside className="space-y-4 lg:col-span-3 lg:sticky lg:top-[170px]">
      <div className="space-y-6 rounded-xl bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm font-extrabold text-on-surface">
            <Ms className="text-primary" name="tune" size={20} />
            {t('filters')}
          </h2>
          {selectedCount > 0 && (
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {selectedCount} {t('selectedCount')}
            </span>
          )}
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <span className="block font-label-md text-label-md uppercase tracking-wider text-outline">{t('categories')}</span>
          <div className="space-y-1.5">
            <button
              className={
                !value.category
                  ? 'flex w-full items-center justify-between rounded-lg bg-primary/10 px-2.5 py-2 text-left font-label-md text-label-md font-bold text-primary'
                  : 'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left font-body-md text-body-md text-on-surface-variant transition-colors hover:bg-surface-container'
              }
              onClick={() => onChange({ category: null })}
              type="button"
            >
              <span className="flex items-center gap-2">
                <Ms className={!value.category ? '' : 'text-outline'} name="apps" size={16} />
                {t('allProducts')}
              </span>
              <span className="text-xs text-outline">{products.length}</span>
            </button>
            {categories.map((category) => {
              const active = value.category === category.id;
              const count = counts.byCategory[category.id] ?? 0;
              return (
                <button
                  key={category.id}
                  className={
                    active
                      ? 'flex w-full items-center justify-between rounded-lg bg-primary/10 px-2.5 py-2 text-left font-label-md text-label-md font-bold text-primary'
                      : 'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left font-body-md text-body-md text-on-surface-variant transition-colors hover:bg-surface-container'
                  }
                  onClick={() => onChange({ category: active ? null : category.id })}
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <Ms className={active ? '' : 'text-outline'} name="label" size={16} />
                    {t(CATEGORY_KEYS[category.id])}
                  </span>
                  {active ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-on-primary">{count}</span>
                  ) : (
                    <span className="text-xs text-outline">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Special features */}
        <div className="space-y-3 border-t pt-4">
          <span className="block font-label-md text-label-md uppercase tracking-wider text-outline">{t('specialFeatures')}</span>
          <div className="space-y-1">
            {features.map((feature) => {
              const checked = !!value[feature.key];
              return (
                <label
                  key={feature.key}
                  className={`group flex items-center justify-between rounded-lg p-2 transition-colors ${
                    feature.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-surface-container'
                  }`}
                  title={feature.disabled ? t('appComingSoon') : undefined}
                >
                  <span className="flex items-center gap-3">
                    <input
                      checked={checked}
                      className="h-4 w-4 accent-primary"
                      disabled={feature.disabled}
                      onChange={(event) => onChange({ [feature.key]: event.target.checked ? true : null })}
                      type="checkbox"
                    />
                    <span className="flex items-center gap-1.5 font-body-md text-body-md text-on-surface">
                      <Ms className={feature.iconClass} name={feature.icon} size={18} />
                      {feature.label}
                    </span>
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">{feature.count}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* CTAs */}
        <div className="space-y-2 border-t pt-4">
          <button
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary py-3 font-label-md text-label-md font-bold text-on-primary shadow-sm transition-all hover:bg-primary-container active:scale-95"
            onClick={() => document.getElementById('catalog-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            type="button"
          >
            <Ms name="check" size={18} />
            <span>
              {t('showResults')} ({resultCount})
            </span>
          </button>
          <button
            className="w-full cursor-pointer rounded-xl bg-surface-container py-2.5 font-label-md text-label-md text-on-surface-variant transition-all hover:bg-surface-container-high"
            onClick={onReset}
            type="button"
          >
            {t('resetAll')}
          </button>
        </div>
      </div>

    </aside>
  );
};
