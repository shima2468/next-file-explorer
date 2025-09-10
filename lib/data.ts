// lib/data.ts

type FileNode = {
  id: string;
  name: string;
  type: "file";
  size?: number;
  path?: string;
  content?: string | Uint8Array | ArrayBuffer;
  parentId?: string;  
};

export type FolderNode = {
  id: string;
  name: string;
  type: "folder";
  children: Array<FolderNode | FileNode>;
};

// شجرة مبدئية بالذاكرة
export const root: FolderNode = {
  id: "root",
  name: "root",
  type: "folder",
  children: [
    { id: "folder-1", name: "Folder 1", type: "folder", children: [] },
    { id: "folder-2", name: "Folder 2", type: "folder", children: [] },
  ],
};

// ابحث عن فولدر بالـ id
export function findFolder(
  id: string,
  current: FolderNode = root
): FolderNode | null {
  if (current.id === id) return current;
  for (const child of current.children) {
    if (child.type === "folder") {
      const result = findFolder(id, child as FolderNode);
      if (result) return result;
    }
  }
  return null;
}

// 🔎 رجّع فولدر الأب لـ targetId (أو null لو ما إله أب)
export function findParent(
  targetId: string,
  current: FolderNode = root,
  parent: FolderNode | null = null
): FolderNode | null {
  if (current.id === targetId) return parent;
  for (const child of current.children) {
    if (child.type === "folder") {
      const res = findParent(targetId, child as FolderNode, current);
      if (res) return res;
    }
  }
  return null;
}

export function findFolderAndParent(id: string): {
  folder: FolderNode | null;
  parent: FolderNode | null;
} {
  function dfs(
    target: string,
    current: FolderNode,
    parent: FolderNode | null
  ): { folder: FolderNode | null; parent: FolderNode | null } {
    if (current.id === target) return { folder: current, parent };
    for (const ch of current.children) {
      if (ch.type === "folder") {
        const r = dfs(target, ch as FolderNode, current);
        if (r.folder) return r;
      }
    }
    return { folder: null, parent: null };
  }
  return dfs(id, root, null);
}

export type FileItem = { id: string; name: string; type: "file" };