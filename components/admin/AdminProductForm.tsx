"use client";

import { Product, ProductBadge } from "@prisma/client";
import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeWeightValue } from "@/lib/product-weight";

function priceToRubles(price: number) {
  return String(price / 100);
}

function rublesToKopecks(value: string) {
  return Math.round(Number(value.replace(",", ".")) * 100);
}

function getProductFormMessage(error: string) {
  switch (error) {
    case "product_title_required":
      return "Укажите название товара";
    case "product_short_description_required":
      return "Добавьте короткое описание";
    case "product_composition_required":
      return "Добавьте состав";
    case "product_weight_required":
      return "Укажите граммовку";
    case "product_image_required":
      return "Добавьте фото товара";
    case "product_price_invalid":
      return "Проверьте цену";
    case "image_file_required":
      return "Выберите фотографию";
    case "image_type_not_supported":
      return "Поддерживаются JPG, PNG и WebP";
    case "image_too_large":
      return "Фотография должна быть не больше 4 МБ";
    case "image_storage_not_configured":
      return "Хранилище фотографий пока не подключено";
    case "image_upload_failed":
      return "Не получилось загрузить фотографию";
    default:
      return "Не получилось сохранить товар";
  }
}

type AdminProductFormProps =
  | { mode: "create"; product?: never }
  | { mode: "edit"; product: Product };

export function AdminProductForm({ mode, product }: AdminProductFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(product?.title || "");
  const [shortDescription, setShortDescription] = useState(product?.shortDescription || "");
  const [composition, setComposition] = useState(product?.composition || "");
  const [allergens, setAllergens] = useState(product?.allergens || "");
  const [weight, setWeight] = useState(normalizeWeightValue(product?.weight || ""));
  const [badge, setBadge] = useState<ProductBadge | "none">(product?.badge || "none");
  const [price, setPrice] = useState(product ? priceToRubles(product.price) : "550");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [isAvailable, setIsAvailable] = useState(product?.isAvailable ?? true);
  const [isPublished, setIsPublished] = useState(product?.isPublished ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setIsUploadingImage(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/uploads/product-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "image_upload_failed");
      }

      setImageUrl(result.url);
      setMessage("Фотография загружена. Сохраните товар, чтобы применить её");
    } catch (error) {
      setMessage(getProductFormMessage(error instanceof Error ? error.message : "image_upload_failed"));
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const nextImageUrl = imageUrl.trim();
      if (!nextImageUrl) {
        throw new Error("product_image_required");
      }
      const url = mode === "create" ? "/api/admin/products" : `/api/admin/products/${product.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          shortDescription,
          composition,
          allergens,
          weight,
          badge: badge === "none" ? null : badge,
          price: rublesToKopecks(price),
          imageUrl: nextImageUrl,
          isAvailable,
          isPublished,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "product_save_failed");

      setImageUrl(nextImageUrl);

      if (mode === "create") {
        router.push("/admin/products");
        router.refresh();
        return;
      }

      setMessage("Товар сохранен");
      router.refresh();
    } catch (error) {
      console.error(error);
      setMessage(getProductFormMessage(error instanceof Error ? error.message : "product_save_failed"));
    } finally {
      setIsSaving(false);
    }
  }

  const input =
    "w-full rounded-2xl border border-[#E6AECB] bg-white px-4 py-3 text-[#54342C] outline-none focus:border-[#54342C]";

  return (
    <form onSubmit={submitForm} className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <label>
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Название</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} className={input} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Цена, ₽</span>
          <input value={price} onChange={(event) => setPrice(event.target.value)} className={input} />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Граммовка, г</span>
          <input
            value={weight}
            onChange={(event) => setWeight(event.target.value.replace(/\D/g, ""))}
            inputMode="numeric"
            className={input}
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-[#54342C]">Бейдж</span>
          <select value={badge} onChange={(event) => setBadge(event.target.value as ProductBadge | "none")} className={input}>
            <option value="none">Нет</option>
            <option value="hit">Хит</option>
            <option value="new">Новинка</option>
            <option value="limited">Лимитка</option>
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-2xl bg-[#FFF4F8] px-4 py-3">
            <span className="font-semibold text-[#54342C]">В наличии</span>
            <input type="checkbox" checked={isAvailable} onChange={(event) => setIsAvailable(event.target.checked)} />
          </label>

          <label className="flex items-center justify-between rounded-2xl bg-[#FFF4F8] px-4 py-3">
            <span className="font-semibold text-[#54342C]">Опубликовано</span>
            <input type="checkbox" checked={isPublished} onChange={(event) => setIsPublished(event.target.checked)} />
          </label>
        </div>
      </div>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-[#54342C]">Короткое описание</span>
        <textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} rows={3} className={input} />
      </label>

      <label className="mt-5 block">
        <span className="mb-2 block text-sm font-semibold text-[#54342C]">Состав</span>
        <textarea value={composition} onChange={(event) => setComposition(event.target.value)} rows={6} className={input} />
      </label>

      <div className="mt-5 grid gap-5 md:grid-cols-[220px_1fr] md:items-start">
        <div className="flex h-56 overflow-hidden rounded-[24px] bg-[#FFF4F8] ring-1 ring-[#E6AECB]">
          {imageUrl ? (
            <img src={imageUrl} alt={title || "Товар"} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-6 text-center text-sm font-semibold text-[#8A6A62]">
              Фотография пока не загружена
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-black text-[#54342C]">Фотография товара</h2>
          <p className="mt-2 text-sm leading-6 text-[#54342C]">
            Загрузите JPG, PNG или WebP размером до 4 МБ. Фотография сохранится на сервере и появится в превью слева.
          </p>

          <label className={`mt-4 inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-[#54342C] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#6B463C] ${isUploadingImage ? "pointer-events-none opacity-60" : ""}`}>
            {isUploadingImage
              ? "Загружаем фотографию..."
              : imageUrl
                ? "Заменить фотографию"
                : "Загрузить фотографию"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={uploadImage}
              disabled={isUploadingImage}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSaving || isUploadingImage}
          className="rounded-full bg-[#54342C] px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {isSaving ? "Сохраняем..." : mode === "create" ? "Добавить товар" : "Сохранить товар"}
        </button>

        {message ? <p className="text-sm font-semibold text-[#54342C]">{message}</p> : null}
      </div>
    </form>
  );
}
