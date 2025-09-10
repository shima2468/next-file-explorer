"use client";

import { CardTone } from "@/lib/types";
import { Upload } from "lucide-react";
export default function HeaderCard({
  number,
  title,
  size,
  tone,
}: {
  number: string;
  title: string;
  size: string;
  tone: CardTone;
}) {
  const tones: Record<CardTone, string> = {
    light: "bg-neutral-50 border-neutral-200",
    mid:   "bg-neutral-100 border-neutral-300",
    dark:  "bg-neutral-200 border-neutral-400",
  };

  return (
    <div
      className={[
        "relative rounded-[24px] border p-4 shadow-sm",
        "aspect-[5/6] sm:aspect-[4/5] md:aspect-[4/5]",
        tones[tone],
        "hover:shadow-md transition",
      ].join(" ")}
    >
      <div className="text-[11px] text-neutral-500">{number}</div>
      <Upload className="absolute left-1/2 top-10 md:top-12 h-14 w-14 md:h-16 md:w-16 -translate-x-1/2 text-neutral-500/30 opacity-40" />
      <div className="absolute bottom-4 left-4 right-4">
        <div className="font-medium text-sm md:text-base truncate text-neutral-800">{title}</div>
        <div className="text-xs text-neutral-600">{size}</div>
      </div>
    </div>
  );
}
