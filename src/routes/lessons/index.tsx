import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, ChevronRight, Check } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useContent } from "@/hooks/use-content";

export const Route = createFileRoute("/lessons/")({
  head: () => ({ meta: [{ title: "Lessons — HN-AI" }, { name: "description", content: "Short AI lessons, designed for 10-minute sessions." }] }),
  component: LessonsIndex,
});

function LessonsIndex() {
  const user = useUser();
  const { lessons } = useContent();
  return (
    <div className="space-y-6">
      <header className="glass-strong rounded-3xl p-6 border-neon-blue/30">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">Lessons</h1>
        <p className="text-muted-foreground mt-2">Bite-sized AI lessons. Each one is under 12 minutes.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((l) => {
          const done = user.completedLessons.includes(l.id);
          return (
            <Link key={l.id} to="/lessons/$id" params={{ id: l.id }} className="group glass rounded-2xl p-5 hover:border-neon-cyan/50 hover:glow-cyan transition">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-neon-cyan font-semibold">{l.difficulty}</span>
                {done && <span className="inline-flex items-center gap-1 text-xs text-neon-cyan"><Check className="size-4" /> Done</span>}
              </div>
              <h3 className="font-display font-bold text-lg">{l.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{l.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-muted-foreground"><Clock className="size-3" /> {l.duration} min</span>
                <span className="text-neon-orange font-bold">+{l.xpReward} XP <ChevronRight className="size-3 inline" /></span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
