"use client";

function bytesToHuman(b = 0) {
  if (!b) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / Math.pow(1024, i)).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export default function StorageWidget({
  usedBytes = 0,
  quotaBytes = 20 * 1024 * 1024 * 1024,
  collapsed = false,
}: {
  usedBytes?: number;
  quotaBytes?: number;
  collapsed?: boolean;
}) {
  const pct = quotaBytes > 0 ? (usedBytes / quotaBytes) * 100 : 0;
  const barPct = Math.min(100, usedBytes > 0 && pct < 0.5 ? 0.5 : pct);
  const pctLabel = pct > 0 && pct < 0.1 ? "<0.1%" : pct < 1 ? `${pct.toFixed(1)}%` : `${Math.round(pct)}%`;

  return (
    <div className="mx-3 mb-3 rounded-2xl border border-neutral-200 bg-white p-3">
      {!collapsed && (
        <div className="text-xs text-neutral-600 flex items-center justify-between">
          <span>Storage used</span>
          <span>{pctLabel}</span>
        </div>
      )}
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-100" role="progressbar" aria-valuenow={Math.round(Math.min(100, pct))} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-neutral-800 transition-[width]" style={{ width: `${barPct}%` }} />
      </div>
      {!collapsed && (
        <div className="mt-2 text-sm font-semibold text-neutral-900">
          {bytesToHuman(usedBytes)} / {bytesToHuman(quotaBytes)}
        </div>
      )}
    </div>
  );
}
