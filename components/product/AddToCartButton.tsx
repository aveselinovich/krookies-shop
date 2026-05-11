"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { Button } from "@/components/ui/Button";
import { addCartItem } from "@/lib/cart";

type AddToCartButtonProps = {
  product: {
    id: string;
    title: string;
    shortDescription?: string | null;
    slug: string;
    imageUrl: string | null;
    price: number;
    isAvailable: boolean;
  };
};

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [isOpeningCart, startOpeningCart] = useTransition();

  function handleAddToCart() {
    if (!product.isAvailable) return;
    addCartItem({
      productId: product.id,
      title: product.title,
      shortDescription: product.shortDescription,
      slug: product.slug,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity,
    });
    setAdded(true);
  }

  if (!product.isAvailable) return <Button disabled className="w-full">Нет в наличии</Button>;

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-medium text-[#54342C]">Количество</p>
        <QuantitySelector value={quantity} onChange={setQuantity} />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={handleAddToCart} className="w-full sm:w-auto">Добавить в корзину</Button>
        {added ? (
          <Button
            type="button"
            variant="secondary"
            disabled={isOpeningCart}
            onClick={() => startOpeningCart(() => router.push("/cart"))}
            className="w-full sm:w-auto"
          >
            {isOpeningCart ? "Открываем корзину..." : "Перейти в корзину"}
          </Button>
        ) : null}
      </div>
      {added ? <p className="text-sm font-medium text-[#54342C]">Добавили в корзину. Можно выбрать еще или перейти к оформлению</p> : null}
    </div>
  );
}
