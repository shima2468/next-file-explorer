"use client";
import { usePathname, useRouter } from "next/navigation";
import { Home, FolderOpen, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Brand from "./Brand";
import SectionTitle from "./SectionTitle";
import MenuItem from "./MenuItem";
import StorageWidget from "./StorageWidget";
import QuickActions from "./QuickActions";
import { View } from "@/lib/types";

/* === helpers === */
function detectView(): View {
  const isMobile = window.matchMedia("(max-width: 767px)").matches;
  if (isMobile) return "mobile";
  const isTablet = window.matchMedia("(min-width: 768px) and (max-width: 1023px)").matches;
  if (isTablet) return "tablet";
  return "desktop";
}
const COPYRIGHT_YEAR = new Date().getFullYear(); 

export default function AppSidebar({
  usedBytes = 0,
  quotaBytes = 20 * 1024 * 1024 * 1024,
}: { usedBytes?: number; quotaBytes?: number }) {
  const [view, setView] = useState<View>("desktop");
  const [mounted, setMounted] = useState(false);

  const isMobileLike = view !== "desktop";
  const [drawerOpen, setDrawerOpen] = useState(false); // mobile/tablet
  const [collapsed, setCollapsed] = useState(false);   // desktop

  const pathname = usePathname() || "/";
  const router = useRouter();

  /* mount only */
  useEffect(() => {
    setMounted(true);
    const apply = () => setView(detectView());
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  useEffect(() => {
    if (!mounted || !isMobileLike) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, isMobileLike]);

  useEffect(() => {
    if (!mounted || !isMobileLike) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = drawerOpen ? "hidden" : prev || "";
    return () => { document.body.style.overflow = prev || ""; };
  }, [mounted, isMobileLike, drawerOpen]);

  useEffect(() => {
    if (!mounted) return;
    const onToggle = () => (isMobileLike ? setDrawerOpen(v => !v) : setCollapsed(v => !v));
    const onOpen   = () => (isMobileLike ? setDrawerOpen(true) : setCollapsed(false));
    const onClose  = () => (isMobileLike ? setDrawerOpen(false) : setCollapsed(true));
    window.addEventListener("sidebar:toggle", onToggle);
    window.addEventListener("sidebar:open", onOpen);
    window.addEventListener("sidebar:close", onClose);
    return () => {
      window.removeEventListener("sidebar:toggle", onToggle);
      window.removeEventListener("sidebar:open", onOpen);
      window.removeEventListener("sidebar:close", onClose);
    };
  }, [mounted, isMobileLike]);

  const onLogoClick = useCallback(() => {
    isMobileLike ? setDrawerOpen(v => !v) : setCollapsed(v => !v);
  }, [isMobileLike]);

  const isActive = useCallback(
    (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)),
    [pathname]
  );

  const go = (href: string) => () => {
    router.push(href);
    if (isMobileLike) setDrawerOpen(false);
  };

  const sidebarWidth = useMemo(() => (collapsed ? 76 : 264), [collapsed]);

  const SidebarInner = (
    <div className="flex h-full flex-col bg-white">
      <Brand collapsed={collapsed} onClick={onLogoClick} />

      {!collapsed && <SectionTitle>Navigation</SectionTitle>}
      <nav className="flex-1 overflow-y-auto pb-2">
        <MenuItem icon={<Home size={18} />} label="Dashboard" active={isActive("/")} collapsed={collapsed} onClick={go("/")} />
        <MenuItem icon={<FolderOpen size={18} />} label="Folders"   active={isActive("/folders")} collapsed={collapsed} onClick={go("/folders")} />
        <MenuItem icon={<Clock size={18} />}      label="Recent"    active={isActive("/recent")}  collapsed={collapsed} onClick={go("/recent")} />
      </nav>

      {!collapsed && <SectionTitle>Quick actions</SectionTitle>}
      <QuickActions collapsed={collapsed} />

      <StorageWidget usedBytes={usedBytes} quotaBytes={quotaBytes} collapsed={collapsed} />

      {!collapsed && (
        <div className="mx-3 mb-3 rounded-xl border p-2 text-center text-[12px] text-neutral-500">
          © {COPYRIGHT_YEAR} File Explorer
        </div>
      )}
      {collapsed && (
        <div className="mt-auto flex items-center justify-center py-3">
          <div className="h-2 w-12 rounded-full bg-neutral-200" />
        </div>
      )}
    </div>
  );

  if (!mounted) {
    return (
      <aside
        className="relative hidden lg:block lg:sticky lg:top-3 z-40"
        style={{ width: 264, height: "calc(100dvh - 24px)" }}
        aria-hidden
      >
        <div className="h-full bg-white lg:rounded-2xl lg:border lg:shadow-sm" />
      </aside>
    );
  }

  return (
    <>
      {isMobileLike && drawerOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 lg:hidden" onClick={() => setDrawerOpen(false)} aria-label="Close sidebar" />
      )}

      <aside
        className="relative hidden lg:block lg:sticky lg:top-3 z-40 transition-all"
        style={{ width: sidebarWidth, height: "calc(100dvh - 24px)" }}
        suppressHydrationWarning
      >
        {!isMobileLike && (
          <>
            {!collapsed ? (
              <button type="button" onClick={() => setCollapsed(true)}
                className="absolute -right-3 top-12 z-[55] grid h-7 w-7 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:border-neutral-300"
                title="Collapse">
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={() => setCollapsed(false)}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-[55] grid h-7 w-7 place-items-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm hover:border-neutral-300"
                title="Expand">
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </>
        )}

        <div className="relative h-full bg-white lg:rounded-2xl lg:border lg:shadow-sm overflow-hidden">
          <div className="h-full overflow-y-auto">{SidebarInner}</div>
        </div>
      </aside>

      {isMobileLike && (
        <aside
          className={[
            "fixed inset-y-0 left-0 z-[70] bg-white shadow-xl lg:hidden",
            "transition-transform duration-200",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
          style={{ width: 280 }}
          suppressHydrationWarning
        >
          <div className="h-[100dvh] overflow-y-auto">{SidebarInner}</div>
        </aside>
      )}
    </>
  );
}
