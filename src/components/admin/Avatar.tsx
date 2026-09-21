interface AvatarProps {
  initials: string;
  size?: "sm" | "md";
}

export function Avatar({ initials, size = "md" }: AvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-chip-strong text-chip-strong-fg ${
        size === "sm"
          ? "h-7 w-7 text-[11px]"
          : "h-9 w-9 text-xs"
      } font-medium tracking-wide`}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
