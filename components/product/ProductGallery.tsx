import Image from "next/image";

type ProductGalleryProps = { title: string; imageUrl: string | null; images?: string[] };

export function ProductGallery({ title, imageUrl, images = [] }: ProductGalleryProps) {
  const mainImage = imageUrl || images[0];
  return (
    <div className="rounded-3xl bg-[#FFFFFF] p-4 shadow-lg ring-1 ring-black/5 sm:p-5">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-[#FFF4F8]">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={title}
            fill
            priority
            className="object-contain p-3 sm:p-5"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#54342C]">Нет фото</div>
        )}
      </div>
    </div>
  );
}
