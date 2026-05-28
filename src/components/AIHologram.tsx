import { Sparkles } from "lucide-react";

/** Cinematic AI hologram orb — pure CSS, no deps. */
export function AIHologram({ size = 280 }: { size?: number }) {
  return (
    <div
      className="relative mx-auto float"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* outer rings */}
      <div className="absolute inset-0 rounded-full border border-neon-cyan/30 animate-[hologramSpin_28s_linear_infinite]" />
      <div className="absolute inset-4 rounded-full border border-dashed border-neon-purple/40 animate-[hologramSpin_18s_linear_infinite_reverse]" />
      <div className="absolute inset-8 rounded-full border border-neon-blue/30 animate-[hologramSpin_36s_linear_infinite]" />

      {/* orb */}
      <div className="absolute inset-[18%] hologram" />

      {/* core */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="size-14 rounded-2xl glass-strong border-neon-cyan/40 grid place-items-center glow-cyan">
          <Sparkles className="size-7 text-neon-cyan" />
        </div>
      </div>

      {/* orbiting dots */}
      <div className="absolute inset-0 animate-[hologramSpin_12s_linear_infinite]">
        <span className="absolute left-1/2 -top-1.5 size-3 rounded-full bg-neon-cyan shadow-[0_0_18px_oklch(0.86_0.16_200_/0.9)]" />
      </div>
      <div className="absolute inset-0 animate-[hologramSpin_20s_linear_infinite_reverse]">
        <span className="absolute -left-1.5 top-1/2 size-2.5 rounded-full bg-neon-purple shadow-[0_0_16px_oklch(0.65_0.27_305_/0.9)]" />
      </div>
    </div>
  );
}
