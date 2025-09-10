"use client";
import { useEffect, useMemo, useState, useTransition } from "react";
import FilterBar from "@/Components/shared/FilterBar";
import AnimatedFilesGrid from "@/Components/animations/AnimatedFilesGrid";
import Loader from "../shared/Loader";
import EmptyState from "../shared/EmptyState";
import { FileItem } from "@/lib/data";



function kindOf(name: string): "image" | "video" | "pdf" | "other" {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"].includes(ext)) return "image";
  if (["mp4", "mov", "webm"].includes(ext)) return "video";
  if (ext === "pdf") return "pdf";
  return "other";
}

export default function FilesCard({
  files,
  folderId,
}: {
  files: FileItem[];
  folderId: string;
}) {
  const [query, setQueryRaw] = useState("");
  const [segment, setSegmentRaw] = useState<"all" | "image" | "video" | "pdf" | "other">("all");
  const [sort, setSortRaw] = useState<"newest" | "oldest" | "name-asc" | "name-desc">("newest");
  const [layout, setLayoutRaw] = useState<"one" | "two" | "four">("four");

  const [isPending, startTransition] = useTransition();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isPending) { setShowLoader(true); return; }
    const t = setTimeout(() => setShowLoader(false), 400);
    return () => clearTimeout(t);
  }, [isPending]);

  const setQuery   = (v: string) => startTransition(() => setQueryRaw(v));
  const setSegment = (v: typeof segment) => startTransition(() => setSegmentRaw(v));
  const setSort    = (v: typeof sort) => startTransition(() => setSortRaw(v));
  const setLayout  = (v: typeof layout) => startTransition(() => setLayoutRaw(v));

  const counts = useMemo(() => ({
    all: files.length,
    image: files.filter((f) => kindOf(f.name) === "image").length,
    video: files.filter((f) => kindOf(f.name) === "video").length,
    pdf: files.filter((f) => kindOf(f.name) === "pdf").length,
    other: files.filter((f) => kindOf(f.name) === "other").length,
  }), [files]);

  const list = useMemo(() => {
    let arr = [...files];
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((f) => f.name.toLowerCase().includes(q));
    }
    if (segment !== "all") arr = arr.filter((f) => kindOf(f.name) === segment);

    switch (sort) {
      case "name-asc":  arr.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "name-desc": arr.sort((a, b) => b.name.localeCompare(a.name)); break;
      case "oldest":    arr.sort((a, b) => (parseInt(a.id) || 0) - (parseInt(b.id) || 0)); break;
      case "newest":
      default:          arr.sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0)); break;
    }
    return arr;
  }, [files, query, segment, sort]);

  const grid =
    layout === "one" ? "grid-cols-1" :
    layout === "two" ? "grid-cols-1 sm:grid-cols-2" :
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  const hasAny = files.length > 0;
  const hasMatches = list.length > 0;

  return (
    <div className="space-y-4">
      <FilterBar
        query={query}
        onQueryChange={setQuery}
        searchPlaceholder="Search files…"
        segments={[
          { key: "all",   label: "All",    count: counts.all },
          { key: "image", label: "Images", count: counts.image },
          { key: "video", label: "Videos", count: counts.video },
          { key: "pdf",   label: "PDFs",   count: counts.pdf },
          { key: "other", label: "Other",  count: counts.other },
        ]}
        segment={segment}
        onSegmentChange={(k) => setSegment(k as any)}
        sort={sort}
        onSortChange={(v) => setSort(v as any)}
        sortOptions={[
          { value: "newest",    label: "Newest" },
          { value: "oldest",    label: "Oldest" },
          { value: "name-asc",  label: "Name (A→Z)" },
          { value: "name-desc", label: "Name (Z→A)" },
        ]}
        layout={layout}
        onLayoutChange={setLayout}
        busy={showLoader}
        disableWhileBusy={false}
      />

      <div className="relative min-h-[40px]">
        {showLoader ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-600" role="status" aria-live="polite">
            <Loader label="Filtering…" />
          </div>
        ) : !hasAny ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-600">
            <EmptyState title="No files yet" subtitle="Upload files to get started." dashed />
          </div>
        ) : !hasMatches ? (
          <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center text-neutral-600">
            <EmptyState title="No matching files" subtitle="Try adjusting search or filters." />
          </div>
        ) : (
          <div className={`grid ${grid} gap-4`}>
            <AnimatedFilesGrid
              key={list.map((f) => f.id).join(",")}
              folderId={folderId}
              files={list}
            />
          </div>
        )}
      </div>
    </div>
  );
}
