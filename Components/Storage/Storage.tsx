"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Row from "./Row";
import type { FileNode, FolderNode, Kind } from "@/lib/types";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

function kindOf(name: string): Kind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (
    [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "bmp",
      "svg",
      "tiff",
      "heic",
    ].includes(ext)
  )
    return "image";
  if (["mp4", "mov", "webm", "mkv", "avi"].includes(ext)) return "video";
  if (
    [
      "pdf",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "xls",
      "xlsx",
      "txt",
      "md",
      "csv",
    ].includes(ext)
  )
    return "document";
  return "other";
}

function flattenFiles(node: FolderNode | FileNode): FileNode[] {
  if ((node as FileNode).type === "file") return [node as FileNode];
  const folder = node as FolderNode;
  return folder.children.flatMap((c) => flattenFiles(c as any));
}

function toGB(nBytes: number) {
  return nBytes / 1024 ** 3;
}
function getFileSizeGB(f: FileNode): number | null {
  if (typeof f.sizeBytes === "number") return toGB(f.sizeBytes);
  if (typeof f.size === "number") return toGB(f.size);
  return null;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};
const donutVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut", delay: 0.05 },
  },
};

function round2(n: number) {
  return Number(n.toFixed(2));
}
function formatGB(n: number) {
  const abs = Math.abs(n);
  if (abs === 0) return "0 GB";
  if (abs < 0.1) return "<0.1 GB";
  if (abs < 1) return `${abs.toFixed(1)} GB`;
  return `${abs.toFixed(2)} GB`;
}

export default function Storage({
  folderId = "root",
  totalCapacityGB = 500,
}: {
  folderId?: string;
  totalCapacityGB?: number;
}) {
  const [root, setRoot] = useState<FolderNode | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/folders/${folderId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (alive) setRoot(json);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, [folderId]);

  const { series, labels, legend, percentExact, percentTarget } =
    useMemo(() => {
      const files = root ? flattenFiles(root) : [];
      const groups: Record<Kind, FileNode[]> = {
        document: [],
        image: [],
        video: [],
        other: [],
      };
      for (const f of files) groups[kindOf(f.name)].push(f);

      const anySizes = files.some((f) => getFileSizeGB(f) !== null);

      const doc = anySizes
        ? groups.document.reduce((s, f) => s + (getFileSizeGB(f) ?? 0), 0)
        : groups.document.length;
      const img = anySizes
        ? groups.image.reduce((s, f) => s + (getFileSizeGB(f) ?? 0), 0)
        : groups.image.length;
      const vid = anySizes
        ? groups.video.reduce((s, f) => s + (getFileSizeGB(f) ?? 0), 0)
        : groups.video.length;

      const used = doc + img + vid;
      const free = Math.max(totalCapacityGB - used, 0);

      const legend = [
        {
          label: "Documents",
          valueText: anySizes ? formatGB(doc) : String(Math.round(doc)),
        },
        {
          label: "Images",
          valueText: anySizes ? formatGB(img) : String(Math.round(img)),
        },
        {
          label: "Videos",
          valueText: anySizes ? formatGB(vid) : String(Math.round(vid)),
        },
        { label: "Free", valueText: formatGB(free) },
      ];

      const total = used + free;
      const percentExact = total > 0 ? (used / total) * 100 : 0;
      const percentTarget =
        percentExact > 0 && percentExact < 0.1 ? 0.1 : percentExact;

      return {
        series: [round2(doc), round2(img), round2(vid), round2(free)],
        labels: ["Documents", "Images", "Videos", "Free"],
        legend,
        percentExact,
        percentTarget,
      };
    }, [root, totalCapacityGB]);

  const [counter, setCounter] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const duration = 600;
    const from = 0;
    const to = percentTarget;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setCounter(from + (to - from) * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [percentTarget]);

  const percentLabel =
    percentExact > 0 && percentExact < 0.1
      ? "<0.1%"
      : percentExact < 10
      ? `${percentExact.toFixed(1)}%`
      : `${Math.round(percentExact)}%`;

  const GRAYS = ["#111827", "#6B7280", "#9CA3AF", "#E5E7EB"];
  const options: any = {
    chart: { type: "donut", toolbar: { show: false }, foreColor: "#6B7280" },
    labels,
    legend: { show: false },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    colors: GRAYS,
    plotOptions: {
      pie: {
        donut: { size: "72%" },
        startAngle: -90,
        endAngle: 270,
        customScale: 0.999,
      },
    },
    tooltip: {
      theme: "light",
      y: { formatter: (v: number) => formatGB(v) },
    },
  };

  return (
    <motion.section
      className="rounded-2xl bg-white border border-neutral-200 p-6 shadow-sm"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h2 className="mb-4 text-xl font-semibold text-neutral-900">
        Storage Overview
      </h2>

      <motion.div
        className="relative mx-auto flex max-w-xs items-center justify-center sm:max-w-none"
        variants={donutVariants}
        initial="hidden"
        animate="visible"
      >
        <ReactApexChart
          options={options}
          series={series}
          type="donut"
          width={240}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-extrabold text-neutral-900">
            {percentLabel}
          </span>
        </div>
      </motion.div>

      <ul className="mt-6 grid grid-cols-1 gap-y-3 text-sm sm:auto-cols-fr sm:grid-flow-col sm:grid-rows-2 sm:gap-x-8">
        {legend.map((row, i) => (
          <Row
            key={row.label}
            colorClass={
              [
                "bg-neutral-800",
                "bg-neutral-500",
                "bg-neutral-400",
                "bg-neutral-200",
              ][i]
            }
            label={row.label}
            value={row.valueText}
          />
        ))}
      </ul>
    </motion.section>
  );
}
