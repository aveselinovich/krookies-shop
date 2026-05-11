import Image from "next/image";
import Link from "next/link";
import { ProductListItem } from "@/types/product";
import { Price } from "@/components/ui/Price";
import { ProductBadge } from "@/components/product/ProductBadge";
import { ProductCardActions } from "@/components/catalog/ProductCardActions";

const BROWN = "#54342C";

type ProductCardProps = {
  product: ProductListItem;
  centerDesktopActions?: boolean;
};

export function ProductCard({ product, centerDesktopActions = false }: ProductCardProps) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-black/5 transition hover:-translate-y-1 sm:block">
      <div className="flex items-stretch sm:block">
        <Link href={`/product/${product.slug}`} className="block w-[104px] shrink-0 sm:w-auto">
          <div className="relative h-full">
            {product.badge ? (
              <span className="absolute left-2 top-2 z-10 sm:left-3 sm:top-3">
                <ProductBadge badge={product.badge} />
              </span>
            ) : null}

            <div className="relative h-full min-h-[104px] w-[104px] bg-white sm:aspect-[4/3] sm:h-auto sm:w-auto">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  className="object-contain p-2 sm:p-4"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm opacity-70">
                  Нет фото
                </div>
              )}
            </div>
          </div>
        </Link>

        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 sm:gap-x-4">
            <Link href={`/product/${product.slug}`} className="min-w-0">
              <h3 className="line-clamp-2 text-[15px] font-extrabold leading-[1.15] sm:text-lg" style={{ color: BROWN }}>
                {product.title}
              </h3>
            </Link>
            <Price price={product.price} oldPrice={product.oldPrice} className="shrink-0 self-start text-right text-[15px] sm:text-base" />

            {product.shortDescription ? (
              <p className="col-start-1 line-clamp-2 min-h-[2.5rem] text-xs leading-5 opacity-80 sm:min-h-[40px] sm:text-sm">
                {product.shortDescription}
              </p>
            ) : null}
          </div>

          <div className={`mt-auto flex pt-3 sm:mt-5 sm:pt-0 ${centerDesktopActions ? "justify-end lg:justify-center" : "justify-end"}`}>
            {product.isAvailable ? (
              <ProductCardActions
                product={{
                  productId: product.id,
                  title: product.title,
                  shortDescription: product.shortDescription,
                  slug: product.slug,
                  imageUrl: product.imageUrl,
                  price: product.price,
                }}
              />
            ) : (
              <button disabled className="inline-flex h-10 min-w-[9.75rem] items-center justify-center rounded-2xl bg-[#FFF4F8] px-4 text-sm font-semibold opacity-70 sm:h-12 sm:min-w-[11rem] sm:px-5">
                Нет в наличии
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
