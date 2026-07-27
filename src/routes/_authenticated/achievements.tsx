import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, Flame, Star, Target, BookOpen, Lock, Trophy, Crown } from "lucide-react";
import { getMyProgress } from "@/lib/api/progress.functions";

export const Route = createFileRoute("/_authenticated/achievements")({
  head: () => ({
    meta: [
      { title: "الإنجازات — HN-AI" },
      { name: "description", content: "شاراتك وإنجازاتك في HN-AI: السلاسل اليومية، النقاط، الدروس المكتملة ودقة الإجابات." },
      { property: "og:title", content: "الإنجازات — HN-AI" },
      { property: "og:description", content: "اجمع الشارات وتابع تقدّمك في رحلة تعلّم الذكاء الاصطناعي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AchievementsPage,
});

function AchievementsPage() {
  const { data } = useQuery({ queryKey: ["my-progress"], queryFn: () => getMyProgress() });
  const s = data?.stats;
  const xp = s?.xp ?? 0;
  const streak = s?.streak ?? 0;
  const lessons = s?.lessons_completed ?? 0;
  const accuracy = s && s.total_answers > 0 ? Math.round((s.correct_answers / s.total_answers) * 100) : 0;

  const badges = [
    { icon: BookOpen, name: "الخطوة الأولى", desc: "أكمل أول درس", got: lessons >= 1, color: "text-neon-cyan" },
    { icon: Star, name: "جامع النقاط", desc: "اجمع 100 XP", got: xp >= 100, color: "text-neon-purple" },
    { icon: Flame, name: "سلسلة 7 أيام", desc: "تعلّم 7 أيام متتالية", got: streak >= 7, color: "text-neon-orange" },
    { icon: Target, name: "دقّة عالية", desc: "دقة إجابات 80%+", got: accuracy >= 80, color: "text-neon-blue" },
    { icon: Trophy, name: "متعلّم مثابر", desc: "أكمل 10 دروس", got: lessons >= 10, color: "text-neon-pink" },
    { icon: Crown, name: "أسطورة HN-AI", desc: "اجمع 1000 XP", got: xp >= 1000, color: "text-neon-orange" },
  ];

  const unlocked = badges.filter((b) => b.got).length;

  return (
    <div className="space-y-6" dir="rtl">
      <header className="glass-strong rounded-3xl p-6 border border-border/40 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.78_0.18_55/0.3),transparent_60%)]" />
        <Award className="size-10 text-neon-orange mx-auto glow-orange" />
        <h1 className="font-display text-3xl font-extrabold mt-3">الإنجازات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          فتحت <span className="text-neon-orange font-bold">{unlocked}</span> من {badges.length} شارة
        </p>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b) => (
          <div
            key={b.name}
            className={`glass rounded-2xl p-5 border ${b.got ? "border-neon-orange/40" : "border-border/40 opacity-60"}`}
          >
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl grid place-items-center bg-muted/30">
                {b.got ? <b.icon className={`size-5 ${b.color}`} /> : <Lock className="size-4 text-muted-foreground" />}
              </div>
              <div>
                <div className="font-semibold">{b.name}</div>
                <div className="text-xs text-muted-foreground">{b.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5 border border-border/40 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">شهاداتك المكتسبة محفوظة في صفحة الشهادات.</p>
        <Link to="/certificates" className="text-sm font-semibold text-neon-cyan">عرض الشهادات →</Link>
      </div>
    </div>
  );
}
