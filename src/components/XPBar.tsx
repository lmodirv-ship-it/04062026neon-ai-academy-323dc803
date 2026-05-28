import { useEffect, useState } from "react";

interface XPBarProps {
  value: number; // 0..100
  height?: number;
  showShine?: boolean;
  className?: string;
}

/** Smoothly animates from 0 to value on mount for a satisfying fill. */
export function XPBar({ value, height = 8, showShine = true, className = "" }: XPBarProps) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(Math.max(0, Math.min(100, value))), 60);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div
      className={`relative rounded-full bg-background/60 overflow-hidden border border-border/50 ${className}`}
      style={{ height }}
    >
      <div className="absolute inset-y-0 left-0 xp-fill rounded-full" style={{ width: `${w}%` }} />
      {showShine && (
        <div className="absolute inset-0 shimmer rounded-full opacity-70 pointer-events-none" />
      )}
    </div>
  );
}
