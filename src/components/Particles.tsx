import { useMemo } from "react";

interface ParticlesProps {
  count?: number;
  className?: string;
}

/** Lightweight CSS-only floating particles. Use inside a `relative overflow-hidden` parent. */
export function Particles({ count = 22, className = "" }: ParticlesProps) {
  const items = useMemo(() => {
    const colors = [
      "oklch(0.86 0.16 200 / 0.9)",
      "oklch(0.72 0.22 245 / 0.9)",
      "oklch(0.65 0.27 305 / 0.85)",
      "oklch(0.78 0.18 55 / 0.85)",
    ];
    return Array.from({ length: count }).map((_, i) => {
      const size = 2 + Math.random() * 4;
      return {
        id: i,
        left: Math.random() * 100,
        bottom: -10 - Math.random() * 30,
        size,
        dx: (Math.random() - 0.5) * 80,
        duration: 14 + Math.random() * 18,
        delay: -Math.random() * 20,
        color: colors[i % colors.length],
        blur: Math.random() > 0.6 ? "blur(1px)" : "none",
      };
    });
  }, [count]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {items.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
            filter: p.blur,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            // @ts-expect-error - CSS custom prop
            "--dx": `${p.dx}px`,
          }}
        />
      ))}
    </div>
  );
}
