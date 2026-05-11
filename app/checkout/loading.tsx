export default function CheckoutLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="animate-pulse space-y-8">
        <div>
          <div className="h-12 w-52 rounded-2xl bg-[#FFF4F8]" />
          <div className="mt-4 h-6 w-80 rounded-2xl bg-[#FFF4F8]" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <div className="h-56 rounded-[32px] bg-white ring-1 ring-black/5" />
            <div className="h-56 rounded-[32px] bg-white ring-1 ring-black/5" />
            <div className="h-48 rounded-[32px] bg-white ring-1 ring-black/5" />
          </div>
          <div className="h-80 rounded-[32px] bg-white ring-1 ring-black/5" />
        </div>
      </div>

      <p className="mt-6 text-center text-sm font-semibold text-[#54342C] opacity-70">
        Загружаем оформление заказа...
      </p>
    </section>
  );
}
