import { EmblaOptionsType } from './../node_modules/embla-carousel/cjs/components/Options.d';
import { ReactNode } from "react";

export type Node = {
  id: string;
  name: string;
  type: "folder" | "file";
  size?: number;
  path?: string;
  content?: string | Uint8Array | ArrayBuffer;
  children?: Node[];
};

export type Folder = Node & {
  type: "folder";
  children: Node[];
};

export type UploadBoxProps = {
  folderId: string;
};
export type Sub = {
  id: string;
  name: string;
  type: "folder";
  children: any[];
};

export type FileNode = {
  id: string;
  name: string;
  type: "file";
  size?: number;
  sizeBytes?: number;
};

export type FolderNode = {
  id: string;
  name: string;
  type: "folder";
  children: Array<FileNode | FolderNode>;
};

export type Crumb = { label: string; href?: string; current?: boolean };
export type Size = "sm" | "md" | "lg" | "xl";
export type Tone = "neutral" | "rose" | "sky" | "violet" | "emerald" | "amber";
export type EmptyStateProps = {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  dashed?: boolean;
  className?: string;
  size?: Size;
  tone?: Tone;
};

export type Segment = { key: string; label: string; count?: number };

export type FilterBarProps = {
  showSearch?: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  searchPlaceholder?: string;
  segments?: Segment[];
  segment?: string;
  onSegmentChange?: (key: string) => void;
  sort?: string;
  onSortChange?: (v: string) => void;
  sortOptions?: { value: string; label: string }[];
  layout?: "one" | "two" | "four";
  onLayoutChange?: (v: "one" | "two" | "four") => void;
  busy?: boolean;
  disableWhileBusy?: boolean;
  className?: string;
};

export type Layout = "one" | "two" | "four";
export type CardTone = "light" | "mid" | "dark";
export type MobileEmblaProps<T> = {
  items: T[];
  renderItem: (item: T, idx: number) => React.ReactNode;
  delayMs?: number;
  options?: EmblaOptionsType;
};
export type CreateFolderModalProps = {
  open: boolean;
  onClose: () => void;
  parentId: string;
  onCreated?: (newId: string) => void;
};

export type CreateFolderButtonProps = {
  parentId: string;
  label?: string;
  className?: string;
  title?: string;
  variant?: "dashed-vertical" | "solid" | "outline" | "ghost";
  afterCreate?: (newId: string) => void;
};

export type View = "mobile" | "tablet" | "desktop";

export type SidebarMenuItemProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick?: () => void;
};

export type FileItem = { id: string; name: string; type: "file" };
export type Kind = "document" | "image" | "video" | "other";