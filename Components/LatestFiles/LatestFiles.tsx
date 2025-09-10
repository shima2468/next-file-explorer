
"use client";
import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import StateEmpty from "@/Components/shared/EmptyState";
import FileRow from "./FileRow";
import { FolderNode } from "@/lib/data";
import { FileNode } from "@/lib/recent";



function flattenFiles(node: FolderNode | FileNode): FileNode[] {
  if (node.type === "file") return [node as FileNode];
  const f = node as FolderNode;
  return f.children.flatMap((c) => flattenFiles(c as any));
}

function getCreatedMs(f: FileNode): number {
  if (f.createdAt != null) {
    const n =
      typeof f.createdAt === "string" ? Date.parse(f.createdAt) : Number(f.createdAt);
    if (!Number.isNaN(n)) return n;
  }
  const n = Number(f.id);
  return Number.isFinite(n) ? n : 0;
}

function fmtDate(ms: number) {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function LatestFiles({
  folderId = "root",
  limit = 6,
  maxNameChars = 60,
}: {
  folderId?: string;
  limit?: number;
  maxNameChars?: number;
}) {
  const [root, setRoot] = useState<FolderNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/folders/${folderId}`, { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as FolderNode;
        if (alive) setRoot(json);
      } catch {
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [folderId]);

  const recent = useMemo(() => {
    const files = root ? flattenFiles(root) : [];
    return files
      .sort((a, b) => getCreatedMs(b) - getCreatedMs(a))
      .slice(0, limit)
      .map((f) => ({
        name: f.name,
        date: fmtDate(getCreatedMs(f)),
      }));
  }, [root, limit]);

  return (
    <section className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Recent Files</h2>
        <button
          type="button"
          className="rounded-lg px-2 py-1 text-gray-500 hover:text-gray-700"
          aria-label="more"
        >
          ⋮
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-9 w-9 shrink-0 rounded-xl bg-gray-100" />
                <div className="h-3 w-40 rounded bg-gray-200" />
              </div>
              <div className="h-2 w-20 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : recent.length === 0 ? (
        <StateEmpty
          icon={<FileText className="h-6 w-6" />}
          title="No recent files"
          subtitle="Upload or create files to get started."
        />
      ) : (
        <div className="divide-y divide-gray-200">
          {recent.map((f, i) => (
            <FileRow
              key={`${f.name}-${i}`}
              name={f.name}
              date={f.date}
              maxNameChars={maxNameChars}
            />
          ))}
        </div>
      )}
    </section>
  );
}
