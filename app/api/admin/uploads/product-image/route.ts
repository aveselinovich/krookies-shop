import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { requireApiAdmin } from "@/lib/permissions";

export const runtime = "nodejs";

const MAX_IMAGE_SIZE = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function safeFileName(fileName: string, fileType: string) {
  const extension = IMAGE_EXTENSIONS[fileType] || "jpg";
  const baseName = fileName
    .replace(/\.[^.]+$/, "")
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "product";

  return `${baseName}.${extension}`;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAdmin();
    if (auth.response) return auth.response;

    if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
      return NextResponse.json({ error: "image_storage_not_configured" }, { status: 503 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "image_file_required" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: "image_type_not_supported" }, { status: 415 });
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json({ error: "image_too_large" }, { status: 413 });
    }

    const blob = await put(`products/${safeFileName(file.name, file.type)}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("POST /api/admin/uploads/product-image error:", error);
    return NextResponse.json({ error: "image_upload_failed" }, { status: 500 });
  }
}
