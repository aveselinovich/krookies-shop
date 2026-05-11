import { ProductListItem } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";

type ProductGridProps = {
  products: ProductListItem[];
  centerDesktopActions?: boolean;
};

export function ProductGrid({ products, centerDesktopActions = false }: ProductGridProps) {
  if (products.length === 0) {
    return <div className="rounded-3xl bg-white p-8 text-center shadow-lg ring-1 ring-black/5">Сейчас товары временно недоступны</div>;
  }
  return <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">{products.map((product) => <ProductCard key={product.id} product={product} centerDesktopActions={centerDesktopActions} />)}</div>;
}
