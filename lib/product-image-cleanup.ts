import { unlink } from "fs/promises";
import path from "path";
import { getSupabaseStorageBucket } from "@/lib/supabase-storage";

const MANAGED_PRODUCT_IMAGE_NAME = /^product-\d+-[a-f0-9]+\.(jpg|jpeg|png|webp)$/i;
const MANAGED_SUPABASE_PRODUCT_PATH = /^products\/product-\d+-[a-f0-9]+\.(jpg|jpeg|png|webp)$/i;

function getSupabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/$/, "");
}

function getSupabaseServiceRoleKey() {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
}

function getImagePathname(imageUrl: string) {
  if (imageUrl.startsWith("/")) {
    return imageUrl;
  }

  try {
    return new URL(imageUrl).pathname;
  } catch {
    return null;
  }
}

function getManagedLocalImageFilePath(imageUrl: string) {
  const pathname = getImagePathname(imageUrl);

  if (!pathname) {
    return null;
  }

  const match = pathname.match(/^\/images\/products\/([^/]+)$/i);
  if (!match || !MANAGED_PRODUCT_IMAGE_NAME.test(match[1])) {
    return null;
  }

  return path.join(process.cwd(), "public", "images", "products", match[1]);
}

function getManagedSupabaseObjectPath(imageUrl: string) {
  const supabaseUrl = getSupabaseUrl();
  const bucket = getSupabaseStorageBucket();

  if (!supabaseUrl) {
    return null;
  }

  const publicPrefix = `${supabaseUrl}/storage/v1/object/public/${bucket}/`;
  if (!imageUrl.startsWith(publicPrefix)) {
    return null;
  }

  const objectPath = decodeURIComponent(imageUrl.slice(publicPrefix.length).split("?")[0] || "");
  if (!MANAGED_SUPABASE_PRODUCT_PATH.test(objectPath)) {
    return null;
  }

  return objectPath;
}

async function deleteLocalManagedProductImage(imageUrl: string) {
  const filePath = getManagedLocalImageFilePath(imageUrl);
  if (!filePath) {
    return false;
  }

  try {
    await unlink(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return false;
    }

    throw error;
  }
}

async function deleteSupabaseManagedProductImage(imageUrl: string) {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  const bucket = getSupabaseStorageBucket();
  const objectPath = getManagedSupabaseObjectPath(imageUrl);

  if (!supabaseUrl || !serviceRoleKey || !objectPath) {
    return false;
  }

  const encodedPath = [bucket, objectPath]
    .join("/")
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

  const response = await fetch(`${supabaseUrl}/storage/v1/object/${encodedPath}`, {
    method: "DELETE",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  if (response.ok || response.status === 404) {
    return response.ok;
  }

  const errorText = await response.text();
  console.error("supabase-storage delete failed", {
    status: response.status,
    body: errorText,
    imageUrl,
  });
  throw new Error("storage_delete_failed");
}

export async function deleteManagedProductImage(imageUrl: string) {
  const normalizedImageUrl = imageUrl.trim();
  if (!normalizedImageUrl) {
    return false;
  }

  if (await deleteSupabaseManagedProductImage(normalizedImageUrl)) {
    return true;
  }

  return deleteLocalManagedProductImage(normalizedImageUrl);
}
