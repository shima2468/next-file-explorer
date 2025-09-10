// app/api/folders/[id]/download/route.ts
import { NextResponse } from "next/server";
import archiver from "archiver";
import { PassThrough } from "stream";
import { findFolder } from "@/lib/data";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";         // لازم Node.js بسبب archiver
export const dynamic = "force-dynamic";  // لا تكاشي الرد

type FileNode = {
  id: string;
  name: string;
  type: "file";
  size?: number;
  path?: string;                 // مسار فعلي على الهارد (لو موجود)
  content?: string | Buffer;     // محتوى داخل الذاكرة (اختياري)
};

type FolderNode = {
  id: string;
  name: string;
  type: "folder";
  children: Array<FileNode | FolderNode>;
};

// اسم آمن داخل الأرشيف
function safeName(name: string) {
  return name.replace(/[^\w.\- \u0600-\u06FF]/g, "_"); // يسمح بالعربي
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const folder = findFolder(params.id) as FolderNode | undefined;

  if (!folder || folder.type !== "folder") {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  // هنستخدم stream حتى ما نحمل كل الـ ZIP في الذاكرة
  const nodeStream = new PassThrough();
  const zip = archiver("zip", { zlib: { level: 9 } });

  zip.on("warning", (err) => {
    // تحذيرات archiver (مثلاً ملف مفقود) — خليه يكمل
    console.warn("[archiver warning]", err);
  });

  zip.on("error", (err) => {
    // أي خطأ: انهي الـ stream
    nodeStream.destroy(err);
  });

  // اربط الـ zip بالـ stream
  zip.pipe(nodeStream);

  // لو حابب يظهر مجلد الجذر داخل الـ ZIP (حتى لو فاضي)
  zip.append("", { name: `${safeName(folder.name)}/` });

  // دالة إضافة محتوى المجلد بشكل recursive
  function addFolder(node: FolderNode, base: string) {
    for (const c of node.children ?? []) {
      if ((c as any).type === "folder") {
        const sub = c as FolderNode;
        const nextBase = path.posix.join(base, safeName(sub.name));
        // أدخل المجلد داخل الأرشيف (حتى لو فاضي)
        zip.append("", { name: `${nextBase}/` });
        addFolder(sub, nextBase);
      } else {
        const f = c as FileNode;
        const entryName = path.posix.join(base, safeName(f.name));

        if (f.path) {
          // لو عندك مسار فعلي على القرص
          // ملاحظة: حوّل لمسار مطلق لو path كانت نسبية
          const abs = path.isAbsolute(f.path)
            ? f.path
            : path.join(process.cwd(), f.path);

          if (fs.existsSync(abs)) {
            zip.file(abs, { name: entryName });
            continue;
          }
        }

        if (typeof f.content !== "undefined") {
          // محتوى بالذاكرة
          const buf =
            typeof f.content === "string" ? Buffer.from(f.content) : f.content;
          zip.append(buf, { name: entryName });
        } else {
          // لا path ولا content: نضيف ملف فارغ بحجم اختياري
          zip.append(Buffer.alloc(f.size ?? 0), { name: entryName });
        }
      }
    }
  }

  addFolder(folder, safeName(folder.name));

  // انهِ الأرشفة (لازم)
  void zip.finalize();

  // ملاحظة: Node runtime يقبل Node.js streams مباشرةً
  const filename = safeName(folder.name) + ".zip";
  const headers: Record<string, string> = {
    "Content-Type": "application/zip",
    // دعم UTF-8: نضع fallback + RFC5987
    "Content-Disposition":
      `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(
        filename
      )}`,
    "Cache-Control": "no-store",
  };

  return new NextResponse(nodeStream as any, { headers });
}
