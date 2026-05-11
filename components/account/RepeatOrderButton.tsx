"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { saveCartItems } from "@/lib/cart";
import { CartItem } from "@/types/cart";

type RepeatOrderButtonProps = {
  items: CartItem[];
};

export function RepeatOrderButton({ items }: RepeatOrderButtonProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isOpeningCart, startOpeningCart] = useTransition();

  const hasItems = useMemo(() => items.length > 0, [items]);

  function handleRepeatOrder() {
    if (!hasItems) {
      setError("Не удалось собрать товары для повторного заказа");
      return;
    }

    try {
      saveCartItems(items);
      startOpeningCart(() => router.push("/cart"));
    } catch {
      setError("Не получилось добавить товары в корзину");
    }
  }

  if (!hasItems) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button type="button" variant="secondary" disabled={isOpeningCart} onClick={handleRepeatOrder}>
        {isOpeningCart ? "Открываем корзину..." : "Повторить заказ"}
      </Button>
      {error ? <p className="text-sm text-[#B3536B]">{error}</p> : null}
    </div>
  );
}
