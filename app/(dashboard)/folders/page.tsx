import CreateFolderButton from "@/Components/CreateFolderButton/CreateFolderButton";
import FolderCard from "@/Components/FolderCard/FolderCard";
import { findFolder } from "@/lib/data";
import type { Node, Folder } from "@/lib/types";
import {
  isFolder,
  sumBytes,
  countAllFiles,
  bytesToHuman,
} from "@/lib/utils/storage";

const QUOTA_PER_FOLDER = 20 * 1024 * 1024 * 1024;

export const dynamic = "force-dynamic";

export default function FoldersPage() {
  const root = findFolder("root") as Node | undefined;

  const folders = (root?.children ?? []).filter(isFolder) as Folder[];

  const filesCount = countAllFiles(root);
  const workspaceUsed = folders.reduce((s, f) => s + sumBytes(f), 0);

  const rawQuota = folders.length * QUOTA_PER_FOLDER;

  const safeQuota = Math.max(1, rawQuota);

  const usedPct = (workspaceUsed / safeQuota) * 100;
  const barPct = Math.min(100, usedPct > 0 && usedPct < 0.5 ? 0.5 : usedPct);
  const pctLabel =
    rawQuota === 0
      ? "—"
      : usedPct > 0 && usedPct < 0.1
      ? "<0.1%"
      : usedPct < 1
      ? `${usedPct.toFixed(1)}%`
      : `${Math.round(usedPct)}%`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-neutral-900">Your folders</h1>
          <p className="text-sm text-neutral-600">
            Create folders, upload files, and organize your workspace.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <CreateFolderButton
            parentId="root"
            label="New folder"
            variant="solid"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 text-neutral-800">
            <span className="text-sm font-semibold">📁</span>
          </div>
          <div>
            <div className="text-xs text-neutral-600">Folders</div>
            <div className="text-lg font-semibold text-neutral-900">
              {folders.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100 text-neutral-800">
            <span className="text-sm font-semibold">📄</span>
          </div>
          <div>
            <div className="text-xs text-neutral-600">Files</div>
            <div className="text-lg font-semibold text-neutral-900">
              {filesCount}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="text-xs text-neutral-600 flex items-center justify-between">
            <span>Storage used</span>
            <span>{pctLabel}</span>
          </div>
          <div
            className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100"
            role="progressbar"
            aria-valuenow={Math.round(Math.min(100, usedPct))}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Storage usage"
          >
            <div
              className="h-full rounded-full bg-neutral-800 transition-[width]"
              style={{ width: `${barPct}%` }}
            />
          </div>
          <div className="mt-2 text-sm font-semibold text-neutral-900">
            {bytesToHuman(workspaceUsed)} / {bytesToHuman(rawQuota)}
          </div>
        </div>
      </div>

      {/* Folders grid */}
      <FolderCard folders={folders} quotaBytes={QUOTA_PER_FOLDER} />
    </div>
  );
}
