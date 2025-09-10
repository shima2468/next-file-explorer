import type { ReactNode } from "react";
import AppSidebar from "@/Components/AppSidebar/AppSidebar";
import Navbar from "@/Components/Navbar/Navbar";
import { findFolder } from "@/lib/data";
import type { Node } from "@/lib/types";
import { isFolder, sumBytes } from "@/lib/utils/storage";

const QUOTA = 20 * 1024 * 1024 * 1024;
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const root = findFolder("root") as Node | undefined;
  const folders = (root?.children ?? []).filter(isFolder);
  const usedBytes = folders.reduce((s, f) => s + sumBytes(f), 0);
  const quotaBytes = Math.max(1, folders.length) * QUOTA;

  return (
    <div className="grid min-h-screen grid-cols-[auto,1fr] gap-3 p-3">
      <AppSidebar usedBytes={usedBytes} quotaBytes={quotaBytes} />
      <main className="rounded-2xl border bg-white shadow-sm overflow-hidden">
        <Navbar />
        <div className="px-4 lg:px-8 py-6">{children}</div>
      </main>
    </div>
  );
}

