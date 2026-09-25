"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { Avatar } from "./Avatar";
import { NotificationPopover } from "./NotificationPopover";
import { ThemeToggle } from "./ThemeToggle";
import { useCurrentUser } from "./CurrentUserProvider";
import { allNavItems } from "./nav-config";
import { signOutAction } from "@/lib/auth/actions";

function currentSectionLabel(pathname: string) {
  if (pathname === "/") return "Dashboard";
  const match = allNavItems.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href),
  );
  return match?.label ?? "";
}

/**
 * The real, current-session team member's name/role/actions — sourced from
 * the same CurrentUserProvider (ultimately requireActiveProfile()) as the
 * Dashboard greeting and Team's "You" identity, so this can never show a
 * stale or wrong person after switching accounts or on hard refresh.
 */
function AccountMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { displayName, roleLabel, initials } = useCurrentUser();
  const firstName = displayName.split(" ")[0];

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-1.5 rounded-md p-1 outline-none transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
      >
        <Avatar initials={initials} size="sm" />
        <span className="hidden text-sm font-medium text-fg sm:inline">
          {firstName}
        </span>
        <ChevronDown
          size={14}
          className={`hidden text-fg-muted transition-transform duration-150 sm:block ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 z-30 mt-1.5 w-56 overflow-hidden rounded-md border border-surface-secondary bg-elevated py-1 shadow-md"
        >
          <div className="border-b border-surface-secondary px-3 py-2.5">
            <p className="truncate text-sm font-medium text-fg">{displayName}</p>
            <p className="truncate text-xs text-fg-muted">{roleLabel}</p>
          </div>
          <Link
            href="/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block w-full px-3 py-2 text-left text-sm text-fg transition-colors duration-150 hover:bg-hover"
          >
            Settings / My profile
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-fg transition-colors duration-150 hover:bg-hover"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const section = currentSectionLabel(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b border-surface-secondary bg-card px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="-ml-1.5 flex h-9 w-9 items-center justify-center rounded-md text-fg hover:bg-hover lg:hidden"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-medium text-fg-muted">{section}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <NotificationPopover />
        <div className="hidden h-6 w-px bg-surface-secondary sm:block" />
        <AccountMenu />
      </div>
    </header>
  );
}
