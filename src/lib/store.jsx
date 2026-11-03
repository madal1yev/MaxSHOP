import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18next from "../i18n";
import { defaultAddresses, getProduct } from "../data/mock";
import { localizeProduct } from "../data/productI18n";
import { getOrderTracking, statusElapsedMs } from "./tracking";
export const DELIVERY_FEE = 12e3;
export const FREE_DELIVERY_FROM = 15e4;
export const useShop = create()(
  persist(
    (set, get) => ({
      cart: [],
      orders: [],
      addresses: defaultAddresses,
      user: null,
      favorites: [],
      toasts: [],
      addToCart: (productId, qty = 1) => {
        const product = getProduct(productId);
        if (!product) return;
        const amount = Math.max(1, Number(qty) || 1);
        const cart = get().cart.map((item) => ({ ...item }));
        const existing = cart.find((c) => c.productId === productId);
        if (existing) existing.qty = Math.min(existing.qty + amount, product.stock);
        else cart.push({ productId, qty: Math.min(amount, product.stock) });
        set({ cart });
        get().pushToast(i18next.t("addedToCartNamed", { name: localizeProduct(product, i18next.language).name }), "success");
      },
      removeFromCart: (productId) => set({ cart: get().cart.filter((c) => c.productId !== productId) }),
      setQty: (productId, qty) => {
        const product = getProduct(productId);
        if (!product) return;
        if (qty <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set({ cart: get().cart.map((c) => c.productId === productId ? { ...c, qty: Math.min(qty, product.stock) } : c) });
      },
      clearCart: () => set({ cart: [] }),
      toggleFavorite: (productId) => {
        const has = get().favorites.includes(productId);
        set({ favorites: has ? get().favorites.filter((id) => id !== productId) : [...get().favorites, productId] });
        const product = getProduct(productId);
        if (product) get().pushToast(has ? i18next.t("removedFromFavorites") : i18next.t("addedToFavoritesNamed", { name: localizeProduct(product, i18next.language).name }), "success");
      },
      placeOrder: (input) => {
        const cart = get().cart;
        const items = cart.map((item) => {
          const product = getProduct(item.productId);
          if (!product) return null;
          const localized = localizeProduct(product, i18next.language);
          return {
            productId: product.id,
            name: localized.name,
            price: product.price,
            qty: item.qty,
            emoji: product.emoji,
            unit: localized.unit
          };
        }).filter(Boolean);
        const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const discount = 0;
        const isPickup = !!input.pickup;
        const delivery = isPickup || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
        const total = subtotal + delivery;
        const id = `MS-${Math.floor(20500 + Math.random() * 8e3)}`;
        const placedAt = Date.now();
        const order = {
          id,
          placedAt,
          statusHistory: [{ status: "confirmed", at: placedAt }],
          date: (/* @__PURE__ */ new Date()).toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" }),
          items,
          subtotal,
          delivery,
          discount,
          total,
          status: "confirmed",
          address: input.address,
          payment: input.payment,
          slot: input.slot,
          note: input.note ?? "",
          pickup: isPickup,
          shopName: isPickup ? input.shopName ?? "" : undefined,
          courier: isPickup ? null : "Jasur Toshmatov",
          courierPhone: isPickup ? null : "+998 90 123 45 67",
          courierRating: isPickup ? null : 4.9,
          eta: isPickup ? 20 : 35
        };
        set({ orders: [order, ...get().orders], cart: [] });
        return id;
      },
      // Moves every non-cancelled order to the stage that matches its age.
      // Called on an interval by the layout so tracking stays live everywhere.
      syncOrders: () => {
        const now = Date.now();
        let changed = false;
        const orders = get().orders.map((order) => {
          if (!order || order.status === "cancelled") return order;
          let placedAt = Number(order.placedAt);
          let healed = false;
          if (!Number.isFinite(placedAt) || placedAt <= 0) {
            // Orders saved before live tracking existed get a sensible start
            // point instead of jumping straight to "delivered".
            if (order.status === "delivered") return order;
            placedAt = now - statusElapsedMs(order.status);
            healed = true;
          }
          const tracking = getOrderTracking({ ...order, placedAt }, now);
          if (tracking.status === order.status) {
            if (!healed) return order;
            changed = true;
            return { ...order, placedAt };
          }
          changed = true;
          const at = tracking.steps[tracking.index]?.at ?? now;
          return {
            ...order,
            placedAt,
            status: tracking.status,
            statusHistory: [
              ...(order.statusHistory ?? []),
              { status: tracking.status, at }
            ]
          };
        });
        if (changed) set({ orders });
      },
      cancelOrder: (id) => {
        const order = get().orders.find((o) => o.id === id);
        if (!order || ["delivered", "cancelled"].includes(order.status)) return false;
        const now = Date.now();
        set({
          orders: get().orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status: "cancelled",
                  cancelledAt: now,
                  statusHistory: [
                    ...(o.statusHistory ?? []),
                    { status: "cancelled", at: now }
                  ]
                }
              : o
          )
        });
        get().pushToast(i18next.t("trackingCancelSuccess"), "info");
        return true;
      },
      rateCourier: (id, rating) => {
        const value = Math.min(5, Math.max(1, Math.round(Number(rating) || 0)));
        set({
          orders: get().orders.map((o) =>
            o.id === id ? { ...o, rating: value, ratedAt: Date.now() } : o
          )
        });
        get().pushToast(i18next.t("trackingRateThanks"), "success");
      },
      addAddress: (address) => {
        const list = get().addresses;
        const newAddress = { ...address, id: `a${Date.now()}`, isDefault: list.length === 0 || address.isDefault };
        set({ addresses: newAddress.isDefault ? [...list.map((a) => ({ ...a, isDefault: false })), newAddress] : [...list, newAddress] });
        get().pushToast(i18next.t("addressAdded"), "success");
      },
      removeAddress: (id) => {
        const list = get().addresses.filter((a) => a.id !== id);
        if (list.length && !list.some((a) => a.isDefault)) list[0].isDefault = true;
        set({ addresses: list });
        get().pushToast(i18next.t("addressRemoved"), "info");
      },
      setDefaultAddress: (id) => {
        set({ addresses: get().addresses.map((a) => ({ ...a, isDefault: a.id === id })) });
      },
      login: (phone, name = "Aziz Karimov") => {
        set({ user: { name, phone, email: `${phone.replace(/\D/g, "").slice(-9)}@maxshop.uz` } });
        get().pushToast(i18next.t("welcomeUser", { name: name.split(" ")[0] }), "success");
      },
      register: (name, phone, email) => {
        set({ user: { name, phone, email } });
        get().pushToast(i18next.t("accountCreated"), "success");
      },
      updateUser: (patch) => {
        const current = get().user;
        if (!current) return;
        set({ user: { ...current, ...patch } });
        get().pushToast(i18next.t("profileUpdated"), "success");
      },
      logout: () => {
        set({ user: null });
        get().pushToast(i18next.t("loggedOut"), "info");
      },
      pushToast: (message, type = "success") => {
        const id = Date.now() + Math.random();
        set({ toasts: [...get().toasts, { id, message, type }] });
        setTimeout(() => get().dismissToast(id), 3200);
      },
      dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) })
    }),
    {
      name: "maxshop-web-v2",
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
        addresses: state.addresses,
        user: state.user,
        favorites: state.favorites
      })
    }
  )
);
export const cartDetails = (cart) => {
  const subtotal = cart.reduce((sum, item) => {
    const product = getProduct(item.productId);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  return { subtotal, delivery, total: subtotal + delivery };
};
export const cartCount = (cart) => cart.reduce((sum, item) => sum + item.qty, 0);
export const productById = (id) => getProduct(id);
