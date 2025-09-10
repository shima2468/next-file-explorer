"use client";
export default function Loader({
  label,
  fullScreen,
  overlay,
  size = 28,
  className = "",
}: {
  label?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  size?: number;
  className?: string;
}) {
  const wrapper =
    fullScreen
      ? "fixed inset-0 z-[999] grid place-items-center bg-white/60 backdrop-blur-[1px]"
      : overlay
      ? "absolute inset-0 z-[999] grid place-items-center bg-white/60 backdrop-blur-[1px]"
      : "";

  const border = Math.max(2, Math.round(size * 0.12));

  const body = (
    <div className={`inline-flex flex-col items-center gap-2 ${className}`} role="status" aria-live="polite">
      <div
        className="animate-spin rounded-full border-neutral-300 border-t-neutral-800"
        style={{ width: size, height: size, borderWidth: border }}
      />
      {label ? <div className="text-sm text-neutral-600 select-none">{label}</div> : null}
    </div>
  );

  if (fullScreen || overlay) return <div className={wrapper}>{body}</div>;
  return body;
}
