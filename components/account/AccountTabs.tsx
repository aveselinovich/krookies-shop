"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function menuClass(isActive: boolean) {
  return `inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-2xl px-3 py-3 text-center text-sm font-semibold transition sm:min-h-11 sm:px-5 lg:flex lg:w-full lg:justify-start lg:py-4 lg:text-left ${
    isActive
      ? "bg-[#54342C] text-white"
      : "bg-white text-[#54342C] shadow-lg ring-1 ring-black/5 hover:bg-[#FFFFFF]"
  }`;
}

export function AccountTabs() {
  const pathname = usePathname();
  const isOrders = pathname === "/account/orders" || pathname.startsWith("/account/orders/");
  const isProfile = pathname === "/account/profile";
  const isOverview = !isOrders && !isProfile;

  return (
    <nav className="mt-7 grid grid-cols-3 gap-3 lg:block lg:space-y-3">
      <Link href="/account" className={menuClass(isOverview)}>Обзор</Link>
      <Link href="/account/orders" className={menuClass(isOrders)}>Мои заказы</Link>
      <Link href="/account/profile" className={menuClass(isProfile)}>Профиль</Link>
    </nav>
  );
}
