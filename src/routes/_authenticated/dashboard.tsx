import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Flame, Star, Target, Trophy, BookOpen, ArrowRight } from "lucide-react";
import { getMyProgress } from "@/lib/api/progress.functions";
import { getCurriculum } from "@/lib/api/curriculum.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "My Dashboard — HN-AI Academy" },
      { name: "description", content: "Track your XP, streak, accuracy and continue your AI learning program." },
      { property: "og:title", content: "My Dashboard — HN-AI Academy" },
      { property: "og:description", content: "Track your XP, streak, accuracy and continue your AI learning program." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["my-progress"], queryFn: () => getMyProgress() });
  const { data: curriculum } = useQuery({ queryKey: ["curriculum"], queryFn: () => getCurriculum() });

  const stats = data?.stats;
  const done = new Set((data?.progress ?? []).filter((p) => p.status === "completed").map((p) => p.lesson_id));

  const allLessons = (curriculum ?? []).flatMap((p) =>
    p.levels.flatMap((l) => l.courses.flatMap((c) => c.chapters.flatMap((ch) => ch.units.flatMap((u) => u.lessons)))),
  );
  const next = allLessons.find((l) => !done.has(l.id));
  const accuracy = stats && stats.total_answers > 0 ? Math.round((stats.correct_answers / stats.total_answers) * 100) : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">مرحبًا {user?.user_metadata?.display_name ?? "بك"} 👑</h1>
        <p className="text-muted-foreground text-sm mt-1">تابع رحلتك في تعلّم الذكاء الاصطناعي، 10 دقائق يوميًا.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Tile icon={Star} label="XP" value={stats?.xp ?? 0} color="neon-purple" />
        <Tile icon={Flame} label="السلسلة" value={`${stats?.streak ?? 0} يوم`} color="neon-orange" />
        <Tile icon={BookOpen} label="دروس مكتملة" value={stats?.lessons_completed ?? 0} color="neon-blue" />
        <Tile icon={Target} label="الدقة" value={`${accuracy}%`} color="neon-cyan" />
      </div>

      <section className="glass-strong rounded-3xl p-6 border border-border/40">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="size-5 text-neon-orange" />
          <h2 className="font-display text-xl font-bold">تابع من حيث توقفت</h2>
        </div>
        {next ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-semibold">{next.title}</div>
              <div className="text-sm text-muted-foreground">{next.summary}</div>
            </div>
            <Link
              to="/learn/$slug"
              params={{ slug: next.slug }}
              className="rounded-xl px-5 py-2.5 font-semibold bg-gradient-to-r from-neon-purple to-neon-blue text-white glow-purple inline-flex items-center gap-2"
            >
              ابدأ الدرس <ArrowRight className="size-4" />
            </Link>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            لا توجد دروس متاحة الآن. <Link to="/learn" className="text-neon-cyan">تصفّح البرنامج</Link>
          </p>
        )}
      </section>

      <section className="glass rounded-3xl p-6 border border-border/40">
        <h2 className="font-display text-xl font-bold mb-4">تقدّم البرنامج</h2>
        <div className="space-y-3">
          {(curriculum ?? []).flatMap((p) =>
            p.levels.map((lvl) => {
              const lessons = lvl.courses.flatMap((c) => c.chapters.flatMap((ch) => ch.units.flatMap((u) => u.lessons)));
              const completed = lessons.filter((l) => done.has(l.id)).length;
              const pct = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
              return (
                <div key={lvl.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">المستوى {lvl.level_number} — {lvl.title}</span>
                    <span className="text-muted-foreground">{completed}/{lessons.length}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </section>
    </div>
  );
}

function Tile({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: React.ReactNode; color: string }) {
  return (
    <div className="glass rounded-2xl p-4 border border-border/40">
      <Icon className={`size-5 text-${color} mb-2`} />
      <div className="text-2xl font-bold font-display">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
