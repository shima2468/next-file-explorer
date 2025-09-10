"use client";

export default function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 pt-3 pb-1 text-[13px] font-semibold text-neutral-500">
      {children}
    </div>
  );
}
