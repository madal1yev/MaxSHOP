import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, Phone } from 'lucide-react';
import { shopLocations } from '../data/mock';
import { useShop } from '../lib/store';
import { Ms } from './Ms';

const PAYMENT_METHODS = ['Payme', 'Click', 'Uzum Nasia', 'Uzcard', 'Humo', 'Visa', 'Mastercard'];

export const HomeFooter = () => {
  const { t } = useTranslation();
  const { pushToast } = useShop();

  return (
    <footer className="mt-space-xl w-full bg-surface-container-low text-on-surface shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="mx-auto max-w-7xl px-gutter py-12">
        <div className="mb-8 grid grid-cols-1 gap-space-lg sm:grid-cols-2">
          <div className="space-y-space-md">
            <Link className="flex items-center gap-space-xs" to="/">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary">
                <Ms name="eco" size={22} />
              </div>
              <span className="font-headline-sm text-headline-sm font-extrabold text-primary">
                Max<span className="text-secondary-container">Shop</span>
              </span>
            </Link>
            <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">{t('footerTextK')}</p>
            <div className="flex items-center gap-space-sm">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary"
                onClick={() => pushToast(t('appComingSoon'), 'info')}
                title="Telegram"
                type="button"
              >
                <Ms name="send" size={17} />
              </button>
              <a
                aria-label={t('call')}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary"
                href="tel:+998781401414"
                title="+998 78 140 14 14"
              >
                <Phone size={17} />
              </a>
              <a
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-on-surface-variant transition-colors hover:bg-primary hover:text-on-primary"
                href="https://www.instagram.com/maxshop.uz"
                rel="noreferrer"
                target="_blank"
                title="Instagram"
              >
                <Instagram size={17} />
              </a>
            </div>
          </div>

          <div className="space-y-space-sm">
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('footerContact')}</h4>
            <div className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
              <div className="flex items-center gap-space-xs">
                <Ms className="text-primary" name="call" size={18} />
                <a className="font-price-sm text-price-sm font-bold text-on-surface hover:text-primary" href="tel:+998781401414">
                  +998 78 140 14 14
                </a>
              </div>
              <div className="flex items-center gap-space-xs pt-1">
                <Ms className="text-primary" name="mail" size={18} />
                <a className="font-body-sm text-body-sm hover:text-primary" href="mailto:info@maxshop.uz">
                  info@maxshop.uz
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Addresses at the very bottom */}
        <div className="rounded-xl bg-surface-container-lowest p-4 sm:p-5">
          <div className="flex items-center gap-space-xs">
            <Ms className="text-primary" name="location_on" size={20} />
            <h4 className="font-headline-sm text-headline-sm font-bold text-on-surface">{t('shopsTitle')}</h4>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {shopLocations.map((shop) => (
              <div key={shop.id} className="rounded-lg bg-surface-container-low p-3">
                <p className="font-label-md text-label-md font-extrabold text-on-surface">{shop.name}</p>
                <p className="mt-1 font-body-sm text-body-sm leading-snug text-on-surface-variant">{shop.address}</p>
                <p className="mt-1.5 flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
                  <Ms name="schedule" size={14} /> {shop.hours}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="my-6 h-px w-full bg-surface-container-highest/50"></div>
        <div className="flex flex-col items-start justify-between gap-4 font-body-sm text-body-sm text-on-surface-variant lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-2 sm:gap-space-md">
            <span className="font-label-md text-label-md font-bold text-on-surface">{t('footerPayment')}</span>
            {PAYMENT_METHODS.map((method) => (
              <span key={method} className="rounded bg-surface-container-lowest px-2 py-1 font-label-sm text-label-sm font-bold text-on-surface">
                {method}
              </span>
            ))}
          </div>
          <div className="font-body-sm text-body-sm text-on-surface-variant">{t('footerCopyright')}</div>
        </div>
      </div>
    </footer>
  );
};
