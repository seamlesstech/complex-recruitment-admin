"use client";

import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { Avatar } from "./Avatar";
import { NotificationPopover } from "./NotificationPopover";
import { ThemeToggle } from "./ThemeToggle";
import { useCurrentUser } from "./CurrentUserProvider";
import { allNavItems } from "./nav-config";

function currentSectionLabel(pathname: string) {
  if (pathname === "/") return "Dashboard";
  const match = allNavItems.find(
    (item) => item.href !== "/" && pathname.startsWith(item.href),
  );
  return match?.label ?? "";
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const section = currentSectionLabel(pathname);
  const { displayName, initials } = useCurrentUser();
  const firstName = displayName.split(" ")[0];

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
        <div className="flex items-center gap-1.5">
          <Avatar initials={initials} size="sm" />
          <span className="hidden text-sm font-medium text-fg sm:inline">
            {firstName}
          </span>
          <ChevronDown size={14} className="hidden text-fg-muted sm:block" />
        </div>
      </div>
    </header>
  );
}
