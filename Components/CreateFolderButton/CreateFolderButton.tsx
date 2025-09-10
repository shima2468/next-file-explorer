"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import CreateFolderModal from "@/Components/CreateFolderModal/CreateFolderModal";
import { CreateFolderButtonProps } from "@/lib/types";


export default function CreateFolderButton({
  parentId,
  label = "+ Folder",
  className = "",
  title = "Create folder",
  variant = "solid",
  afterCreate,
}: CreateFolderButtonProps) {
  const [open, setOpen] = useState(false);

  const baseBtnProps = {
    onClick: () => setOpen(true),
    title,
    "aria-label": title,
  };

  const baseCls =
    variant === "dashed-vertical"
      ? "grid h-56 w-14 place-items-center rounded-full border-2 border-dashed border-rose-300 text-rose-500 hover:bg-rose-50"
      : variant === "outline"
      ? "inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
      : variant === "ghost"
      ? "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-800 hover:bg-neutral-50"
      : "inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white hover:bg-neutral-800";

  return (
    <>
      <button {...baseBtnProps} className={`${baseCls} ${className}`}>
        <Plus
          className={variant === "dashed-vertical" ? "h-5 w-5" : "h-4 w-4"}
        />
        {variant !== "dashed-vertical" && <span>{label}</span>}
      </button>

      <CreateFolderModal
        open={open}
        onClose={() => setOpen(false)}
        parentId={parentId}
        onCreated={(newId) => {
          afterCreate?.(newId);
          setOpen(false);
        }}
      />
    </>
  );
}
