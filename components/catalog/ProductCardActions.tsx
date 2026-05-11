"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { MAX_CART_ITEM_QUANTITY, addOneCartItem, getCartItem, subscribeCart, updateCartItemQuantity } from "@/lib/cart";
import { CartItem } from "@/types/cart";

const PINK = "#E6AECB";
const BROWN = "#54342C";

type ProductCardActionsProps = { product: Omit<CartItem, "quantity"> };

export function ProductCardActions({ product }: ProductCardActionsProps) {
  const [quantity, setQuantity] = useState(0);
  const [inputValue, setInputValue] = useState("0");

  useEffect(() => {
    const sync = () => {
      const cartItem = getCartItem(product.productId);
      const next = cartItem?.quantity || 0;
      setQuantity(next);
      setInputValue(String(next));
    };
    sync();
    return subscribeCart(sync);
  }, [product.productId]);

  function changeQuantity(next: number) {
    updateCartItemQuantity(product.productId, Math.min(MAX_CART_ITEM_QUANTITY, next));
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.replace(/\D/g, "");
    const limitedValue = value ? String(Math.min(MAX_CART_ITEM_QUANTITY, Number(value))) : "";
    setInputValue(limitedValue);
    if (limitedValue) changeQuantity(Number(limitedValue));
  }

  function handleInputBlur() {
    const value = Number(inputValue);
    if (!inputValue || !value || value <= 0) {
      changeQuantity(0);
      return;
    }
    changeQuantity(Math.min(MAX_CART_ITEM_QUANTITY, value));
  }

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={() => addOneCartItem(product)}
        className="inline-flex h-10 min-w-[9.75rem] items-center justify-center rounded-2xl px-4 text-sm font-semibold shadow-lg transition hover:opacity-90 sm:h-12 sm:min-w-[11rem] sm:px-5 sm:text-base"
        style={{ backgroundColor: BROWN, color: "white" }}
      >
        Добавить в корзину
      </button>
    );
  }

  return (
    <div className="inline-flex h-10 items-center overflow-hidden rounded-2xl shadow ring-1 ring-black/5 sm:h-12" style={{ backgroundColor: PINK, color: BROWN }}>
      <button type="button" onClick={() => changeQuantity(quantity - 1)} className="h-10 w-10 text-lg font-black sm:h-12 sm:w-14 sm:text-xl">−</button>
      <input
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className="h-10 w-11 bg-white/50 px-1 text-center text-sm font-black outline-none sm:h-12 sm:w-14 sm:px-2 sm:text-base"
        aria-label="Количество товара"
      />
      <button type="button" onClick={() => changeQuantity(quantity + 1)} disabled={quantity >= MAX_CART_ITEM_QUANTITY} className="h-10 w-10 text-lg font-black disabled:opacity-40 sm:h-12 sm:w-14 sm:text-xl">+</button>
    </div>
  );
}
