"use client";

import Link from "next/link";
import { Folder as FolderIcon, File as FileIcon } from "lucide-react";
import type { RecentItem } from "@/lib/recent";
import { Layout } from "@/lib/types";

export default function RecentCards({
  items,
  layout = "four",
}: {
  items: RecentItem[];
  layout?: Layout;
}) {
  const grid =
    layout === "one"
      ? "grid-cols-1"
      : layout === "two"
      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2"
      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div className={`grid ${grid} gap-4`}>
      {items.map((it) => {
        const href =
          it.type === "folder"
            ? `/folders/${it.id}`
            : it.parentId
            ? `/folders/${it.parentId}`
            : "/folders";
        const Icon = it.type === "folder" ? FolderIcon : FileIcon;

        return (
          <Link
            key={`${it.type}-${it.id}-${it.ts}`}
            href={href}
            className="group relative block h-full w-full rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800"
          >
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100">
                <Icon className="h-5 w-5 text-neutral-800" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold text-neutral-900">
                  {it.name}
                </div>
                <div className="mt-0.5 text-xs text-neutral-600">
                  <span className="rounded-md bg-neutral-100 px-1.5 py-0.5">
                    {it.type === "folder" ? "Folder" : "File"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] rounded-b-2xl bg-neutral-100">
              <div className="h-full w-[28%] bg-neutral-600/30 transition group-hover:w-1/2" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
