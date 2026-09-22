import { Workflow } from "lucide-react";
import { Avatar } from "@/components/admin/Avatar";

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ActorAvatar({ actor }: { actor: string }) {
  if (actor === "System") {
    return (
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-secondary text-fg-muted"
        aria-hidden="true"
      >
        <Workflow size={13} strokeWidth={2} />
      </div>
    );
  }

  return <Avatar initials={initialsFor(actor)} size="sm" />;
}
