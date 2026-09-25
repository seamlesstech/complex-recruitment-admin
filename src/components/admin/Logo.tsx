import Image from "next/image";

/**
 * Genuine Complex Recruitment logo mark (public/complex-mark.png, shared
 * verbatim with complex-recruitment-website's public/ assets) paired with
 * the existing text wordmark. Red-on-transparent, so it reads correctly on
 * both the always-dark sidebar and any future light surface.
 */
export function Logo() {
  return (
    <div className="flex items-center gap-2.5 px-1">
      <Image
        src="/complex-mark.png"
        alt=""
        width={28}
        height={28}
        priority
        className="h-7 w-7 shrink-0 object-contain"
      />
      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-semibold tracking-tight text-white">
          Complex
        </span>
        <span className="text-[11px] font-medium uppercase tracking-widest text-complex-red">
          Admin
        </span>
      </div>
    </div>
  );
}
