"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import FilterBar from "../shared/FilterBar";
import EmptyState from "../shared/EmptyState";
import Loader from "../shared/Loader";
import {
  Folder as FolderIcon,
  Download as DownloadIcon,
  FolderOpenIcon,
} from "lucide-react";

import type { Folder } from "@/lib/types";
import { bytesToHuman, countAllFiles, sumBytes } from "@/lib/utils/storage";

const LOADER_DELAY_MS = 400;
const DEFAULT_FOLDER_QUOTA = 20 * 1024 * 1024 * 1024;

function countImmediateItems(f: Folder) {
  return f.children?.length ?? 0;
}
function hasAnyFilesDeep(f: Folder): boolean {
  return countAllFiles(f) > 0;
}

async function downloadFolder(id: string, name: string) {
  try {
    const res = await fetch(`/api/folders/${id}/download`);
    if (!res.ok) throw new Error("Failed to prepare ZIP");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.zip`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  } catch (e) {
    console.error(e);
    alert("Could not download this folder.");
  }
}

export default function FolderCard({
  folders,
  quotaBytes = DEFAULT_FOLDER_QUOTA,
}: {
  folders: Folder[];
  quotaBytes?: number;
}) {
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<"all" | "has" | "empty">("all");
  const [layout, setLayout] = useState<"one" | "two" | "four">("four");

  const [isPending, startTransition] = useTransition();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isPending) {
      setShowLoader(true);
      return;
    }
    const t = setTimeout(() => setShowLoader(false), LOADER_DELAY_MS);
    return () => clearTimeout(t);
  }, [isPending]);

  const counts = useMemo(
    () => ({
      all: folders.length,
      has: folders.filter((f) => hasAnyFilesDeep(f)).length,
      empty: folders.filter((f) => !hasAnyFilesDeep(f)).length,
    }),
    [folders]
  );

  const list = useMemo(() => {
    let arr = [...folders];
    const q = query.trim().toLowerCase();
    if (q) arr = arr.filter((f) => f.name.toLowerCase().includes(q));
    if (segment === "has") arr = arr.filter((f) => hasAnyFilesDeep(f));
    if (segment === "empty") arr = arr.filter((f) => !hasAnyFilesDeep(f));
    return arr;
  }, [folders, query, segment]);

  const grid =
    layout === "one"
      ? "grid-cols-1"
      : layout === "two"
      ? "grid-cols-2"
      : "grid-cols-[repeat(auto-fill,minmax(260px,1fr))]";

  const hasAny = folders.length > 0;
  const hasMatches = list.length > 0;

  return (
    <div className="space-y-6">
      <FilterBar
        query={query}
        onQueryChange={(v) => startTransition(() => setQuery(v))}
        searchPlaceholder="Search folders…"
        segments={[
          { key: "all", label: "All", count: counts.all },
          { key: "has", label: "Has files", count: counts.has },
          { key: "empty", label: "Empty", count: counts.empty },
        ]}
        segment={segment}
        onSegmentChange={(k) => startTransition(() => setSegment(k as any))}
        layout={layout}
        onLayoutChange={(v) => startTransition(() => setLayout(v))}
        busy={showLoader}
        disableWhileBusy={false}
      />

      {showLoader ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center text-neutral-600">
          <Loader label="Updating…" />
        </div>
      ) : !hasAny ? (
        <EmptyState
          dashed
          title="No folders yet"
          subtitle="Create your first folder to get started."
        />
      ) : !hasMatches ? (
        <EmptyState
          title="No matching folders"
          subtitle="Try a different search or segment."
        />
      ) : (
        <div className={`grid ${grid} gap-4`}>
          {list.map((f) => {
            const used = sumBytes(f);
            const pctRaw = quotaBytes > 0 ? (used / quotaBytes) * 100 : 0;
            const pctText =
              used === 0
                ? "0%"
                : pctRaw >= 0.1
                ? `${pctRaw.toFixed(1)}%`
                : "<0.1%";
            const barPct = Math.min(
              100,
              used > 0 && pctRaw < 0.5 ? 0.5 : pctRaw
            );
            const items = countImmediateItems(f);

            return (
              <div
                key={f.id}
                className="group relative block min-w-[260px] rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100">
                    <FolderIcon className="h-5 w-5 text-neutral-800" />
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/folders/${f.id}`}
                      className="truncate font-semibold text-neutral-900 hover:underline"
                    >
                      {f.name}
                    </Link>
                    <div className="mt-0.5 text-xs text-neutral-600">
                      {items} item{items === 1 ? "" : "s"} •{" "}
                      {bytesToHuman(used)}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span>Used</span>
                    <span>{pctText}</span>
                  </div>
                  <div
                    className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-100"
                    role="progressbar"
                    aria-valuenow={Math.round(Math.min(100, pctRaw))}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Folder storage usage"
                  >
                    <div
                      className="h-full rounded-full bg-neutral-800 transition-[width] duration-300 ease-out"
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-neutral-600">
                    {bytesToHuman(used)} / {bytesToHuman(quotaBytes)}
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Link
                    href={`/folders/${f.id}`}
                    className="flex h-8 items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-sm hover:bg-neutral-50"
                  >
                    <FolderOpenIcon className="h-4 w-4" />
                    <span>Open</span>
                  </Link>

                  <button
                    onClick={() => downloadFolder(f.id, f.name)}
                    className="flex h-8 items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 text-sm hover:bg-neutral-50"
                    aria-label={`Download ${f.name}`}
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Download
                  </button>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] rounded-b-2xl bg-neutral-100">
                  <div className="h-full w-[28%] bg-neutral-600/30 transition group-hover:w-1/2" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
