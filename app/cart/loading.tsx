export default function CartLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="animate-pulse space-y-8">
        <div>
          <div className="h-12 w-44 rounded-2xl bg-[#FFF4F8]" />
          <div className="mt-4 h-6 w-72 rounded-2xl bg-[#FFF4F8]" />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div className="h-40 rounded-[32px] bg-white ring-1 ring-black/5" />
            <div className="h-40 rounded-[32px] bg-white ring-1 ring-black/5" />
          </div>
          <div className="h-72 rounded-[32px] bg-white ring-1 ring-black/5" />
        </div>
      </div>

      <p className="mt-6 text-center text-sm font-semibold text-[#54342C] opacity-70">
        Обновляем корзину...
      </p>
    </section>
  );
}
