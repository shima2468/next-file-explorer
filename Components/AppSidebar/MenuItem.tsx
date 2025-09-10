"use client";
import { SidebarMenuItemProps } from "@/lib/types";
import React from "react";
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function MenuItem({ icon, label, active, collapsed, onClick }: SidebarMenuItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cx(
        "group relative my-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition",
        active ? "bg-neutral-100 text-neutral-900 font-semibold" : "text-neutral-800",
        collapsed && "justify-center"
      )}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
    >
      <span
        className={cx(
          "grid h-10 w-10 place-items-center rounded-lg border bg-white",
          active ? "border-neutral-300" : "border-neutral-200 group-hover:border-neutral-300"
        )}
      >
        {icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
      {active && !collapsed && (
        <span className="ml-auto mr-2 h-2 w-2 rounded-full bg-neutral-400" />
      )}
    </div>
  );
}
