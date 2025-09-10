// lib/recent.ts
export type FileNode = { id: string; name: string; type: "file"; createdAt?: string | number };
export type FolderNode = { id: string; name: string; type: "folder"; children: Array<FileNode | FolderNode>; createdAt?: string | number };

export type RecentItem = {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId?: string; // للملفات
  ts: number;        // تايم ستامب للفرز
};

// نحسب التايم ستامب: createdAt لو موجود، غير هيك بنحوّل id لرقم (عندك بينولد من Date.now())
function getTs(n: { id: string; createdAt?: string | number }): number {
  if (n.createdAt != null) {
    const v = typeof n.createdAt === "string" ? Date.parse(n.createdAt) : Number(n.createdAt);
    if (!Number.isNaN(v)) return v;
  }
  const v = Number(n.id);
  return Number.isFinite(v) ? v : 0;
}

// نفلتّن الشجرة إلى عناصر Recent
function walk(folder: FolderNode, acc: RecentItem[]) {
  for (const child of folder.children) {
    if (child.type === "folder") {
      acc.push({ id: child.id, name: child.name, type: "folder", ts: getTs(child as any) });
      walk(child as FolderNode, acc);
    } else {
      acc.push({
        id: child.id,
        name: child.name,
        type: "file",
        parentId: folder.id,
        ts: getTs(child as any),
      });
    }
  }
}

/**
 * يجيب الريسينت دينامِك من الـ API ثم يرتّب تنازليًا (أجدَد → أقدم)
 * @param limit عدد العناصر
 * @param folderId نقطة البدء (افتراضي root)
 */
export async function getRecent(limit = 100, folderId = "root"): Promise<RecentItem[]> {
  const res = await fetch(`/api/folders/${folderId}`, { cache: "no-store" });
  if (!res.ok) return [];
  const root = (await res.json()) as FolderNode;

  const acc: RecentItem[] = [];
  walk(root, acc);

  acc.sort((a, b) => b.ts - a.ts);
  return acc.slice(0, limit);
}
