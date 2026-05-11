export default function AccountLoading() {
  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-6 shadow-lg ring-1 ring-black/5 md:p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-48 rounded-2xl bg-[#FFF4F8]" />
        <div className="h-5 w-72 rounded-2xl bg-[#FFF4F8]" />
        <div className="mt-6 space-y-3">
          <div className="h-24 rounded-3xl bg-[#FFF9FB]" />
          <div className="h-24 rounded-3xl bg-[#FFF9FB]" />
          <div className="h-24 rounded-3xl bg-[#FFF9FB]" />
        </div>
      </div>
    </div>
  );
}
