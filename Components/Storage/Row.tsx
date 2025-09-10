"use client";

export default function Row({
  colorClass,
  label,
  value,
}: {
  colorClass: string;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${colorClass}`} />
        <span className="text-neutral-700">{label}</span>
      </div>
      <span className="text-neutral-500">{value}</span>
    </li>
  );
}
