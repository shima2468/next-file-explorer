"use client";
import { FileText } from "lucide-react";
function middleTruncate(filename: string, max = 48) {
  if (filename.length <= max) return filename;
  const dot = filename.lastIndexOf(".");
  const ext = dot > -1 ? filename.slice(dot) : "";
  const base = dot > -1 ? filename.slice(0, dot) : filename;
  const keep = Math.max(3, max - ext.length - 1);
  const head = Math.ceil(keep * 0.6);
  const tail = keep - head;
  return `${base.slice(0, head)}…${base.slice(-tail)}${ext}`;
}

export default function FileRow({
  name,
  date,
  maxNameChars,
}: {
  name: string;
  date: string;
  maxNameChars: number;
}) {
  const display = middleTruncate(name, maxNameChars);

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex flex-1 min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100">
          <FileText className="h-4 w-4 text-gray-600" />
        </div>
        <span className="truncate max-w-full text-sm text-gray-800" title={name}>
          {display}
        </span>
      </div>
      <span className="shrink-0 text-xs text-gray-500">{date}</span>
    </div>
  );
}
