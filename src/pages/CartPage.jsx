import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cartDetails, useShop } from '../lib/store';
import { formatPrice, formatUZS, getCategory, getProduct, products, deliverySlots, localizeAddress, localizeCategory, localizeSlot, shopLocations } from '../data/mock';
import { localizeProduct } from '../data/productI18n';
import { EmptyState, ProductCard, cn } from '../lib/ui';
import { Ms } from '../components/Ms';

const PAYMENTS = [
  { id: 'payme', name: 'Payme', desc: 'paymeDesc', icon: 'account_balance_wallet', color: 'text-[#00cccc]' },
  { id: 'click', name: 'Click', desc: 'clickDesc', icon: 'bolt', color: 'text-[#0073ff]' },
  { id: 'uzum', name: 'Uzum Pay', desc: 'uzumDesc', icon: 'savings', color: 'text-[#7b2cbf]' },
  { id: 'cash', name: 'cash', desc: 'paymentCashDesc', icon: 'payments', color: 'text-on-surface' },
];

export const CartPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const {
    cart,
    setQty,
    removeFromCart,
    clearCart,
    addresses,
    addAddress,
    placeOrder,
    pushToast,
  } = useShop();

  const { subtotal, delivery } = cartDetails(cart);

  const defaultAddressId = (addresses.find((a) => a.isDefault) ?? addresses[0])?.id ?? '';
  const [method, setMethod] = useState('delivery');
  const [pickupId, setPickupId] = useState(shopLocations[0].id);
  const [selectedAddress, setSelectedAddress] = useState(defaultAddressId);
  const [slot, setSlot] = useState(deliverySlots[0]);
  const [payment, setPayment] = useState('payme');
  const [note, setNote] = useState('');
  const [addressOpen, setAddressOpen] = useState(false);
  const [newLabel, setNewLabel] = useState(t('addressPlaceholder'));
  const [newAddress, setNewAddress] = useState('');
  const [newDetails, setNewDetails] = useState('');

  const chosenAddress = addresses.find((a) => a.id === selectedAddress) ?? addresses[0];
  const chosenShop = shopLocations.find((shop) => shop.id === pickupId) ?? shopLocations[0];
  const isPickup = method === 'pickup';
  const payableDelivery = isPickup ? 0 : delivery;
  const payableTotal = subtotal + payableDelivery;
  const slotOptions = deliverySlots.slice(0, 2).map((value) => ({
    id: value,
    title: method === 'pickup' ? t('pickupTime') : t('deliverySlot'),
    value: localizeSlot(value),
    note: t('plannedTime'),
    icon: 'schedule',
  }));
  const chosenSlot = slotOptions.find((option) => option.id === slot) ?? slotOptions[0];

  const recommended = products.filter((p) => !cart.some((c) => c.productId === p.id)).slice(0, 4);

  const saveAddress = () => {
    if (!newAddress.trim()) {
      pushToast(t('addressLabel'), 'error');
      return;
    }
    addAddress({ label: newLabel || t('addressPlaceholder'), address: newAddress, details: newDetails, isDefault: addresses.length === 0 });
    setNewAddress('');
    setNewDetails('');
    setAddressOpen(false);
  };

  const submitOrder = () => {
    if (!isPickup && !chosenAddress) {
      pushToast(t('deliveryAddress'), 'error');
      return;
    }
    const paymentLabel =
      payment === 'cash' ? t('cash') : PAYMENTS.find((p) => p.id === payment)?.name ?? t('card');
    const id = placeOrder({
      pickup: isPickup,
      shopName: isPickup ? chosenShop.name : undefined,
      address: isPickup
        ? `${chosenShop.name}, ${chosenShop.address}`
        : `${chosenAddress.address}${chosenAddress.details ? `, ${chosenAddress.details}` : ''}`,
      payment: paymentLabel,
      slot: chosenSlot.id,
      note,
    });
    pushToast(t('orderPlaced'), 'success');
    navigate(`/order-success/${id}`);
  };

  if (cart.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-gutter py-10 sm:py-16">
        <EmptyState
          icon={<Ms name="shopping_bag" size={30} />}
          title={t('emptyCartTitle')}
          description={t('emptyCartDesc')}
          action={
            <Link className="btn-primary btn-sm" to="/catalog">
              {t('emptyCartBtn')} <Ms name="arrow_forward" size={14} />
            </Link>
          }
        />
        <div className="mt-10">
          <h2 className="mb-4 font-headline-md text-headline-md font-bold text-on-surface">{t('recommended')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {recommended.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-gutter py-6">
      {/* Heading */}
      <div className="mb-6 flex flex-col justify-between gap-space-md md:flex-row md:items-end">
        <div className="space-y-1">
          <nav className="flex flex-wrap items-center gap-2 font-label-sm text-label-sm text-on-surface-variant">
            <Link className="transition-colors hover:text-primary" to="/">{t('home')}</Link>
            <span>/</span>
            <Link className="transition-colors hover:text-primary" to="/cart">{t('cartTitle')}</Link>
            <span>/</span>
            <span className="font-semibold text-on-surface">{t('checkoutTitle')}</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
            {t('cartCheckoutTitle')}
            <span className="ml-2 font-headline-sm text-headline-sm font-bold text-primary">
              ({cart.length} {t('itemsCount')})
            </span>
          </h1>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container hover:text-tertiary"
          onClick={clearCart}
          type="button"
        >
          <Ms name="delete_sweep" size={18} />
          <span>{t('clearCart')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* LEFT */}
        <div className="space-y-6 lg:col-span-8">
          {/* Items */}
          <div className="overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between bg-surface-container-low/50 p-space-lg">
              <div className="flex items-center gap-space-sm">
                <Ms className="text-primary" name="shopping_basket" size={22} />
                <h2 className="font-headline-md text-headline-md text-on-surface">{t('selectedItems')}</h2>
              </div>
              <span className="font-label-md text-label-md text-on-surface-variant">
                {cart.length} {t('itemsCount')}
              </span>
            </div>
            <div className="divide-y divide-surface-container">
              {cart.map((item) => {
                const rawProduct = getProduct(item.productId);
                if (!rawProduct) return null;
                const product = localizeProduct(rawProduct, i18n.language);
                const category = localizeCategory(getCategory(product.categoryId));
                return (
                  <div
                    key={item.productId}
                    className="flex flex-col justify-between gap-space-md p-space-lg transition-colors hover:bg-surface-container-low/30 sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-space-md">
                      <Link
                        className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container p-2"
                        to={`/product/${product.id}`}
                      >
                        {product.img ? (
                          <img alt={product.name} className="h-full w-full object-contain" src={product.img} />
                        ) : (
                          <span className="text-3xl">{product.emoji}</span>
                        )}
                      </Link>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-secondary-fixed/50 px-2 py-0.5 font-label-sm text-[10px] font-bold uppercase text-on-secondary-fixed">
                            {category?.name ?? t('catalog')}
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant">{product.unit}</span>
                        </div>
                        <Link
                          className="block truncate font-headline-sm text-headline-sm text-on-surface transition-colors hover:text-primary"
                          to={`/product/${product.id}`}
                        >
                          {product.name}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="font-price-sm text-price-sm text-on-surface">{formatUZS(product.price)}</span>
                          {product.oldPrice && (
                            <span className="font-body-sm text-body-sm text-outline line-through">
                              {formatUZS(product.oldPrice)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-space-lg sm:justify-end">
                      <div className="flex items-center gap-2 rounded-xl bg-surface-container p-1">
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface shadow-sm transition-colors hover:bg-primary hover:text-on-primary"
                          onClick={() => setQty(item.productId, item.qty - 1)}
                          type="button"
                        >
                          <Ms name="remove" size={16} />
                        </button>
                        <span className="min-w-6 px-2 text-center font-price-sm text-price-sm text-on-surface">{item.qty}</span>
                        <button
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-lowest text-on-surface shadow-sm transition-colors hover:bg-primary hover:text-on-primary"
                          onClick={() => setQty(item.productId, item.qty + 1)}
                          type="button"
                        >
                          <Ms name="add" size={16} />
                        </button>
                      </div>
                      <div className="min-w-[100px] text-right">
                        <span className="block font-price-lg text-price-lg font-extrabold text-on-surface">
                          {formatUZS(product.price * item.qty)}
                        </span>
                      </div>
                      <button
                        className="rounded-lg p-1.5 text-outline transition-colors hover:bg-surface-container hover:text-tertiary"
                        onClick={() => removeFromCart(item.productId)}
                        title={t('removeFromFavorites')}
                        type="button"
                      >
                        <Ms name="close" size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4 rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <Ms className="text-primary" name="pin_drop" size={22} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {isPickup ? t('pickupTitle') : t('deliveryAddress')}
                </h3>
              </div>
              {!isPickup && (
                <button
                  className="flex items-center gap-1 font-label-md text-label-md font-bold text-primary transition-colors hover:text-primary-container"
                  onClick={() => setAddressOpen((value) => !value)}
                  type="button"
                >
                  <Ms name="add_circle" size={18} />
                  <span>{t('changeAddress')}</span>
                </button>
              )}
            </div>

            {/* Delivery method */}
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-surface-container p-1.5">
              {[
                { id: 'delivery', icon: 'local_shipping', label: t('deliveryToAddress') },
                { id: 'pickup', icon: 'storefront', label: t('pickup') },
              ].map((option) => (
                <button
                  key={option.id}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-label-md text-label-md transition-all',
                    method === option.id
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface',
                  )}
                  onClick={() => setMethod(option.id)}
                  type="button"
                >
                  <Ms name={option.icon} size={18} />
                  <span className="font-bold">{option.label}</span>
                </button>
              ))}
            </div>

            {isPickup && (
              <>
                <p className="-mt-1 font-body-sm text-body-sm text-on-surface-variant">{t('pickupSubtitle')}</p>
                <div className="space-y-2">
                  {shopLocations.map((shop) => (
                    <label
                      key={shop.id}
                      className={cn(
                        'flex cursor-pointer flex-col justify-between gap-space-md rounded-xl p-space-md transition-colors sm:flex-row sm:items-center',
                        pickupId === shop.id ? 'bg-primary/10 ring-1 ring-primary/40' : 'bg-surface-container-low hover:bg-surface-container',
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-primary shadow-sm">
                          <Ms name="storefront" size={22} />
                        </span>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-label-md text-label-md font-bold text-on-surface">{shop.name}</span>
                            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-label-sm text-[10px] font-bold text-primary">
                              {t('free')}
                            </span>
                          </div>
                          <p className="font-body-md text-body-md font-semibold text-on-surface">{shop.address}</p>
                          <p className="flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
                            <Ms name="schedule" size={14} /> {t('shopOpenDaily')} {shop.hours}
                          </p>
                        </div>
                      </div>
                      <input
                        checked={pickupId === shop.id}
                        className="h-5 w-5 shrink-0 cursor-pointer self-start accent-primary sm:self-auto"
                        name="pickup"
                        onChange={() => setPickupId(shop.id)}
                        type="radio"
                      />
                    </label>
                  ))}
                </div>
              </>
            )}

            {!isPickup && (
            <>
            <div className="space-y-2">
              {addresses.map((address) => (
                <label
                  key={address.id}
                  className={cn(
                    'flex cursor-pointer flex-col justify-between gap-space-md rounded-xl p-space-md transition-colors sm:flex-row sm:items-center',
                    selectedAddress === address.id ? 'bg-primary/10' : 'bg-surface-container-low hover:bg-surface-container',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-primary shadow-sm">
                      <Ms name="home" size={22} />
                    </span>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-label-md text-label-md font-bold text-on-surface">{localizeAddress(address).label}</span>
                        {address.isDefault && (
                          <span className="rounded-full bg-primary px-2 py-0.5 font-label-sm text-[10px] font-bold text-on-primary">
                            {t('mainAddress')}
                          </span>
                        )}
                      </div>
                      <p className="font-body-md text-body-md font-semibold text-on-surface">{localizeAddress(address).address}</p>
                      {address.details && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{localizeAddress(address).details}</p>
                      )}
                    </div>
                  </div>
                  <input
                    checked={selectedAddress === address.id}
                    className="h-5 w-5 shrink-0 cursor-pointer self-start accent-primary sm:self-auto"
                    name="address"
                    onChange={() => setSelectedAddress(address.id)}
                    type="radio"
                  />
                </label>
              ))}
            </div>

            {addressOpen && (
              <div className="space-y-2 rounded-xl border border-dashed border-outline-variant p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    className="input"
                    onChange={(event) => setNewLabel(event.target.value)}
                    placeholder={t('addressLabel')}
                    value={newLabel}
                  />
                  <input
                    className="input"
                    onChange={(event) => setNewDetails(event.target.value)}
                    placeholder={t('addressDetails')}
                    value={newDetails}
                  />
                </div>
                <input
                  className="input"
                  onChange={(event) => setNewAddress(event.target.value)}
                  placeholder={t('address')}
                  value={newAddress}
                />
                <button className="btn-primary w-full" onClick={saveAddress} type="button">
                  {t('saveAddress')}
                </button>
              </div>
            )}
            </>
            )}
          </div>

          {/* Delivery time */}
          <div className="space-y-4 rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex items-center gap-space-sm">
              <Ms className="text-primary" name="schedule" size={22} />
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                {isPickup ? t('pickupTime') : t('deliveryTime')}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
              {slotOptions.map((option) => (
                <button
                  key={option.id}
                  className={cn(
                    'flex flex-col justify-between gap-3 rounded-xl p-4 text-left transition-colors',
                    cluster(slot === option.id),
                  )}
                  onClick={() => setSlot(option.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg',
                        slot === option.id ? 'bg-primary text-on-primary' : 'bg-surface-container-lowest text-on-surface-variant',
                      )}
                    >
                      <Ms name={option.icon} size={18} />
                    </span>
                    <span
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full',
                        slot === option.id ? 'bg-primary text-on-primary' : 'bg-surface-container',
                      )}
                    >
                      {slot === option.id && <Ms name="check" size={14} />}
                    </span>
                  </div>
                  <div>
                    <span
                      className={cn(
                        'block font-label-md text-label-md',
                        slot === option.id ? 'font-bold text-primary' : 'text-on-surface-variant',
                      )}
                    >
                      {option.title}
                    </span>
                    <span className="block font-headline-sm text-headline-sm font-extrabold text-on-surface">
                      {option.value}
                    </span>
                    <span className="mt-1 inline-block font-body-sm text-body-sm text-on-surface-variant">
                      {option.note}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="space-y-4 rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-space-sm">
                <Ms className="text-primary" name="account_balance_wallet" size={22} />
                <h3 className="font-headline-sm text-headline-sm text-on-surface">{t('choosePayment')}</h3>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 font-label-sm text-label-sm text-primary">
                <Ms name="verified_user" size={14} />
                {t('secureTransaction')}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2">
              {PAYMENTS.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-xl p-4 transition-colors',
                    payment === option.id ? 'bg-primary/10' : 'bg-surface-container-low hover:bg-surface-container',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-lowest shadow-sm">
                      <Ms className={option.color} name={option.icon} size={22} />
                    </span>
                    <div>
                      <span className="block font-label-md text-label-md font-bold text-on-surface">
                        {option.id === 'cash' ? t('cash') : option.name}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{t(option.desc)}</span>
                    </div>
                  </div>
                  <input
                    checked={payment === option.id}
                    className="h-5 w-5 cursor-pointer accent-primary"
                    name="payment"
                    onChange={() => setPayment(option.id)}
                    type="radio"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Courier note */}
          <div className="space-y-3 rounded-xl bg-surface-container-lowest p-space-lg shadow-sm">
            <div className="flex items-center gap-space-sm">
              <Ms className="text-primary" name="chat" size={20} />
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{t('orderComment')}</h3>
            </div>
            <textarea
              className="input min-h-[90px] resize-none"
              onChange={(event) => setNote(event.target.value)}
              placeholder={t('notePlaceholder')}
              value={note}
            />
            <div className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
              <Ms className="text-primary" name="notifications_off" size={16} />
              <span>{t('courierCallNote')}</span>
            </div>
          </div>
        </div>

        {/* RIGHT: summary */}
        <div className="sticky top-[180px] space-y-4 lg:col-span-4">
          <div className="space-y-space-md rounded-xl bg-surface-container-lowest p-space-lg shadow-md">
            <div className="flex items-center justify-between pb-1">
              <h3 className="font-headline-md text-headline-md text-on-surface">{t('orderSummary')}</h3>
            </div>

            <div className="space-y-3 font-body-md text-body-md">
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>{t('subtotal')} ({cart.length})</span>
                <span className="font-price-sm text-price-sm text-on-surface">{formatUZS(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>{isPickup ? t('pickup') : t('deliveryFee')}</span>
                <span className="rounded bg-primary/10 px-2 py-0.5 font-label-md text-label-md font-bold uppercase text-primary">
                  {payableDelivery === 0 ? t('free') : formatUZS(payableDelivery)}
                </span>
              </div>
              <div className="flex items-center justify-between text-on-surface-variant">
                <span>{t('ecoPackaging')}</span>
                <span className="font-label-md text-label-md font-bold text-primary">{formatUZS(0)}</span>
              </div>

              <div className="h-px w-full bg-surface-container" />

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="block font-headline-sm text-headline-sm font-extrabold text-on-surface">{t('total')}:</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{t('vatIncluded')}</span>
                </div>
                <div className="text-right">
                  <span className="font-display-lg text-display-lg font-extrabold tracking-tight text-primary">
                    {formatPrice(payableTotal)}
                  </span>
                  <span className="ml-1 font-headline-sm text-headline-sm font-bold text-primary">{t('currency')}</span>
                </div>
              </div>
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 font-headline-sm text-headline-sm text-on-primary shadow-lg transition-transform hover:bg-primary-container active:scale-95"
              onClick={submitOrder}
              type="button"
            >
              <Ms name="lock" size={20} />
              <span>{t('confirmOrder')} • {formatUZS(payableTotal)}</span>
            </button>
          </div>

          <div className="space-y-3 rounded-xl bg-surface-container-low p-space-md">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Ms name="verified" size={18} />
              </span>
              <div>
                <h4 className="font-label-md text-label-md font-bold text-on-surface">{t('freshnessGuarantee')}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('freshnessGuaranteeText')}</p>
              </div>
            </div>
            <div className="h-px w-full bg-surface-container-high" />
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Ms name="security" size={18} />
              </span>
              <div>
                <h4 className="font-label-md text-label-md font-bold text-on-surface">{t('securePayment')}</h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{t('securePaymentText')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const cluster = (active) => (active ? 'bg-primary/10' : 'bg-surface-container-low hover:bg-surface-container');
