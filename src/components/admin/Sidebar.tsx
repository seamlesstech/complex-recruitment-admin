"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronUp, X } from "lucide-react";
import { Logo } from "./Logo";
import { Avatar } from "./Avatar";
import {
  bottomNavItems,
  mainNavItems,
  managementNavItems,
  type NavItem,
} from "./nav-config";
import { useCurrentUser } from "./CurrentUserProvider";
import { signOutAction } from "@/lib/auth/actions";

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red ${
        active
          ? "bg-white/5 text-white"
          : "text-white/55 hover:bg-white/5 hover:text-white/85"
      }`}
    >
      {active ? (
        <span
          className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-complex-red"
          aria-hidden="true"
        />
      ) : null}
      <Icon size={18} strokeWidth={1.75} className="shrink-0" />
      <span>{item.label}</span>
    </Link>
  );
}

function NavSection({
  label,
  items,
  pathname,
}: {
  label?: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {label ? (
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-white/35">
          {label}
        </p>
      ) : null}
      {items.map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={isActive(pathname, item.href)}
        />
      ))}
    </div>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [accountOpen, setAccountOpen] = useState(false);
  const { displayName, initials, roleLabel } = useCurrentUser();

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-graphite/60 lg:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-6">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-md p-1.5 text-white/60 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav
          aria-label="Main navigation"
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 py-6"
        >
          <NavSection label="Main" items={mainNavItems} pathname={pathname} />
          <NavSection
            label="Management"
            items={managementNavItems}
            pathname={pathname}
          />
          <div className="mt-auto flex flex-col gap-0.5 pt-6">
            <NavSection items={bottomNavItems} pathname={pathname} />
          </div>
        </nav>

        <div className="relative border-t border-white/10 p-3">
          {accountOpen ? (
            <div className="absolute inset-x-3 bottom-[calc(100%+4px)] overflow-hidden rounded-md border border-white/10 bg-sidebar shadow-lg">
              <Link
                href="/settings"
                onClick={() => setAccountOpen(false)}
                className="block w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
              >
                Profile settings
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5 hover:text-white"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setAccountOpen((open) => !open)}
            aria-expanded={accountOpen}
            className="flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors duration-150 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red"
          >
            <Avatar initials={initials} size="sm" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium text-white">
                {displayName}
              </span>
              <span className="truncate text-xs text-white/50">
                {roleLabel}
              </span>
            </span>
            <ChevronUp
              size={16}
              className={`shrink-0 text-white/50 transition-transform duration-150 ${
                accountOpen ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>
      </aside>
    </>
  );
}
