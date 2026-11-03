import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { HomeHeader } from './HomeHeader';
import { HomeFooter } from './HomeFooter';
import { Toaster } from '../lib/ui';
import { useShop } from '../lib/store';

export const Layout = () => {
  const { pathname, search } = useLocation();
  const activeCategoryId = new URLSearchParams(search).get('category') ?? undefined;
  const syncOrders = useShop((state) => state.syncOrders);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  // Keep active orders moving through their delivery stages app-wide.
  useEffect(() => {
    syncOrders();
    const timer = window.setInterval(syncOrders, 1000);
    return () => window.clearInterval(timer);
  }, [syncOrders]);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <HomeHeader activeCategoryId={activeCategoryId} />
      <main className="min-h-[calc(100vh-156px)] w-full flex-1 bg-surface pt-[156px] font-body-md text-body-md text-on-surface">
        <Outlet />
      </main>
      <HomeFooter />
      <Toaster />
    </div>
  );
};
