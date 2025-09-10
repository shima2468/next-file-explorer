import type { Node, Folder } from "@/lib/types";

export const isFolder = (n: Node): n is Folder => n.type === "folder";
export const isFile = (n: Node): n is Node & { type: "file" } => n.type === "file";

export const sumBytes = (n?: Node): number =>
  !n ? 0 : n.type === "file" ? n.size ?? 0 : (n.children ?? []).reduce((s, c) => s + sumBytes(c), 0);

export const countAllFiles = (n?: Node): number =>
  !n ? 0 : n.type === "file" ? 1 : (n.children ?? []).reduce((s, c) => s + countAllFiles(c), 0);

export const bytesToHuman = (b: number): string => {
  if (!b) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return `${(b / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
};
