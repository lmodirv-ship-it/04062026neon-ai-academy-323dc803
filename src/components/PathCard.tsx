import * as Icons from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { LearningPath } from "@/lib/data/mockData";

const colorMap: Record<string, { glow: string; border: string; bg: string; text: string; dot: string }> = {
  "neon-blue":   { glow: "glow-blue",   border: "border-neon-blue/40",   bg: "from-neon-blue/15",   text: "text-neon-blue",   dot: "bg-neon-blue" },
  "neon-purple": { glow: "glow-purple", border: "border-neon-purple/40", bg: "from-neon-purple/15", text: "text-neon-purple", dot: "bg-neon-purple" },
  "neon-cyan":   { glow: "glow-cyan",   border: "border-neon-cyan/40",   bg: "from-neon-cyan/15",   text: "text-neon-cyan",   dot: "bg-neon-cyan" },
  "neon-orange": { glow: "glow-orange", border: "border-neon-orange/40", bg: "from-neon-orange/15", text: "text-neon-orange", dot: "bg-neon-orange" },
  "neon-pink":   { glow: "glow-blue",   border: "border-neon-pink/40",   bg: "from-neon-pink/15",   text: "text-neon-pink",   dot: "bg-neon-pink" },
};

export function PathCard({ path }: { path: LearningPath }) {
  const c = colorMap[path.color] ?? colorMap["neon-purple"];
  const Icon = (Icons as unknown as Record<string, React.ElementType>)[path.icon] ?? Icons.Sparkles;
  return (
    <Link
      to="/paths/$slug"
      params={{ slug: path.slug }}
      className={`group relative overflow-hidden glass rounded-2xl p-5 border ${c.border} tilt bg-gradient-to-br ${c.bg} to-transparent scan`}
    >
      {/* corner accent */}
      <div className={`absolute top-0 right-0 size-24 rounded-full ${c.dot} opacity-10 blur-2xl group-hover:opacity-25 transition`} />
      <div className={`relative size-14 rounded-2xl grid place-items-center border ${c.border} bg-background/40 mb-4 group-hover:${c.glow} transition`}>
        <Icon className={`size-7 ${c.text}`} />
      </div>
      <div className={`relative text-[10px] uppercase tracking-[0.18em] ${c.text} font-semibold mb-1`}>{path.difficulty}</div>
      <h3 className="relative font-display font-bold text-lg leading-tight mb-1">{path.title}</h3>
      <div className="relative text-xs text-muted-foreground mb-3">{path.lessons} Lessons</div>
      <p className="relative text-xs text-muted-foreground/90 line-clamp-2">{path.tagline}</p>
      <div className={`relative mt-3 inline-flex items-center gap-1 text-[11px] ${c.text} opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition`}>
        Open path <Icons.ArrowRight className="size-3" />
      </div>
    </Link>
  );
}
