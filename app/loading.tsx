export default function AppLoading() {
  return (
    <main className="min-h-screen bg-[#FFF9FB]">
      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-40 rounded-3xl bg-[#FFF4F8]" />
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-5">
              <div className="h-64 rounded-[32px] bg-white ring-1 ring-black/5" />
              <div className="h-64 rounded-[32px] bg-white ring-1 ring-black/5" />
            </div>
            <div className="h-80 rounded-[32px] bg-white ring-1 ring-black/5" />
          </div>
        </div>

        <p className="mt-6 text-center text-sm font-semibold text-[#54342C] opacity-70">
          Загружаем страницу...
        </p>
      </section>
    </main>
  );
}
