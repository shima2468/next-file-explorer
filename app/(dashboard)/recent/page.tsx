"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import FilterBar from "@/Components/shared/FilterBar";
import Loader from "@/Components/shared/Loader";
import EmptyState from "@/Components/shared/EmptyState";
import { getRecent, type RecentItem } from "@/lib/recent";
import RecentCards from "@/Components/RecentCard/RecentCard";

const LOADER_DELAY_MS = 400;

export default function RecentPage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [query, setQueryRaw] = useState("");
  const [segment, setSegmentRaw] = useState<"all" | "files" | "folders">("all");
  const [sort, setSortRaw] = useState<
    "newest" | "oldest" | "name-asc" | "name-desc"
  >("newest");
  const [layout, setLayoutRaw] = useState<"one" | "two" | "four">("four");

  const [isPending, startTransition] = useTransition();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const rec = await getRecent(200, "root");
      if (alive) setItems(rec);
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (isPending) {
      setShowLoader(true);
      return;
    }
    const t = setTimeout(() => setShowLoader(false), LOADER_DELAY_MS);
    return () => clearTimeout(t);
  }, [isPending]);

  // setters داخل transition
  const setQuery = (v: string) => startTransition(() => setQueryRaw(v));
  const setSegment = (v: typeof segment) =>
    startTransition(() => setSegmentRaw(v));
  const setSort = (v: typeof sort) => startTransition(() => setSortRaw(v));
  const setLayout = (v: typeof layout) =>
    startTransition(() => setLayoutRaw(v));

  // تصفية/فرز
  const filtered = useMemo(() => {
    let arr = [...items];

    if (segment === "files") arr = arr.filter((i) => i.type === "file");
    if (segment === "folders") arr = arr.filter((i) => i.type === "folder");

    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((i) => i.name.toLowerCase().includes(q));
    }

    switch (sort) {
      case "name-asc":
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        arr.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "oldest":
        arr.sort((a, b) => a.ts - b.ts);
        break;
      case "newest":
      default:
        arr.sort((a, b) => b.ts - a.ts);
        break;
    }
    return arr;
  }, [items, segment, query, sort]);

  const counts = useMemo(
    () => ({
      all: items.length,
      files: items.filter((i) => i.type === "file").length,
      folders: items.filter((i) => i.type === "folder").length,
    }),
    [items]
  );

  const hasAny = items.length > 0;
  const hasMatches = filtered.length > 0;

  return (
    <div className="space-y-4">
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search recent…"
        segments={[
          { key: "all", label: "All", count: counts.all },
          { key: "files", label: "Files", count: counts.files },
          { key: "folders", label: "Folders", count: counts.folders },
        ]}
        segment={segment}
        onSegmentChange={(k) => setSegment(k as any)}
        sort={sort}
        onSortChange={(v) => setSort(v as any)}
        sortOptions={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "name-asc", label: "Name (A→Z)" },
          { value: "name-desc", label: "Name (Z→A)" },
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
          title="No recent yet"
          subtitle="Open some folders/files then come back."
        />
      ) : !hasMatches ? (
        <EmptyState
          title="No matches"
          subtitle="Try adjusting search or filters."
        />
      ) : (
        <RecentCards items={filtered} layout={layout} />
      )}
    </div>
  );
}
