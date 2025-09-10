import { Crumb } from "@/lib/types";
import Link from "next/link";

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-neutral-600">
      <ol className="flex items-center gap-2">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {it.href && !it.current ? (
              <Link
                href={it.href}
                className="rounded-md px-2 py-1 hover:bg-neutral-100 hover:text-neutral-900"
              >
                {it.label}
              </Link>
            ) : (
              <span
                className={`rounded-md ${
                  it.current
                    ? "bg-neutral-50 font-medium text-neutral-800 px-2 py-1"
                    : ""
                }`}
              >
                {it.label}
              </span>
            )}
            {idx < items.length - 1 && (
              <span className="text-neutral-400">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
