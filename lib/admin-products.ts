import { ProductBadge } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { deleteManagedProductImage } from "@/lib/product-image-cleanup";
import { normalizeWeightValue } from "@/lib/product-weight";

type UpdateAdminProductInput = {
  title: string;
  shortDescription: string;
  composition: string;
  allergens?: string | null;
  weight: string;
  badge?: ProductBadge | null;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isPublished: boolean;
};

type CreateAdminProductInput = UpdateAdminProductInput;

export async function getAdminProducts() {
  return prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getAdminProductById(id: string) {
  return prisma.product.findFirst({ where: { OR: [{ id }, { slug: id }] } });
}

function createSlug(title: string) {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
    и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
    с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ы: "y", э: "e", ю: "yu", я: "ya", ь: "", ъ: "",
  };

  return title
    .toLowerCase()
    .trim()
    .replace(/[а-яё]/g, (char) => map[char] || "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function createUniqueSlug(title: string) {
  const baseSlug = createSlug(title) || "product";
  let slug = baseSlug;
  let counter = 1;

  while (await prisma.product.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

function validateProductInput(input: UpdateAdminProductInput) {
  if (!input.title?.trim()) throw new Error("product_title_required");
  if (!input.shortDescription?.trim()) throw new Error("product_short_description_required");
  if (!input.composition?.trim()) throw new Error("product_composition_required");
  if (!normalizeWeightValue(input.weight)) throw new Error("product_weight_required");
  if (!input.imageUrl?.trim()) throw new Error("product_image_required");
  if (!input.price || input.price <= 0) throw new Error("product_price_invalid");
}

async function cleanupOrphanedProductImage(imageUrl: string | null | undefined) {
  const normalizedImageUrl = imageUrl?.trim();

  if (!normalizedImageUrl) {
    return;
  }

  const referencesCount = await prisma.product.count({
    where: {
      OR: [{ imageUrl: normalizedImageUrl }, { images: { has: normalizedImageUrl } }],
    },
  });

  if (referencesCount > 0) {
    return;
  }

  try {
    await deleteManagedProductImage(normalizedImageUrl);
  } catch (error) {
    console.error("product image cleanup failed", {
      imageUrl: normalizedImageUrl,
      error,
    });
  }
}

export async function createAdminProduct(input: CreateAdminProductInput) {
  validateProductInput(input);

  const slug = await createUniqueSlug(input.title);
  const maxSortProduct = await prisma.product.findFirst({
    orderBy: { sortOrder: "desc" },
  });

  return prisma.product.create({
    data: {
      title: input.title.trim(),
      slug,
      shortDescription: input.shortDescription.trim(),
      description: null,
      composition: input.composition.trim(),
      allergens: input.allergens?.trim() || null,
      weight: normalizeWeightValue(input.weight),
      price: input.price,
      imageUrl: input.imageUrl.trim(),
      images: [input.imageUrl.trim()],
      badge: input.badge || null,
      isAvailable: input.isAvailable,
      isPublished: input.isPublished,
      sortOrder: (maxSortProduct?.sortOrder || 0) + 1,
    },
  });
}

export async function updateAdminProduct(id: string, input: UpdateAdminProductInput) {
  validateProductInput(input);
  const nextImageUrl = input.imageUrl.trim();
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: {
      imageUrl: true,
    },
  });

  if (!existingProduct) {
    throw new Error("product_not_found");
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      title: input.title.trim(),
      shortDescription: input.shortDescription.trim(),
      composition: input.composition.trim(),
      allergens: input.allergens?.trim() || null,
      weight: normalizeWeightValue(input.weight),
      badge: input.badge || null,
      price: input.price,
      imageUrl: nextImageUrl,
      images: [nextImageUrl],
      isAvailable: input.isAvailable,
      isPublished: input.isPublished,
    },
  });

  if (existingProduct.imageUrl !== nextImageUrl) {
    await cleanupOrphanedProductImage(existingProduct.imageUrl);
  }

  return product;
}

export async function deleteAdminProduct(id: string) {
  const existingProduct = await prisma.product.findUnique({
    where: { id },
    select: {
      imageUrl: true,
    },
  });

  if (!existingProduct) {
    throw new Error("product_not_found");
  }

  const product = await prisma.product.delete({
    where: { id },
  });

  await cleanupOrphanedProductImage(existingProduct.imageUrl);

  return product;
}

export async function reorderAdminProducts(productIds: string[]) {
  if (!productIds.length) {
    throw new Error("product_order_required");
  }

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    select: {
      id: true,
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("product_not_found");
  }

  await prisma.$transaction(
    productIds.map((productId, index) =>
      prisma.product.update({
        where: { id: productId },
        data: { sortOrder: index + 1 },
      })
    )
  );

  return prisma.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
