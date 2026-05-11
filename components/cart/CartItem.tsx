"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, useEffect, useState } from "react";
import { XIcon } from "@/components/ui/Icons";
import { CartItem as CartItemType } from "@/types/cart";
import { MAX_CART_ITEM_QUANTITY } from "@/lib/cart";
import { formatPrice } from "@/lib/money";

type CartItemProps = {
  item: CartItemType;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

function truncateDescription(text: string, maxLength = 86) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function CartItem({ item, onQuantityChange, onRemove }: CartItemProps) {
  const [inputValue, setInputValue] = useState(String(item.quantity));

  useEffect(() => {
    setInputValue(String(item.quantity));
  }, [item.quantity]);

  function changeQuantity(quantity: number) {
    onQuantityChange(item.productId, quantity);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value.replace(/\D/g, "");
    const limitedValue = value ? String(Math.min(MAX_CART_ITEM_QUANTITY, Number(value))) : "";
    setInputValue(limitedValue);

    if (!limitedValue) return;

    changeQuantity(Number(limitedValue));
  }

  function handleInputBlur() {
    const value = Number(inputValue);

    if (!inputValue || !value || value <= 0) {
      onRemove(item.productId);
      return;
    }

    changeQuantity(Math.min(MAX_CART_ITEM_QUANTITY, value));
  }

  return (
    <div className="rounded-[30px] bg-[#FFFFFF] p-3.5 shadow-[0_24px_60px_rgba(84,52,44,0.08)] ring-1 ring-[#EFDCCB] md:rounded-3xl md:p-5 md:shadow-lg md:ring-black/5">
      <div className="relative md:hidden">
        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          className="absolute right-0 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF1F6] text-[#54342C]"
          aria-label="Удалить товар"
        >
          <XIcon size={18} strokeWidth={2.4} />
        </button>

        <div className="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3">
          <Link
            href={`/product/${item.slug}`}
            className="relative h-24 overflow-hidden rounded-[22px] bg-[#FFF4F8]"
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-contain p-2"
                sizes="96px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#54342C]">
                Нет фото
              </div>
            )}
          </Link>

          <div className="relative min-w-0 pr-[92px] pt-0.5">
            <Link href={`/product/${item.slug}`}>
              <h2 className="max-w-full break-words text-[15px] font-black leading-[1.08] text-[#54342C] [overflow-wrap:anywhere]">
                {item.title}
              </h2>
            </Link>
            <p className="mt-2.5 text-[11px] leading-4 text-[#54342C] opacity-65">
              {formatPrice(item.price)} / шт.
            </p>

            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="min-w-0 text-[18px] font-black leading-none text-[#54342C]">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>

            <div className="absolute bottom-[-0.45rem] right-0 flex shrink-0 items-center overflow-hidden rounded-full border border-[#E6CFB6] bg-white">
              <button
                type="button"
                onClick={() => changeQuantity(item.quantity - 1)}
                className="flex h-8 w-8 items-center justify-center text-[16px] font-medium text-[#54342C]"
                aria-label="Уменьшить количество"
              >
                −
              </button>

              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="h-8 w-10 border-x border-[#E6CFB6] bg-white px-0.5 text-center text-[11px] font-black tabular-nums tracking-tight text-[#54342C] outline-none"
                aria-label="Количество товара"
              />

              <button
                type="button"
                onClick={() => changeQuantity(item.quantity + 1)}
                disabled={item.quantity >= MAX_CART_ITEM_QUANTITY}
                className="flex h-8 w-8 items-center justify-center text-[16px] font-medium text-[#54342C]"
                aria-label="Увеличить количество"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative hidden md:block">
        <button
          type="button"
          onClick={() => onRemove(item.productId)}
          className="absolute right-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF4F8] text-[#54342C] transition hover:bg-[#E6AECB]"
          aria-label="Удалить товар"
        >
          <XIcon size={20} strokeWidth={2.4} />
        </button>

        <div className="grid gap-5 pr-12 pt-1 sm:grid-cols-[96px_1fr] sm:items-start md:grid-cols-[112px_1fr_180px_160px] md:items-center md:pr-12">
          <Link
            href={`/product/${item.slug}`}
            className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[22px] bg-[#FFF4F8] sm:h-28 sm:w-24 md:w-28"
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-contain p-2"
                sizes="112px"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-[#54342C]">
                Нет фото
              </div>
            )}
          </Link>

          <div className="min-w-0">
            <Link href={`/product/${item.slug}`}>
              <h2 className="text-xl font-bold text-[#54342C] transition hover:opacity-80">
                {item.title}
              </h2>
            </Link>
            <p
              className="mt-2 overflow-hidden text-sm leading-6 text-[#54342C]"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {truncateDescription(
                item.shortDescription || "Печенье KROOKIES с фирменной начинкой"
              )}
            </p>
          </div>

          <div className="rounded-[24px] bg-[#FFF4F8] px-4 py-4 text-center md:self-center">
            <p className="text-xl font-black text-[#54342C] sm:text-2xl">
              {formatPrice(item.price * item.quantity)}
            </p>
            <p className="mt-2 text-sm text-[#54342C]">Цена за штуку {formatPrice(item.price)}</p>
          </div>

          <div className="pb-10 sm:col-span-2 md:col-span-1 md:pb-0 md:pr-0 md:text-right">
            <div className="inline-flex items-center rounded-full border border-[#E0C7AE] bg-white">
              <button
                type="button"
                onClick={() => changeQuantity(item.quantity - 1)}
                className="flex h-10 w-11 items-center justify-center text-lg font-bold text-[#54342C]"
                aria-label="Уменьшить количество"
              >
                −
              </button>

              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className="h-10 w-12 border-x border-[#E0C7AE] bg-white px-2 text-center text-sm font-semibold text-[#54342C] outline-none"
                aria-label="Количество товара"
              />

              <button
                type="button"
                onClick={() => changeQuantity(item.quantity + 1)}
                disabled={item.quantity >= MAX_CART_ITEM_QUANTITY}
                className="flex h-10 w-11 items-center justify-center text-lg font-bold text-[#54342C]"
                aria-label="Увеличить количество"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
