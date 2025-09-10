"use client";

import { FolderOpen, Upload } from "lucide-react";

export default function Brand({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <div
      className={`relative border-b ${collapsed ? "px-2 py-4 flex justify-center" : "px-3 py-3 flex items-center gap-3"}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      aria-label="Toggle sidebar"
      title="Toggle sidebar"
    >
      <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-xl">
        <span className="absolute inset-0 rounded-xl bg-neutral-100 ring-1 ring-inset ring-neutral-200" />
        <span className="relative">
          <FolderOpen className="h-5 w-5 text-neutral-800" />
          <span className="absolute -right-1 -bottom-1 grid h-4 w-4 place-items-center rounded-md bg-neutral-900">
            <Upload className="h-3 w-3 text-white" />
          </span>
        </span>
      </span>

      {!collapsed && (
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-semibold text-neutral-900">File Explorer</span>
          <span className="text-[12px] text-neutral-500">Manage & Upload</span>
        </div>
      )}
    </div>
  );
}
