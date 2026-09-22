"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { notifications as initialNotifications } from "@/lib/mock/notifications";
import type { Notification } from "@/lib/mock/types";

interface NotificationsContextValue {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

/**
 * Lifts read/unread state above the topbar bell and the Notification Centre
 * page (both mounted under AdminShell) so the two stay coherent within a
 * session — mock/local state only, nothing is persisted.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>(initialNotifications);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.read).length,
    [items],
  );

  function markAsRead(id: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  function markAllAsRead() {
    setItems((prev) =>
      prev.map((item) => (item.read ? item : { ...item, read: true })),
    );
  }

  const value: NotificationsContextValue = {
    notifications: items,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider",
    );
  }
  return context;
}
