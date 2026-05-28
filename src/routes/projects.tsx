import { createFileRoute } from "@tanstack/react-router";
import { miniProjects } from "@/lib/data/mockData";
import { useUser } from "@/hooks/use-user";
import { completeProject } from "@/lib/services/userService";
import { Check, Rocket } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects")({
  head: () => ({ meta: [{ title: "Mini Projects — HN-AI" }, { name: "description", content: "Build tiny AI projects and ship them in a weekend." }] }),
  component: Projects,
});

function Projects() {
  const user = useUser();
  return (
    <div className="space-y-6">
      <header className="glass-strong rounded-3xl p-6 border-neon-orange/30 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 size-60 rounded-full bg-neon-orange/20 blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-orange/15 border border-neon-orange/40 text-neon-orange text-xs font-semibold mb-3">
          <Rocket className="size-3.5" /> Ship Something Tiny
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">Mini Projects</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">Small, real builds that take hours, not weeks. Pick one and ship.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {miniProjects.map((p) => {
          const done = user.completedProjects.includes(p.id);
          return (
            <div key={p.id} className="glass rounded-2xl p-5 border-neon-blue/20 hover:border-neon-blue/50 transition flex flex-col">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-neon-purple/20 via-neon-blue/15 to-neon-cyan/20 border border-neon-purple/30 grid place-items-center text-6xl mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,oklch(0.65_0.27_305/0.35),transparent_60%)]" />
                <span className="relative">{p.emoji}</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase tracking-wider text-neon-cyan font-semibold">{p.difficulty}</span>
                <span className="text-xs text-neon-orange font-bold">+{p.xpReward} XP</span>
              </div>
              <h3 className="font-display font-bold text-lg">{p.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 flex-1">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 text-[10px] rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/30">{t}</span>
                ))}
              </div>
              <button
                disabled={done}
                onClick={() => {
                  completeProject(p.id, p.xpReward);
                  toast.success(`Project shipped! +${p.xpReward} XP`);
                }}
                className="mt-4 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-neon-orange to-neon-pink text-black font-semibold text-sm hover:scale-[1.02] transition disabled:opacity-50"
              >
                {done ? <span className="inline-flex items-center gap-1 justify-center"><Check className="size-4" /> Shipped</span> : "Start Project"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
