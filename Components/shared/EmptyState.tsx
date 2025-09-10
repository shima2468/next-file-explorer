import { Inbox } from "lucide-react";
import { EmptyStateProps, Size, Tone } from "@/lib/types";


export default function EmptyState({
  title = "Nothing here yet",
  subtitle = "Try creating or uploading something.",
  icon,
  action,
  dashed = false,
  className = "",
  size = "lg",
  tone = "neutral",
}: EmptyStateProps) {
  const pad: Record<Size, string> = {
    sm: "p-6",
    md: "p-8",
    lg: "p-10",
    xl: "p-12",
  };

  const gapTitle: Record<Size, string> = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const subSize: Record<Size, string> = {
    sm: "text-sm",
    md: "text-sm",
    lg: "text-base",
    xl: "text-base",
  };

  const iconBox: Record<Size, string> = {
    sm: "h-12 w-12",
    md: "h-14 w-14",
    lg: "h-16 w-16",
    xl: "h-20 w-20",
  };

  const iconSize: Record<Size, string> = {
    sm: "h-6 w-6",
    md: "h-7 w-7",
    lg: "h-8 w-8",
    xl: "h-10 w-10",
  };

  const toneStyles: Record<Tone, { box: string; icon: string; ring: string }> = {
    neutral: { box: "bg-neutral-50", icon: "text-neutral-600", ring: "ring-neutral-200/70" },
    rose:    { box: "bg-rose-50",    icon: "text-rose-600",    ring: "ring-rose-200/70" },
    sky:     { box: "bg-sky-50",     icon: "text-sky-600",     ring: "ring-sky-200/70" },
    violet:  { box: "bg-violet-50",  icon: "text-violet-600",  ring: "ring-violet-200/70" },
    emerald: { box: "bg-emerald-50", icon: "text-emerald-600", ring: "ring-emerald-200/70" },
    amber:   { box: "bg-amber-50",   icon: "text-amber-600",   ring: "ring-amber-200/70" },
  };

  const t = toneStyles[tone];

  return (
    <div
      role="status"
      className={[
        "flex flex-col items-center justify-center rounded-3xl bg-white text-center",
        "border border-neutral-200 shadow-sm",
        dashed ? "border-dashed" : "",
        pad[size],
        className,
      ].join(" ")}
    >
      <div
        className={[
          "mb-4 grid place-items-center rounded-full",
          iconBox[size],
          t.box,
          "ring-1", t.ring, "shadow-xs",
        ].join(" ")}
      >
        {icon ?? <Inbox className={[iconSize[size], t.icon].join(" ")} />}
      </div>

      <div className={["font-semibold text-neutral-900", gapTitle[size]].join(" ")}>
        {title}
      </div>

      {subtitle && (
        <div className={["mt-1 text-neutral-600", subSize[size]].join(" ")}>
          {subtitle}
        </div>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
