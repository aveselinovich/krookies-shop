import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getProductBySlug, getPublishedProducts } from "@/lib/products";

type ProductPageProps = { params: { slug: string } };

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Товар не найден" };
  return {
    title: `${product.title} — KROOKIES`,
    description: product.shortDescription || "Мягкое печенье KROOKIES с начинкой.",
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const otherProducts = (await getPublishedProducts())
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  return (
    <main className="flex min-h-screen flex-col bg-[#FFF9FB]">
      <SiteHeader />

      <section className="mx-auto w-full max-w-7xl flex-1 px-5 py-12 md:px-8 md:py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex w-full justify-center rounded-full bg-[#FFF4F8] px-5 py-3 text-sm font-semibold text-[#54342C] transition hover:bg-[#E6AECB] sm:w-auto"
          >
            ← Вернуться назад
          </Link>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <ProductGallery title={product.title} imageUrl={product.imageUrl} images={product.images} />
          <ProductDetails product={product} />
        </div>
      </section>

      {otherProducts.length > 0 ? (
        <section className="mx-auto w-full max-w-7xl flex-1 px-5 pb-16 md:px-8">
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#54342C]">
              Еще KROOKIES
            </p>
            <h2 className="text-3xl font-bold text-[#54342C]">Можно добавить к заказу</h2>
          </div>
          <ProductGrid products={otherProducts} />
        </section>
      ) : null}

      <SiteFooter />
    </main>
  );
}
