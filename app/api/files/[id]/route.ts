// app/api/files/[id]/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { findFolder } from "@/lib/data";
import { writeFile, mkdir, access } from "fs/promises";
import { constants as FS } from "fs";
import { join, basename, parse } from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// -------- helpers --------
async function exists(p: string) {
  try { await access(p, FS.F_OK); return true; } catch { return false; }
}
function sanitize(name: string) {
  // منع path traversal والرموز غير المسموحة (Windows)
  return basename(name).replace(/[\\/:*?"<>|]/g, "_");
}
async function uniquePath(dir: string, name: string) {
  const base = parse(name).name;
  const ext  = parse(name).ext;
  let candidate = join(dir, sanitize(name));
  if (!(await exists(candidate))) return candidate;
  for (let i = 1; i < 10000; i++) {
    const alt = join(dir, sanitize(`${base}-${i}${ext}`));
    if (!(await exists(alt))) return alt;
  }
  return candidate; // fallback
}

// -------- handler --------
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  // تأكد من وجود الفولدر الهدف
  const parent = findFolder(params.id);
  if (!parent || parent.type !== "folder") {
    return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
  }

  // اقرا الـ FormData
  const formData     = await req.formData();
  const file         = formData.get("file") as File | null;
  const providedName = formData.get("name")?.toString();

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // حدّد الاسم الآمن
  const rawName  = (providedName && providedName.trim()) ? providedName.trim() : file.name;
  const safeName = sanitize(rawName || "file");

  // اكتب الملف داخل مجلد خاص بالفولدر: public/uploads/<folderId>
  const uploadDir = join(process.cwd(), "public", "uploads", params.id);
  await mkdir(uploadDir, { recursive: true });
  const filePath  = await uniquePath(uploadDir, safeName);

  // اكتب على القرص
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, bytes); // ما منستعمل 'wx' لأننا اخترنا اسم فريد

  // خزّن العقدة داخل الشجرة مع الحجم والمسار
  parent.children.push({
    id: String(Date.now()),     // أو crypto.randomUUID() لو متاح
    name: basename(filePath),
    type: "file",
    size: bytes.length,         // 👈 مهم لعرض Used
    path: filePath,             // 👈 مهم للـ download/zip
    parentId: params.id,
  });

  // أعِد بناء الصفحات المتأثرة حتى تتحدّث نسبة الاستخدام فورًا
  revalidatePath("/folders");
  revalidatePath(`/folders/${params.id}`);
  revalidatePath("/recent");

  return NextResponse.json({
    ok: true,
    name: basename(filePath),
    size: bytes.length,
  });
}
