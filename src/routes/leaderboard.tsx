import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Crown, Flame, Trophy } from "lucide-react";
import { getLeaderboard } from "@/lib/api/admin.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "لوحة الصدارة — HN-AI" },
      { name: "description", content: "ترتيب المتعلّمين في HN-AI حسب نقاط الخبرة والسلسلة اليومية." },
      { property: "og:title", content: "لوحة الصدارة — HN-AI" },
      { property: "og:description", content: "ترتيب المتعلّمين حسب نقاط الخبرة والسلسلة اليومية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Leaderboard,
});

function Leaderboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["leaderboard"], queryFn: () => getLeaderboard() });
  const ranked = data ?? [];
  const myRank = user ? ranked.findIndex((r) => r.user_id === user.id) + 1 : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      <header className="glass-strong rounded-3xl p-6 border-neon-orange/30 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.78_0.18_55/0.35),transparent_60%)]" />
        <Trophy className="size-12 text-neon-orange mx-auto glow-orange" />
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight mt-3">لوحة الصدارة</h1>
        <p className="text-muted-foreground mt-2">
          {myRank > 0 ? <>ترتيبك الحالي <span className="text-neon-cyan font-bold">#{myRank}</span></> : "سجّل الدخول لتظهر في الترتيب"}
        </p>
      </header>

      {isLoading && <div className="py-16 text-center text-muted-foreground">جارٍ التحميل…</div>}
      {!isLoading && ranked.length === 0 && (
        <div className="py-16 text-center text-muted-foreground glass rounded-2xl">لا يوجد متعلّمون بعد — كن الأول!</div>
      )}

      {ranked.length >= 3 && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {[1, 0, 2].map((idx, i) => {
            const u = ranked[idx];
            const heights = ["h-32", "h-40", "h-24"];
            const colors = [
              "from-neon-cyan/30 to-neon-blue/20 border-neon-cyan/50",
              "from-neon-orange/40 to-neon-pink/20 border-neon-orange/60 glow-orange",
              "from-neon-purple/30 to-neon-pink/15 border-neon-purple/40",
            ];
            const pos = [2, 1, 3];
            return (
              <div key={u.user_id} className="flex flex-col items-center">
                <div className="text-3xl mb-1">👑</div>
                <div className="font-semibold text-sm text-center">{u.display_name}</div>
                <div className="text-xs text-neon-orange font-bold">{u.xp.toLocaleString()} XP</div>
                <div className={`mt-2 w-full ${heights[i]} rounded-t-2xl bg-gradient-to-t ${colors[i]} border-t-2 grid place-items-center`}>
                  <div className="font-display font-extrabold text-3xl">{pos[i]}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="glass rounded-2xl divide-y divide-border/40">
        {ranked.slice(3).map((u, idx) => {
          const isMe = user?.id === u.user_id;
          return (
            <div key={u.user_id} className={`flex items-center gap-4 p-4 ${isMe ? "bg-neon-purple/10" : ""}`}>
              <div className="size-8 rounded-lg grid place-items-center bg-background/40 font-display font-bold text-muted-foreground">{idx + 4}</div>
              <div className="text-2xl">👑</div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold flex items-center gap-2">{u.display_name} {isMe && <Crown className="size-4 text-neon-orange" />}</div>
                <div className="text-xs text-muted-foreground">{u.lessons_completed} درس مكتمل</div>
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
