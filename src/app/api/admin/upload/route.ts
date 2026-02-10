import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { requireAdmin } from "@/lib/admin-auth";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".jpg";
    const filename = `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    // Use Vercel Blob when token is set (production / Vercel)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(filename, buffer, {
        access: "public",
        contentType: file.type || "image/jpeg",
      });
      return NextResponse.json({ url: blob.url, path: blob.url });
    }

    // Fallback: local filesystem (local dev only - won't work on Vercel)
    await mkdir(UPLOAD_DIR, { recursive: true });
    const filepath = path.join(UPLOAD_DIR, path.basename(filename));
    await writeFile(filepath, buffer);
    const url = `/uploads/${path.basename(filename)}`;
    return NextResponse.json({ url, path: url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upload" },
      { status: 500 }
    );
  }
}
