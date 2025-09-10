"use client";
import { FileItem } from "@/lib/data";
import { FileText } from "lucide-react";
function kindOf(name: string): "image" | "video" | "pdf" | "other" {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png","jpg","jpeg","gif","webp","bmp","svg"].includes(ext)) return "image";
  if (["mp4","mov","webm"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  return "other";
}

const buildUrl = (folderId: string, name: string, id: string) =>
  `/uploads/${encodeURIComponent(folderId)}/${encodeURIComponent(name)}?v=${id}`;

export default function AnimatedFilesGrid({
  files,
  folderId,
}: {
  files: FileItem[];
  folderId: string;          
}) {
  return (
    <>
      {files.map((f) => {
        const k = kindOf(f.name);
        const url = buildUrl(folderId, f.name, f.id);

        return (
          <article
            key={f.id}
            className="group overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md"
          >
            <div className="aspect-[4/3] w-full relative bg-neutral-100">
              {k === "image" && (
                <img src={url} alt={f.name} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
              )}
              {k === "video" && (
                <video className="absolute inset-0 h-full w-full object-cover" src={url} controls preload="metadata" />
              )}
              {k === "pdf" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <object data={url} type="application/pdf" className="h-full w-full" aria-label={`${f.name} preview`}>
                    <div className="text-sm text-neutral-600 p-4">PDF preview not available. Click to download.</div>
                  </object>
                </div>
              )}
              {k === "other" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-neutral-500">
                  <FileText className="h-8 w-8" />
                  <span className="text-xs">No preview</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-neutral-900">{f.name}</p>
                <p className="text-xs text-neutral-500">#{f.id}</p>
              </div>
              <a href={url} download className="rounded-md border px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50">
                Download
              </a>
            </div>
          </article>
        );
      })}
    </>
  );
}
