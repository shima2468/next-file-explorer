"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Menu, Plus, Upload, Bell, HelpCircle, User2 } from "lucide-react";
import CreateFolderModal from "@/Components/CreateFolderModal/CreateFolderModal";
import { FolderNode } from "@/lib/data";
import { FileNode } from "@/lib/recent";

const isFolderRoute = (p: string) => /^\/folders\/[^/]+$/.test(p);
const folderIdFromPath = (p: string) =>
  p.match(/^\/folders\/([^/]+)$/)?.[1] ?? null;

function collectRecent(root: FolderNode, limit = 200) {
  const acc: {
    id: string;
    name: string;
    type: "file" | "folder";
    ts: number;
  }[] = [];
  const stack: FolderNode[] = [root];
  const tsOf = (n: { id: string; createdAt?: string | number }) => {
    if (n.createdAt != null) {
      const v =
        typeof n.createdAt === "string"
          ? Date.parse(n.createdAt)
          : Number(n.createdAt);
      if (!Number.isNaN(v)) return v;
    }
    const v = Number(n.id);
    return Number.isFinite(v) ? v : 0;
  };
  while (stack.length) {
    const node = stack.pop()!;
    for (const ch of node.children) {
      if ((ch as any).type === "file") {
        const f = ch as FileNode;
        acc.push({ id: f.id, name: f.name, type: "file", ts: tsOf(f) });
      } else {
        const f = ch as FolderNode;
        acc.push({ id: f.id, name: f.name, type: "folder", ts: tsOf(f) });
        stack.push(f);
      }
    }
  }
  acc.sort((a, b) => b.ts - a.ts);
  return acc.slice(0, limit);
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const toggleSidebar = () =>
    window.dispatchEvent(new CustomEvent("sidebar:toggle"));

  const inFolder = isFolderRoute(pathname);
  const currentFolderId = folderIdFromPath(pathname) ?? "root";

  const [title, setTitle] = useState("Overview");
  const [badge, setBadge] = useState<string | null>("");

  const [openCreate, setOpenCreate] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        if (pathname === "/recent") {
          setTitle("Recent");
          const r = await fetch("/api/folders/root", { cache: "no-store" });
          if (!r.ok) throw new Error();
          const root = (await r.json()) as FolderNode;
          const count = collectRecent(root, 200).length;
          if (alive) setBadge(`${count} item(s)`);
          return;
        }
        if (pathname === "/folders") {
          setTitle("Folders");
          const r = await fetch("/api/folders/root", { cache: "no-store" });
          if (!r.ok) throw new Error();
          const root = (await r.json()) as FolderNode;
          const foldersCount = root.children.filter(
            (c) => (c as any).type === "folder"
          ).length;
          if (alive) setBadge(`${foldersCount} folder(s)`);
          return;
        }
        if (inFolder) {
          const id = currentFolderId;
          const r = await fetch(`/api/folders/${id}`, { cache: "no-store" });
          if (!r.ok) throw new Error();
          const f = (await r.json()) as FolderNode;
          const files = f.children.filter(
            (c) => (c as any).type === "file"
          ).length;
          const subfolders = f.children.filter(
            (c) => (c as any).type === "folder"
          ).length;
          if (alive) {
            setTitle(f.name || "Folder");
            setBadge(`${files} file(s), ${subfolders} folder(s)`);
          }
          return;
        }
        setTitle("Overview");
        setBadge(null);
      } catch {
        setTitle(
          inFolder
            ? "Folder"
            : pathname === "/folders"
            ? "Folders"
            : pathname === "/recent"
            ? "Recent"
            : "Overview"
        );
        setBadge(null);
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [pathname, inFolder, currentFolderId]);

  const jumpToUploader = () => {
    const el =
      (document.getElementById("upload") as HTMLElement | null) ||
      (document.querySelector("[data-upload-box]") as HTMLElement | null) ||
      (document.querySelector("[data-upload-target]") as HTMLElement | null);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("ring-2", "ring-blue-500");
      setTimeout(() => el.classList.remove("ring-2", "ring-blue-500"), 900);
    } else {
      router.push(`${pathname}#upload`);
    }
  };

  const parentIdForNew = useMemo(
    () => (inFolder ? currentFolderId : "root"),
    [inFolder, currentFolderId]
  );

  return (
    <>
      <div className="sticky top-0 z-30 lg:z-40 border-b bg-white lg:bg-white/90 lg:backdrop-blur lg:supports-[backdrop-filter]:bg-white/70">
        <div className="flex h-14 w-full items-center gap-3 px-4 lg:px-8">
          <button
            aria-label="Toggle sidebar"
            onClick={toggleSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[15px] font-semibold">{title}</span>
            {badge && (
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                {badge}
              </span>
            )}
          </div>

          <div className="flex-1" />

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setOpenCreate(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
              title="New folder"
              aria-label="New folder"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New folder</span>
            </button>

            {isFolderRoute(pathname) && (
              <button
                onClick={jumpToUploader}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
                title="Add files to this folder"
                aria-label="Add files"
              >
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Add files</span>
              </button>
            )}

            <span className="mx-1 hidden h-5 w-px bg-neutral-200 sm:inline-block" />

            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 hover:bg-neutral-50"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
            </button>

            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 hover:bg-neutral-50"
              title="Help & Support"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>

            <button
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
              title="Account"
              aria-label="Account"
            >
              <User2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <CreateFolderModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        parentId={parentIdForNew}
        onCreated={async () => {
          router.refresh();
        }}
      />
    </>
  );
}
