"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PhoneIcon, ShoppingBagIcon, UserIcon } from "@/components/ui/Icons";
import { getCartCount, subscribeCart } from "@/lib/cart";

const PINK = "#E6AECB";
const BROWN = "#54342C";

export function SiteHeader() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());
    return subscribeCart(() => setCartCount(getCartCount()));
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b border-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      style={{ backgroundColor: "rgba(255,249,251,0.7)" }}
    >
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group flex min-w-0 items-center gap-3" aria-label="KROOKIES — на главную">
          <Image
            src="/logo-cookie.png"
            alt="KROOKIES"
            width={44}
            height={44}
            className="h-10 w-auto -translate-y-1"
            priority
          />
          <span className="truncate text-base font-black tracking-wide sm:text-lg" style={{ color: BROWN }}>
            KROOKIES
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/cart"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl shadow sm:hidden"
            style={{ backgroundColor: BROWN, color: "white" }}
            aria-label={`Корзина${cartCount > 0 ? `, товаров: ${cartCount}` : ""}`}
          >
            <ShoppingBagIcon size={18} />
          </Link>

          <a
            href="tel:+79690483464"
            className="hidden items-center gap-2 text-sm font-semibold hover:opacity-80 lg:inline-flex"
            style={{ color: BROWN }}
          >
            <PhoneIcon size={16} /> +7 969-048-34-64
          </a>

          <Link
            href="/cart"
            className="hidden items-center gap-2 rounded-2xl px-4 py-2 font-semibold shadow sm:inline-flex"
            style={{ backgroundColor: BROWN, color: "white" }}
          >
            <ShoppingBagIcon size={18} /> Корзина{cartCount > 0 ? `: ${cartCount}` : ""}
          </Link>

          <Link
            href="/account"
            className="inline-flex h-11 items-center gap-2 rounded-2xl px-3 font-semibold shadow sm:px-4"
            style={{ backgroundColor: PINK, color: BROWN }}
          >
            <UserIcon size={18} />
            <span className="hidden sm:inline">ЛК</span>
          </Link>
        </div>

        <a
          href="tel:+79690483464"
          className="inline-flex w-full items-center justify-center gap-2 text-sm font-semibold hover:opacity-80 lg:hidden"
          style={{ color: BROWN }}
        >
          <PhoneIcon size={16} /> +7 969-048-34-64
        </a>
      </nav>
    </header>
  );
}
