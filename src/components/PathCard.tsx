import * as Icons from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { LearningPath } from "@/lib/data/mockData";

const colorMap: Record<string, { glow: string; border: string; bg: string; text: string }> = {
  "neon-blue":   { glow: "glow-blue",   border: "border-neon-blue/40",   bg: "from-neon-blue/15",   text: "text-neon-blue" },
  "neon-purple": { glow: "glow-purple", border: "border-neon-purple/40", bg: "from-neon-purple/15", text: "text-neon-purple" },
  "neon-cyan":   { glow: "glow-cyan",   border: "border-neon-cyan/40",   bg: "from-neon-cyan/15",   text: "text-neon-cyan" },
  "neon-orange": { glow: "glow-orange", border: "border-neon-orange/40", bg: "from-neon-orange/15", text: "text-neon-orange" },
  "neon-pink":   { glow: "glow-blue",   border: "border-neon-pink/40",   bg: "from-neon-pink/15",   text: "text-neon-pink" },
};

export function PathCard({ path }: { path: LearningPath }) {
  const c = colorMap[path.color] ?? colorMap["neon-purple"];
  const Icon = (Icons as unknown as Record<string, React.ElementType>)[path.icon] ?? Icons.Sparkles;
  return (
    <Link
      to="/paths/$slug"
      params={{ slug: path.slug }}
      className={`group relative overflow-hidden glass rounded-2xl p-5 border ${c.border} hover:scale-[1.02] hover:${c.glow} transition-all duration-300 bg-gradient-to-br ${c.bg} to-transparent`}
    >
      <div className={`size-14 rounded-2xl grid place-items-center border ${c.border} bg-background/40 mb-4 group-hover:${c.glow} transition`}>
        <Icon className={`size-7 ${c.text}`} />
      </div>
      <div className={`text-[11px] uppercase tracking-wider ${c.text} font-semibold mb-1`}>{path.difficulty}</div>
      <h3 className="font-display font-bold text-lg leading-tight mb-1">{path.title}</h3>
      <div className="text-xs text-muted-foreground mb-3">{path.lessons} Lessons</div>
      <p className="text-xs text-muted-foreground/90 line-clamp-2">{path.tagline}</p>
    </Link>
  );
}
