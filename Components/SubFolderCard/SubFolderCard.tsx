"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import CreateFolderButton from "@/Components/CreateFolderButton/CreateFolderButton";
import FilterBar from "@/Components/shared/FilterBar";
import EmptyState from "@/Components/shared/EmptyState";
import Loader from "../shared/Loader";
import type { Sub } from "@/lib/types";


const LOADER_DELAY_MS = 400;

export default function SubFolderCard({
  parentId,
  subfolders,
}: {
  parentId: string;
  subfolders: Sub[];
}) {
  const [query, setQueryRaw] = useState("");
  const [segment, setSegmentRaw] = useState<"all" | "has" | "empty">("all");
  const [sort, setSortRaw] = useState<
    "name-asc" | "name-desc" | "newest" | "oldest"
  >("name-asc");
  const [layout, setLayoutRaw] = useState<"one" | "two" | "four">("four");

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

  const setQuery = (v: string) => startTransition(() => setQueryRaw(v));
  const setSegment = (v: typeof segment) =>
    startTransition(() => setSegmentRaw(v));
  const setSort = (v: typeof sort) => startTransition(() => setSortRaw(v));
  const setLayout = (v: typeof layout) =>
    startTransition(() => setLayoutRaw(v));

  const counts = useMemo(
    () => ({
      all: subfolders.length,
      has: subfolders.filter((s) => (s.children?.length ?? 0) > 0).length,
      empty: subfolders.filter((s) => (s.children?.length ?? 0) === 0).length,
    }),
    [subfolders]
  );

  const list = useMemo(() => {
    let arr = [...subfolders];

    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (segment === "has")
      arr = arr.filter((s) => (s.children?.length ?? 0) > 0);
    if (segment === "empty")
      arr = arr.filter((s) => (s.children?.length ?? 0) === 0);

    switch (sort) {
      case "name-asc":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "oldest":
        arr.sort((a, b) => (parseInt(a.id) || 0) - (parseInt(b.id) || 0));
        break;
      case "newest":
      default:
        arr.sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0));
        break;
    }
    return arr;
  }, [subfolders, query, segment, sort]);

  const grid =
    layout === "one"
      ? "grid-cols-1"
      : layout === "two"
      ? "grid-cols-2"
      : "grid-cols-[repeat(auto-fill,minmax(260px,1fr))]";


  const hasAny = subfolders.length > 0;
  const hasMatches = list.length > 0;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wide">Subfolders</h2>
        <CreateFolderButton parentId={parentId} label="Folder" />
      </div>

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search subfolders…"
        segments={[
          { key: "all", label: "All", count: counts.all },
          { key: "has", label: "Has items", count: counts.has },
          { key: "empty", label: "Empty", count: counts.empty },
        ]}
        segment={segment}
        onSegmentChange={(k) => setSegment(k as any)}
        sort={sort}
        onSortChange={(v) => setSort(v as any)}
        sortOptions={[
          { value: "name-asc", label: "Name (A→Z)" },
          { value: "name-desc", label: "Name (Z→A)" },
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
        ]}
        layout={layout}
        onLayoutChange={setLayout}
        busy={showLoader}
        disableWhileBusy={false}
      />

      {showLoader ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-600">
          <Loader label="Filtering…" />
        </div>
      ) : !hasAny ? (
        <EmptyState
          dashed
          icon={<FolderOpen className="h-6 w-6" />}
          title="No subfolders yet"
          subtitle="Create a subfolder using the + Folder button."
        />
      ) : !hasMatches ? (
        <EmptyState
          icon={<FolderOpen className="h-6 w-6" />}
          title="No matching subfolders"
          subtitle="Adjust filters or search text."
        />
      ) : (
        <div className={`grid ${grid} gap-4`}>
          {list.map((sf) => (
            <Link
              key={sf.id}
              href={`/folders/${sf.id}`}
              className="group relative block rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-800"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-neutral-100">
                  <span className="text-neutral-800">📁</span>
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-neutral-900">
                    {sf.name}
                  </div>
                  <div className="mt-0.5 text-xs text-neutral-600">
                    {sf.children?.length ?? 0} item(s)
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] rounded-b-2xl bg-neutral-100">
                <div className="h-full w-[28%] bg-neutral-600/30 transition group-hover:w-1/2" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
