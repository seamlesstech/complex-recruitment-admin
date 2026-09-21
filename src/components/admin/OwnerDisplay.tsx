import { Avatar } from "@/components/admin/Avatar";

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function OwnerDisplay({ owner }: { owner: string | null }) {
  if (!owner) {
    return <span className="text-fg-muted">Unassigned</span>;
  }

  return (
    <span className="flex items-center gap-2">
      <Avatar initials={initialsFor(owner)} size="sm" />
      <span className="text-fg">{owner}</span>
    </span>
  );
}
