import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Shared branded shell for every pre-Admin auth screen (Login, invited
 * team-member "Set your password") — same logo mark, ambient red glow and
 * card treatment everywhere, so these feel like one product rather than
 * separately-designed screens (see AGENTS pass §24).
 */
export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-graphite px-4 py-12">
      {/* Ambient Complex-red glow — atmospheric, not a solid blob: two soft,
          low-opacity radial gradients offset from center and heavily blurred. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-complex-red/20 blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] h-[420px] w-[420px] rounded-full bg-complex-red/10 blur-[140px]" />
      </div>

      <div className="relative w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/30">
            <Image
              src="/complex-mark.png"
              alt=""
              width={28}
              height={28}
              priority
              className="h-7 w-7 object-contain"
            />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
            <p className="text-sm text-white/50">{description}</p>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-card p-8 shadow-2xl shadow-black/40">
          {children}
        </div>
      </div>
    </div>
  );
}
