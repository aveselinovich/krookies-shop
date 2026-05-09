import crypto from "crypto";

function getSupabaseUrl() {
  return (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/$/, "");
}

function getSupabaseServiceRoleKey() {
  return (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
}

export function getSupabaseStorageBucket() {
  return (process.env.SUPABASE_STORAGE_BUCKET || "product-images").trim();
}

export function isSupabaseStorageConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

function buildObjectPath(extension: string) {
  const safeExtension = extension.replace(/[^a-z0-9]/gi, "").toLowerCase() || "jpg";
  return `products/product-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${safeExtension}`;
}

function encodeObjectPath(path: string) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export async function uploadPublicProductImage(input: {
  buffer: Buffer;
  contentType: string;
  extension: string;
}) {
  const supabaseUrl = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  const bucket = getSupabaseStorageBucket();

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("storage_not_configured");
  }

  const objectPath = buildObjectPath(input.extension);
  const encodedPath = encodeObjectPath(`${bucket}/${objectPath}`);
  const response = await fetch(`${supabaseUrl}/storage/v1/object/${encodedPath}`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": input.contentType,
      "x-upsert": "false",
      "cache-control": "3600",
    },
    body: input.buffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("supabase-storage upload failed", {
      status: response.status,
      body: errorText,
    });
    throw new Error("storage_upload_failed");
  }

  return {
    imageUrl: `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`,
    path: objectPath,
    bucket,
  };
}
