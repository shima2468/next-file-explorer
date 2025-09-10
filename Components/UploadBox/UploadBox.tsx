"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import type { UploadBoxProps } from "@/lib/types";

export default function UploadBox({ folderId }: UploadBoxProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const upload = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files || []);
    if (list.length === 0) return;

    const tasks = list.map(async (file) => {
      const form = new FormData();
      form.append("file", file);
      form.append("name", file.name);

      const p = fetch(`/api/files/${folderId}`, {
        method: "POST",
        body: form,
      }).then(async (res) => {
        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(msg || "Upload failed");
        }
      });

      await toast.promise(p, {
        pending: `Uploading ${file.name}...`,
        success: `Uploaded ${file.name}`,
        error: `Failed: ${file.name}`,
      });
    });

    try {
      await Promise.all(tasks);
      router.refresh();
      setTimeout(() => {
        document
          .getElementById("files-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
    } catch {
    }
  }, [folderId, router]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      void upload(e.target.files);
      e.target.value = "";
    }
  }, [upload]);

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    void upload(e.dataTransfer.files);
  }, [upload]);

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      className={[
        "rounded-2xl border-2 border-dashed p-8 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400",
        dragOver ? "border-blue-400 bg-blue-50/50" : "border-neutral-300",
      ].join(" ")}
      aria-label="Upload files"
    >
      <div className="mb-3 text-sm text-neutral-600">
        Drag & drop files here, or click to browse
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-xl bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800"
      >
        Choose Files
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".png,.jpg,.jpeg,.gif,.webp,.mp4,.pdf"
        onChange={onInputChange}
        className="hidden"
      />

      <p className="mt-2 text-xs text-neutral-500">
        Supported: PNG, JPG, MP4, PDF (max 10MB each)
      </p>
    </div>
  );
}
