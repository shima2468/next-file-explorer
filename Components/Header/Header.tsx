"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import CreateFolderModal from "@/Components/CreateFolderModal/CreateFolderModal";
import { root, type FolderNode } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import MobileEmbla from "./MobileEmbla";
import HeaderCard from "./HeaderCard";
import { containerVariants, listVariants, itemVariants } from "./header.motion";
import { CardTone } from "@/lib/types";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [folders, setFolders] = useState<FolderNode[]>(
    root.children.filter((c): c is FolderNode => c.type === "folder")
  );

  const refreshRoot = async () => {
    try {
      const res = await fetch("/api/folders/root", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const fresh: FolderNode[] = (data.children || []).filter(
        (c: any) => c.type === "folder"
      );
      setFolders(fresh);
    } catch {}
  };

  useEffect(() => {
    void refreshRoot();
  }, []);

  const last3 = useMemo(() => {
    const sorted = [...folders].sort(
      (a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0)
    );
    const three = sorted.slice(0, 3);
    while (three.length < 3) {
      three.push({
        id: `placeholder-${three.length + 1}`,
        name: "Add a folder",
        type: "folder",
        children: [],
      } as FolderNode);
    }
    return three;
  }, [folders]);

  const grayPalette: CardTone[] = ["light", "mid", "dark"];

  return (
    <motion.section
      className="mb-12 mt-2 px-1 sm:px-4 rounded-2xl bg-gradient-to-b from-white to-neutral-50"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <CreateFolderModal
        open={open}
        onClose={() => setOpen(false)}
        parentId="root"
        onCreated={() => void refreshRoot()}
      />

      <div className="grid gap-6 md:grid-cols-12 md:items-center">
        <motion.div className="space-y-3 md:col-span-5" variants={itemVariants}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold leading-loose tracking-wider text-neutral-800">
            Manage your <br className="hidden sm:block" /> folders
          </h1>

          <p className="max-w-md text-neutral-500">
            Create folders to sort files and have quick access to documents
          </p>

          <div className="mt-3 flex md:hidden">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-neutral-100 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-400 transition"
            >
              <Plus className="h-4 w-4" />
              New folder
            </button>
          </div>
        </motion.div>
        <motion.div
          className="hidden md:col-span-1 md:flex"
          variants={itemVariants}
        >
          <button
            onClick={() => setOpen(true)}
            title="Add new folder"
            aria-label="Add new"
            className="mx-auto self-center h-40 md:h-44 lg:h-56 w-11 lg:w-12 rounded-full border-2 border-dashed border-neutral-300 bg-white/80 backdrop-blur-sm grid place-items-center shadow-sm hover:shadow transition hover:bg-white focus-visible:ring-2 focus-visible:ring-neutral-400"
          >
            <Plus className="h-5 w-5 text-neutral-600" />
          </button>
        </motion.div>

        <div className="md:col-span-6">
          <AnimatePresence>
            <motion.div
              key="embla-mobile"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
            >
              <MobileEmbla
                items={last3}
                renderItem={(f, idx) => (
                  <HeaderCard
                    key={f.id + "-mob"}
                    number={(idx + 1).toString().padStart(2, "0")}
                    title={f.name}
                    size={`${f.children?.length ?? 0} item(s)`}
                    tone={grayPalette[idx % grayPalette.length]}
                  />
                )}
              />
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="hidden lg:grid grid-cols-3 gap-4"
            variants={listVariants}
            initial="hidden"
            animate="visible"
          >
            {last3.map((f, idx) => (
              <motion.div key={`${f.id}-md`} variants={itemVariants}>
                <HeaderCard
                  number={(idx + 1).toString().padStart(2, "0")}
                  title={f.name}
                  size={`${f.children?.length ?? 0} item(s)`}
                  tone={grayPalette[idx % grayPalette.length]}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
