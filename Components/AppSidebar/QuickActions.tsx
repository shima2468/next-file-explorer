"use client";

export default function QuickActions({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) return null;

  return (
    <div className="px-3 pb-3">
      <button
        type="button"
        className="w-full relative rounded-xl border border-neutral-200 bg-white p-3 text-left hover:border-neutral-300"
        title="New folder"
        onClick={() => window.dispatchEvent(new CustomEvent("open:createFolder"))}
      >
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-neutral-100 ring-1 ring-inset ring-neutral-200">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h5l2 2h9v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </span>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-semibold">New folder</div>
            <div className="text-[12px] text-neutral-500">Organize your files</div>
          </div>
        </div>
      </button>
    </div>
  );
}
