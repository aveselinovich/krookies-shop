"use client";

import { useEffect, useState } from "react";
import { CartItem as CartItemType } from "@/types/cart";
import {
  getCartItems,
  getCartState,
  removeCartItem,
  subscribeCart,
  updateCartItemQuantity,
} from "@/lib/cart";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartEmpty } from "@/components/cart/CartEmpty";
import { CartDeliveryNotice } from "@/components/cart/CartDeliveryNotice";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export default function CartPage() {
  const [items, setItems] = useState<CartItemType[] | null>(null);

  useEffect(() => {
    setItems(getCartItems());
    return subscribeCart(() => setItems(getCartItems()));
  }, []);

  function handleQuantityChange(productId: string, quantity: number) {
    setItems(updateCartItemQuantity(productId, quantity));
  }

  function handleRemove(productId: string) {
    setItems(removeCartItem(productId));
  }

  if (items === null) {
    return (
      <main className="flex min-h-screen flex-col bg-[#FFF9FB]">
        <SiteHeader />
        <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 md:px-8 md:py-16">
          <div className="animate-pulse space-y-8">
            <div>
              <div className="h-12 w-44 rounded-2xl bg-[#FFF4F8]" />
              <div className="mt-4 h-6 w-72 rounded-2xl bg-[#FFF4F8]" />
            </div>
            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-4">
                <div className="h-40 rounded-[32px] bg-white ring-1 ring-black/5" />
                <div className="h-40 rounded-[32px] bg-white ring-1 ring-black/5" />
              </div>
              <div className="h-72 rounded-[32px] bg-white ring-1 ring-black/5" />
            </div>
          </div>
          <p className="mt-6 text-center text-sm font-semibold text-[#54342C] opacity-70">
            Обновляем корзину...
          </p>
        </section>
        <SiteFooter />
      </main>
    );
  }

  const cartState = getCartState(items);

  return (
    <main className="flex min-h-screen flex-col bg-[#FFF9FB]">
      <SiteHeader />

      <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 md:px-8 md:py-16">
        {items.length === 0 ? (
          <CartEmpty />
        ) : (
          <>
            <div className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#54342C] md:text-6xl">
                Корзина
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-[#54342C]">
                Проверьте состав заказа. На следующем шаге вы отправите заявку на
                подтверждение менеджером
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
                <div className="hidden lg:block">
                  <CartDeliveryNotice />
                </div>
              </div>

              <div className="space-y-4">
                <CartSummary subtotal={cartState.subtotal} totalQuantity={cartState.totalQuantity} />
                <div className="lg:hidden">
                  <CartDeliveryNotice />
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}
