import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BadgeCheck, Percent, Sparkles } from 'lucide-react';
import { products } from '../data/mock';
import { ProductCard, SectionHeader } from '../lib/ui';

export const PromotionsPage = () => {
  const { t } = useTranslation();
  const discounted = products.filter((p) => p.oldPrice);

  return (
    <div className="container-page py-5 sm:py-7">
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 px-5 py-8 text-white sm:px-8 sm:py-10">
        <div className="relative z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[10px] font-extrabold backdrop-blur">
            <Sparkles size={12} /> {t('specialOffers')}
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{t('promotionsTitle')}</h1>
          <p className="mt-2 text-sm text-white/85">{t('promotionsSubtitle')}</p>
        </div>
        <span className="absolute -bottom-8 right-2 text-[8rem] opacity-30 sm:text-[10rem]">%</span>
      </div>

      <div className="mt-9">
        <SectionHeader
          eyebrow="−25%"
          title={t('specialOffers')}
          subtitle={t('specialOffersSubtitle')}
          to="/catalog?discount=1"
          linkLabel={t('seeAll')}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {discounted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {[
          { icon: Percent, title: t('bestPricesTitle'), desc: t('bestPrices') },
          { icon: BadgeCheck, title: t('freshQualityTitle'), desc: t('freshQualityDesc') },
        ].map((b) => (
          <div key={b.title} className="card flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <b.icon size={18} />
            </span>
            <div>
              <p className="text-xs font-extrabold">{b.title}</p>
              <p className="mt-0.5 text-[10px] text-[var(--muted)]">{b.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link to="/catalog" className="btn-primary">
          {t('heroCta')} <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};
