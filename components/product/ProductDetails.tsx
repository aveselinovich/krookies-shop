import { ProductDetails as ProductDetailsType } from "@/types/product";
import { Price } from "@/components/ui/Price";
import { ProductBadge } from "@/components/product/ProductBadge";
import { ProductCardActions } from "@/components/catalog/ProductCardActions";
import { formatProductWeight } from "@/lib/product-weight";

type ProductDetailsProps = { product: ProductDetailsType };

export function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-5 shadow-lg ring-1 ring-black/5 sm:p-6 md:p-8">
      <div className="mb-4">
        <ProductBadge badge={product.badge} />
      </div>

      <h1 className="text-3xl font-black tracking-tight text-[#54342C] sm:text-4xl md:text-5xl">
        {product.title}
      </h1>

      {product.shortDescription ? (
        <p className="mt-4 text-base leading-7 text-[#54342C] sm:text-lg sm:leading-8">{product.shortDescription}</p>
      ) : null}

      <div className="mt-6 flex w-full items-center justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Price price={product.price} oldPrice={product.oldPrice} className="text-[28px] font-black sm:text-4xl md:text-5xl" />
        {product.weight ? (
          <span className="shrink-0 rounded-full bg-[#FFF4F8] px-4 py-2 text-sm font-bold text-[#54342C] sm:px-5 sm:py-3 sm:text-lg md:text-xl">
            {formatProductWeight(product.weight)}
          </span>
        ) : null}
      </div>

      <div className="mt-8 flex justify-center md:justify-start">
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
          <button disabled className="w-full rounded-full bg-[#E5D4C5] px-5 py-3 text-sm font-semibold text-[#54342C]">
            Нет в наличии
          </button>
        )}
      </div>

      {product.composition ? (
        <div className="mt-8 border-t border-[#E6AECB] pt-8">
          <h2 className="text-xl font-semibold text-[#54342C]">Состав и пищевая ценность</h2>
          <p className="mt-3 whitespace-pre-line leading-7 text-[#54342C]">{product.composition}</p>
        </div>
      ) : null}

      <div className="mt-8 rounded-[24px] bg-[#54342C] p-5 text-white">
        <h2 className="text-lg font-semibold">Как оформить заказ?</h2>
        <p className="mt-2 leading-7 text-[#F8EBDD]">
          Добавьте печенье в корзину и отправьте заказ на подтверждение. Менеджер
          проверит возможность доставки и пришлет ссылку на оплату печенья.
          Доставка Яндекс оплачивается отдельно
        </p>
      </div>
    </div>
  );
}
