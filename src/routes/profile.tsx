import { createFileRoute } from "@tanstack/react-router";
import { useUser } from "@/hooks/use-user";
import { getLevelInfo, resetUser } from "@/lib/services/userService";
import { Crown, Star, Flame, BookOpen, Rocket, Award, Trash2 } from "lucide-react";
import { learningPaths } from "@/lib/data/mockData";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — HN-AI" }, { name: "description", content: "Your AI learning profile, badges, and stats." }] }),
  component: Profile,
});

const allBadges = ["First Steps", "Prompt Master", "AI Beginner", "Automation Starter", "Daily Learner", "7 Days Streak", "AI Creator"];

function Profile() {
  const user = useUser();
  const lvl = getLevelInfo(user.xp);
  const currentPath = learningPaths[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Hero card */}
      <div className="glass-strong rounded-3xl p-6 sm:p-8 border-neon-purple/40 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 size-72 rounded-full bg-neon-purple/20 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="size-24 rounded-3xl bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center text-4xl glow-purple">
            👑
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="text-xs uppercase tracking-wider text-neon-cyan font-semibold">Level {lvl.level}</div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl">{user.name}</h1>
            <div className="text-muted-foreground text-sm">{user.email}</div>
            <div className="mt-3 h-2 w-full sm:w-80 rounded-full bg-background/50 overflow-hidden mx-auto sm:mx-0">
              <div className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan shimmer" style={{ width: `${lvl.pct}%` }} />
            </div>
            <div className="text-xs text-muted-foreground mt-1">{user.xp.toLocaleString()} / {lvl.nextXp.toLocaleString()} XP — {lvl.name}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <Star className="size-5" />, label: "Total XP", value: user.xp.toLocaleString(), c: "neon-orange" },
          { icon: <Flame className="size-5" />, label: "Streak", value: `${user.streak}d`, c: "neon-pink" },
          { icon: <BookOpen className="size-5" />, label: "Lessons", value: user.completedLessons.length, c: "neon-cyan" },
          { icon: <Rocket className="size-5" />, label: "Projects", value: user.completedProjects.length, c: "neon-purple" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-2xl p-4 text-center">
            <div className="mx-auto size-10 rounded-xl grid place-items-center mb-2 border" style={{ color: `var(--${s.c})`, borderColor: `oklch(from var(--${s.c}) l c h / 0.4)`, background: `oklch(from var(--${s.c}) l c h / 0.15)` }}>
              {s.icon}
            </div>
            <div className="font-display font-extrabold text-2xl">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Current path */}
      <div className="glass rounded-2xl p-5 border-neon-blue/30">
        <div className="text-xs uppercase tracking-wider text-neon-blue font-semibold mb-2">Current Path</div>
        <div className="font-display font-bold text-xl">{currentPath.title}</div>
        <p className="text-sm text-muted-foreground">{currentPath.description}</p>
      </div>

      {/* Badges */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Award className="size-5 text-neon-orange" />
          <h2 className="font-display font-bold text-xl">Badges</h2>
          <span className="text-xs text-muted-foreground ml-1">{user.badges.length}/{allBadges.length}</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {allBadges.map((b) => {
            const earned = user.badges.includes(b as never);
            return (
              <div key={b} className={`text-center glass rounded-xl p-3 transition ${earned ? "border-neon-orange/50 glow-orange" : "opacity-40"}`}>
                <div className="text-3xl mb-1">{earned ? "🏆" : "🔒"}</div>
                <div className="text-[10px] font-semibold leading-tight">{b}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger zone */}
      <div className="glass rounded-2xl p-5 border-destructive/30">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-display font-bold">Reset Progress</div>
            <div className="text-xs text-muted-foreground">Clear your XP, streak, badges, and completed items.</div>
          </div>
          <button onClick={() => { if (confirm("Reset all progress?")) resetUser(); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-sm hover:bg-destructive/10">
            <Trash2 className="size-4" /> Reset
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        <Crown className="inline size-3 text-neon-orange" /> HN-AI · Connect to HN-DB later for cloud sync.
      </div>
    </div>
  );
}
