import { createFileRoute } from "@tanstack/react-router";
import { leaderboard } from "@/lib/data/mockData";
import { useUser } from "@/hooks/use-user";
import { getLevelInfo } from "@/lib/services/userService";
import { Crown, Flame, Trophy } from "lucide-react";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — HN-AI" }, { name: "description", content: "Top learners ranked by XP and streak." }] }),
  component: Leaderboard,
});

function Leaderboard() {
  const user = useUser();
  const lvl = getLevelInfo(user.xp);
  const me = { id: "me", name: user.name, avatar: "👑", xp: user.xp, level: lvl.level, streak: user.streak, country: "🌐" };
  const ranked = [...leaderboard, me].sort((a, b) => b.xp - a.xp);
  const myRank = ranked.findIndex((r) => r.id === "me") + 1;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="glass-strong rounded-3xl p-6 border-neon-orange/30 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.78_0.18_55/0.35),transparent_60%)]" />
        <Trophy className="size-12 text-neon-orange mx-auto glow-orange" />
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight mt-3">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">You're currently rank <span className="text-neon-cyan font-bold">#{myRank}</span> · {user.xp.toLocaleString()} XP</p>
      </header>

      {/* Podium */}
      <div className="grid grid-cols-3 gap-3 items-end">
        {[1, 0, 2].map((podiumIdx) => {
          const u = ranked[podiumIdx];
          const heights = ["h-32", "h-40", "h-24"];
          const colors = ["from-neon-cyan/30 to-neon-blue/20 border-neon-cyan/50", "from-neon-orange/40 to-neon-pink/20 border-neon-orange/60 glow-orange", "from-neon-purple/30 to-neon-pink/15 border-neon-purple/40"];
          const pos = [2, 1, 3];
          const i = pos[[1, 0, 2].indexOf(podiumIdx)];
          return (
            <div key={u.id} className="flex flex-col items-center">
              <div className="text-3xl mb-1">{u.avatar}</div>
              <div className="font-semibold text-sm text-center">{u.name === user.name ? "You" : u.name}</div>
              <div className="text-xs text-neon-orange font-bold">{u.xp.toLocaleString()} XP</div>
              <div className={`mt-2 w-full ${heights[[1, 0, 2].indexOf(podiumIdx)]} rounded-t-2xl bg-gradient-to-t ${colors[[1, 0, 2].indexOf(podiumIdx)]} border-t-2 grid place-items-center`}>
                <div className="font-display font-extrabold text-3xl">{i}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass rounded-2xl divide-y divide-border/40">
        {ranked.slice(3).map((u, idx) => {
          const isMe = u.id === "me";
          return (
            <div key={u.id} className={`flex items-center gap-4 p-4 ${isMe ? "bg-neon-purple/10" : ""}`}>
              <div className="size-8 rounded-lg grid place-items-center bg-background/40 font-display font-bold text-muted-foreground">{idx + 4}</div>
              <div className="text-2xl">{u.avatar}</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold flex items-center gap-2">{isMe ? "You" : u.name} {isMe && <Crown className="size-4 text-neon-orange" />}<span className="text-xs">{u.country}</span></div>
                <div className="text-xs text-muted-foreground">Level {u.level}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-neon-cyan">{u.xp.toLocaleString()} XP</div>
                <div className="text-xs text-neon-orange inline-flex items-center gap-1"><Flame className="size-3" /> {u.streak}d</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
