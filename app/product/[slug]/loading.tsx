export default function ProductLoading() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-12 md:px-8 md:py-16">
      <div className="animate-pulse space-y-8">
        <div className="h-11 w-40 rounded-full bg-[#FFF4F8]" />
        <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl bg-white p-4 ring-1 ring-black/5 sm:p-5">
            <div className="aspect-square rounded-3xl bg-[#FFF4F8]" />
          </div>
          <div className="rounded-3xl bg-white p-5 ring-1 ring-black/5 sm:p-6 md:p-8">
            <div className="h-8 w-32 rounded-2xl bg-[#FFF4F8]" />
            <div className="mt-4 h-12 w-3/4 rounded-2xl bg-[#FFF4F8]" />
            <div className="mt-4 h-6 w-full rounded-2xl bg-[#FFF4F8]" />
            <div className="mt-2 h-6 w-2/3 rounded-2xl bg-[#FFF4F8]" />
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="h-12 w-36 rounded-2xl bg-[#FFF4F8]" />
              <div className="h-10 w-24 rounded-full bg-[#FFF4F8]" />
            </div>
            <div className="mt-8 h-12 w-56 rounded-2xl bg-[#FFF4F8]" />
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm font-semibold text-[#54342C] opacity-70">
        Загружаем товар...
      </p>
    </section>
  );
}
