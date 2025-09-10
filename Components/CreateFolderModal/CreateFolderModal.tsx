"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { CreateFolderModalProps } from "@/lib/types";

export default function CreateFolderModal({
  open,
  onClose,
  parentId,
  onCreated,
}: CreateFolderModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const to = setTimeout(() => inputRef.current?.focus(), 0);

    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);

    return () => {
      document.body.style.overflow = prev;
      clearTimeout(to);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Please enter a folder name.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/folders/${parentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || "Request failed");
      }

      const json = (await res.json().catch(() => ({}))) as { id?: string };
      toast.success("Folder created");

      onCreated?.(json?.id ?? "");
      setName("");
      onClose();
      router.refresh();
    } catch {
      toast.error("Failed to create folder.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        className="absolute inset-0 grid place-items-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <form
          onSubmit={submit}
          className="w-full max-w-md overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <h3 className="text-base font-semibold text-neutral-900">
              New folder
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 hover:bg-neutral-100"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-neutral-500" />
            </button>
          </div>

          <div className="space-y-3 px-5 pb-5 pt-1">
            <label className="block text-sm font-medium text-neutral-700">
              Folder name
            </label>
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design"
              disabled={loading}
              className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-800 focus:ring-2 focus:ring-neutral-800/20"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-800 disabled:opacity-50"
              >
                {loading ? "Creating…" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
