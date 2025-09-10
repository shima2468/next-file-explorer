import Link from "next/link";
import { findFolder, findParent } from "@/lib/data";
import UploadBox from "@/Components/UploadBox/UploadBox";
import FilesCard from "@/Components/FilesCard/FilesCard";
import SubFolderCard from "@/Components/SubFolderCard/SubFolderCard";
import AnimateMount from "@/Components/animations/AnimateMount";

import type { Node, Folder } from "@/lib/types";
import { isFolder } from "@/lib/utils/storage";

type Props = { params: { id: string } };


const isFile = (n: Node): n is Node & { type: "file" } => n.type === "file";

export default function FolderPage({ params }: Props) {
  const node = findFolder(params.id) as Node | undefined;

 
  if (!node || !isFolder(node)) {
    return (
      <div className="p-6">
        <nav className="text-sm text-neutral-600" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/folders" className="hover:text-neutral-800">
                Folders
              </Link>
            </li>
            <li className="text-neutral-400">/</li>
            <li className="font-medium text-neutral-800">Not found</li>
          </ol>
        </nav>
        <p className="mt-3 text-rose-600">Folder not found.</p>
      </div>
    );
  }

  const folder: Folder = node;
  const parent = findParent(folder.id);

  const children = folder.children ?? [];
  const files = children.filter(isFile);
  const subfolders = children.filter(isFolder);

  const fileCount = files.length;
  const subCount = subfolders.length;

  return (
    <AnimateMount>
      <div className="space-y-8">
        {/* ===== Header + Breadcrumb ===== */}
        <header className="space-y-2">
          <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
            <ol className="flex items-center gap-2">
              <li>
                <Link
                  href="/folders"
                  className="rounded-md px-2 py-1 hover:bg-neutral-100 hover:text-neutral-900"
                >
                  Folders
                </Link>
              </li>

              {parent && parent.id !== "root" && (
                <>
                  <li className="text-neutral-400">/</li>
                  <li>
                    <Link
                      href={`/folders/${parent.id}`}
                      className="rounded-md px-2 py-1 hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      {parent.name}
                    </Link>
                  </li>
                </>
              )}

              <li className="text-neutral-400">/</li>
              <li className="rounded-md bg-neutral-50 px-2 py-1 font-medium text-neutral-800">
                {folder.name}
              </li>
            </ol>
          </nav>

          <div className="flex items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{folder.name}</h1>
              <p className="text-sm text-neutral-600">Manage files and subfolders.</p>
            </div>
            <div className="flex gap-2">
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-700">
                {fileCount} file{fileCount === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-xs text-neutral-700">
                {subCount} folder{subCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </header>

        {/* ===== Upload ===== */}
        <UploadBox folderId={folder.id} />

        {/* ===== Subfolders ===== */}
        <SubFolderCard parentId={folder.id} subfolders={subfolders} />

        {/* ===== Files ===== */}
        <section id="files-section" className="space-y-3">
          <h2 className="text-lg font-semibold">Files</h2>
          <FilesCard folderId={folder.id} files={files} />
        </section>
      </div>
    </AnimateMount>
  );
}
