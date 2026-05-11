import { ArrowRightIcon, MessageCircleIcon } from "@/components/ui/Icons";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getPublishedProducts } from "@/lib/products";

const PINK = "#E6AECB";
const BROWN = "#54342C";
const GALLERY_IMAGES = [
  {
    src: "/images/gallery/krookies-gallary-1.jpg",
    alt: "Шоколадные печенья KROOKIES с орехами и шоколадной глазурью",
  },
  {
    src: "/images/gallery/krookies-gallary-2.png",
    alt: "Процесс приготовления печенья KROOKIES на кухне",
  },
  {
    src: "/images/gallery/krookies-gallary-3.png",
    alt: "Печенья KROOKIES с белой глазурью и ягодной посыпкой",
  },
];

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const products = await getPublishedProducts();

  return (
    <div className="flex min-h-screen flex-col text-neutral-900" style={{ backgroundColor: "#FFF9FB" }}>
      <SiteHeader />

      <section id="top" className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div>
            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-6xl" style={{ color: BROWN }}>
              American cookies с&nbsp;текучей начинкой
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 sm:text-xl sm:leading-8">
              Сладкая, счастливая жизнь — в каждом печенье. Свежие вкусы,
              плотная текстура, тающая сердцевина
            </p>
          </div>
        </div>
      </section>

      <section id="showcase" className="bg-white/70 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: BROWN }}>
              Актуальная витрина
            </h2>
          </div>
          <ProductGrid products={products} centerDesktopActions />
        </div>
      </section>

      <section id="gallery" className="py-16 sm:py-20" style={{ backgroundColor: PINK }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: BROWN }}>
              Галерея Krookies
            </h2>
            <p className="mt-4 text-base leading-7 sm:text-lg sm:leading-8" style={{ color: BROWN }}>
              Настоящие кадры из нашей кухни и витрины: много текстуры, начинки и аппетитного печенья
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {GALLERY_IMAGES.map((image) => (
              <div
                key={image.src}
                className="group overflow-hidden rounded-[2rem] bg-white shadow-lg ring-1 ring-black/5"
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="aspect-[16/11] w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacts" className="py-16 sm:py-20" style={{ backgroundColor: "#FFF4F8" }}>
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div>
            <h2 className="text-3xl font-black sm:text-4xl" style={{ color: BROWN }}>Связаться и заказать</h2>
            <p className="mt-2 opacity-80">Оформите заказ через витрину, а менеджер подтвердит детали и доставку</p>
            <div className="mt-6 space-y-3">
              <a href="https://wa.me/79690483464" target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-center font-semibold shadow-lg sm:w-fit" style={{ backgroundColor: BROWN, color: "white" }}>
                <MessageCircleIcon /> WhatsApp: +7 969-048-34-64
              </a>
              <a href="https://t.me/krookies_manager" target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-3 rounded-2xl px-5 py-4 text-center font-semibold shadow-lg sm:w-fit" style={{ backgroundColor: PINK, color: BROWN }}>
                <MessageCircleIcon /> Telegram: @krookies_manager
              </a>
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 ring-1 ring-black/5">
            <h3 className="text-xl font-black" style={{ color: BROWN }}>Как проходит заказ?</h3>
            <p className="mt-2 opacity-80">
              Вы отправляете заявку, менеджер проверяет возможность доставки и отправляет ссылку на оплату печенья
            </p>
            <a href="/cart" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 font-semibold shadow sm:w-auto" style={{ backgroundColor: PINK, color: BROWN }}>
              Перейти в корзину <ArrowRightIcon size={18} />
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
