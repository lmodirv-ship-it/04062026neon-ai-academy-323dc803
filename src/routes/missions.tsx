import { createFileRoute, Link } from "@tanstack/react-router";
import { useUser } from "@/hooks/use-user";
import { useContent } from "@/hooks/use-content";
import { completeMission } from "@/lib/services/userService";
import { Check, Flame, Sparkles, ChevronRight, Lock } from "lucide-react";

export const Route = createFileRoute("/missions")({
  head: () => ({ meta: [{ title: "Daily Missions — HN-AI" }, { name: "description", content: "10-minute daily AI missions." }] }),
  component: Missions,
});

function Missions() {
  const user = useUser();
  const { missions } = useContent();
  const today = (new Date().getDate() - 1) % missions.length;

  return (
    <div className="space-y-6">
      <header className="glass-strong rounded-3xl p-6 border-neon-cyan/30 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 size-60 rounded-full bg-neon-cyan/20 blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan text-xs font-semibold mb-3">
          <Flame className="size-3.5" /> 10 Minutes a Day
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">Daily Missions</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">A short, focused mission every day. Keep your streak alive and grow your XP one rep at a time.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {missions.map((m, i) => {
          const done = user.completedMissions.includes(m.id);
          const isToday = i === today;
          const locked = i > today + 1;
          return (
            <div key={m.id} className={`relative glass rounded-2xl p-5 border ${isToday ? "border-neon-cyan/60 glow-cyan" : done ? "border-neon-purple/40" : "border-border/40"} ${locked ? "opacity-40" : ""}`}>
              {isToday && <span className="absolute -top-2 left-4 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-neon-cyan text-black font-bold">Today</span>}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Day {m.day}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-purple/15 text-neon-purple border border-neon-purple/30">{m.category}</span>
              </div>
              <h3 className="font-display font-bold text-lg leading-tight">{m.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-neon-orange font-bold">+{m.reward} XP</span>
                {done ? (
                  <span className="inline-flex items-center gap-1 text-xs text-neon-cyan"><Check className="size-4" /> Completed</span>
                ) : locked ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="size-3" /> Locked</span>
                ) : (
                  <div className="flex items-center gap-2">
                    {m.lessonId && (
                      <Link to="/lessons/$id" params={{ id: m.lessonId }} className="text-xs text-neon-blue hover:underline inline-flex items-center">
                        Open <ChevronRight className="size-3" />
                      </Link>
                    )}
                    <button
                      onClick={() => completeMission(m.id, m.reward)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold hover:scale-105 transition"
                    >
                      <Sparkles className="size-3 inline mr-1" /> Claim
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
