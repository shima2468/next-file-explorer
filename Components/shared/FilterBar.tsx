"use client";
import { FilterBarProps } from "@/lib/types";
import { Search, LayoutGrid, Grid2X2, Rows } from "lucide-react";
import { useId } from "react";

export default function FilterBar({
  showSearch = true,
  query,
  onQueryChange,
  searchPlaceholder = "Search…",

  segments = [],
  segment,
  onSegmentChange,

  sort,
  onSortChange,
  sortOptions,

  layout,
  onLayoutChange,

  busy = false,
  disableWhileBusy = false,
  className = "",
}: FilterBarProps) {
  const inputId = useId();
  const disabled = disableWhileBusy && busy;

  const showSort =
    typeof sort !== "undefined" &&
    typeof onSortChange === "function" &&
    Array.isArray(sortOptions) &&
    sortOptions.length > 0;

  return (
    <div
      className={[
        "flex flex-wrap items-center gap-2",
        "sm:gap-3",
        className,
      ].join(" ")}
      aria-busy={busy ? "true" : "false"}
    >
      {showSearch && (
        <div className="relative flex-[1_1_260px] min-w-[220px] max-w-full">
          <label htmlFor={inputId} className="sr-only">
            Search
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            id={inputId}
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className={[
              "w-full rounded-xl border border-neutral-300 bg-white pl-9 pr-9 py-2",
              "text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-800/20",
            ].join(" ")}
          />
        </div>
      )}
      {segments.length > 0 && (
        <div
          role="tablist"
          aria-label="Segments"
          className={[
            "flex flex-wrap items-center gap-px",
            "rounded-xl border border-neutral-300 bg-white",
            "flex-[0_1_auto]",
          ].join(" ")}
        >
          {segments.map((s) => {
            const active = segment === s.key;
            return (
              <button
                key={s.key}
                role="tab"
                aria-selected={active}
                onClick={() => onSegmentChange?.(s.key)}
                disabled={disabled}
                className={[
                  "px-3 py-2 text-sm transition whitespace-nowrap",
                  active
                    ? "bg-neutral-100 text-black"
                    : "bg-white text-black hover:bg-neutral-50",
                ].join(" ")}
                type="button"
              >
                {s.label}
                {typeof s.count === "number" && (
                  <span className="ml-1 text-xs opacity-70 text-black">
                    ({s.count})
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showSort && (
        <div className="flex items-center gap-2 flex-[0_0_auto]">
          <label className="text-sm text-neutral-600">Sort by:</label>
          <select
            value={sort}
            onChange={(e) => onSortChange?.(e.target.value)}
            disabled={disabled}
            className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-800/20"
          >
            {sortOptions!.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {onLayoutChange && (
        <div className="flex overflow-hidden rounded-xl border border-neutral-300 bg-white flex-[0_0_auto]">
          <button
            title="One per row"
            onClick={() => onLayoutChange("one")}
            disabled={disabled}
            className={[
              "px-2 py-2",
              layout === "one"
                ? "bg-neutral-100 text-black"
                : "hover:bg-neutral-50",
            ].join(" ")}
            type="button"
          >
            <Rows className="h-4 w-4" />
          </button>
          <button
            title="Two per row"
            onClick={() => onLayoutChange("two")}
            disabled={disabled}
            className={[
              "px-2 py-2",
              layout === "two"
                ? "bg-neutral-100 text-black"
                : "hover:bg-neutral-50",
            ].join(" ")}
            type="button"
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button
            title="Four per row"
            onClick={() => onLayoutChange("four")}
            disabled={disabled}
            className={[
              "px-2 py-2",
              layout === "four"
                ? "bg-neutral-100 text-black"
                : "hover:bg-neutral-50",
            ].join(" ")}
            type="button"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
