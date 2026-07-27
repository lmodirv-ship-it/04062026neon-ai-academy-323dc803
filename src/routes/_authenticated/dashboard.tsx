import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Flame, Star, Target, Trophy, BookOpen, ArrowRight, Clock, Award, Sparkles,
  CalendarDays, Megaphone, Bot,
} from "lucide-react";
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

const announcements = [
  { title: "مسارات جديدة قادمة", body: "Linux، قواعد البيانات والأمن السيبراني قيد الإعداد." },
  { title: "HN AI Chat متاح الآن", body: "اسأل المرشد الذكي عن أي درس أو مفهوم تقني." },
];

function Dashboard() {
  const { user } = useAuth();
  const { data } = useQuery({ queryKey: ["my-progress"], queryFn: () => getMyProgress() });
  const { data: curriculum } = useQuery({ queryKey: ["curriculum"], queryFn: () => getCurriculum() });

  const stats = data?.stats;
  const progress = data?.progress ?? [];
  const done = new Set(progress.filter((p) => p.status === "completed").map((p) => p.lesson_id));

  const allLessons = (curriculum ?? []).flatMap((p) =>
    p.levels.flatMap((l) => l.courses.flatMap((c) => c.chapters.flatMap((ch) => ch.units.flatMap((u) => u.lessons)))),
  );
  const next = allLessons.find((l) => !done.has(l.id));
  const suggested = allLessons.filter((l) => !done.has(l.id)).slice(1, 4);
  const minutes = allLessons.filter((l) => done.has(l.id)).reduce((s, l) => s + (l.duration_minutes ?? 0), 0);
  const overallPct = allLessons.length ? Math.round((done.size / allLessons.length) * 100) : 0;
  const accuracy = stats && stats.total_answers > 0 ? Math.round((stats.correct_answers / stats.total_answers) * 100) : 0;

  const weekDays = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت", "الأحد"];
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    const shift = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - shift + i);
    const iso = d.toISOString().slice(0, 10);
    return {
      label: weekDays[i],
      day: d.getDate(),
      active: progress.some((p) => (p.completed_at ?? "").slice(0, 10) === iso),
      today: iso === new Date().toISOString().slice(0, 10),
    };
  });

  const badges = [
    { icon: BookOpen, name: "الخطوة الأولى", got: (stats?.lessons_completed ?? 0) >= 1 },
    { icon: Star, name: "100 XP", got: (stats?.xp ?? 0) >= 100 },
    { icon: Flame, name: "7 أيام", got: (stats?.streak ?? 0) >= 7 },
    { icon: Target, name: "دقّة 80%", got: accuracy >= 80 },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">مرحبًا {user?.user_metadata?.display_name ?? "بك"} 👑</h1>
          <p className="text-muted-foreground text-sm mt-1">تابع رحلتك في تعلّم الذكاء الاصطناعي، 10 دقائق يوميًا.</p>
        </div>
        <Link to="/chat" className="glass rounded-xl px-4 py-2 text-sm font-semibold border border-neon-purple/40 inline-flex items-center gap-2">
          <Bot className="size-4 text-neon-purple" /> اسأل المرشد الذكي
        </Link>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Tile icon={Star} label="XP" value={stats?.xp ?? 0} color="neon-purple" />
        <Tile icon={Flame} label="السلسلة" value={`${stats?.streak ?? 0} يوم`} color="neon-orange" />
        <Tile icon={BookOpen} label="دروس مكتملة" value={stats?.lessons_completed ?? 0} color="neon-blue" />
        <Tile icon={Target} label="الدقة" value={`${accuracy}%`} color="neon-cyan" />
        <Tile icon={Clock} label="ساعات التعلّم" value={`${(minutes / 60).toFixed(1)}س`} color="neon-pink" />
      </div>

      <section className="glass rounded-3xl p-6 border border-border/40">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-semibold">نسبة الإنجاز الكلية</span>
          <span className="text-muted-foreground">{done.size}/{allLessons.length} درس — {overallPct}%</span>
        </div>
        <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan" style={{ width: `${overallPct}%` }} />
        </div>
      </section>


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

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="glass rounded-3xl p-6 border border-border/40">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <CalendarDays className="size-5 text-neon-cyan" /> التقويم الدراسي
          </h2>
          <div className="grid grid-cols-7 gap-2 text-center">
            {week.map((d) => (
              <div key={d.label} className="space-y-1">
                <div className="text-[10px] text-muted-foreground">{d.label.slice(0, 3)}</div>
                <div
                  className={`aspect-square rounded-xl grid place-items-center text-sm font-semibold border ${
                    d.active
                      ? "bg-gradient-to-br from-neon-purple to-neon-blue text-white border-transparent glow-purple"
                      : d.today
                        ? "border-neon-cyan/60 text-neon-cyan"
                        : "border-border/40 text-muted-foreground"
                  }`}
                >
                  {d.day}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl p-6 border border-border/40">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="size-5 text-neon-orange" /> الشارات
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {badges.map((b) => (
              <div key={b.name} className={`rounded-2xl p-3 text-center border ${b.got ? "border-neon-orange/50" : "border-border/40 opacity-50"}`}>
                <b.icon className={`size-5 mx-auto mb-2 ${b.got ? "text-neon-orange" : "text-muted-foreground"}`} />
                <div className="text-[11px] leading-tight">{b.name}</div>
              </div>
            ))}
          </div>
          <Link to="/achievements" className="text-sm text-neon-cyan mt-4 inline-block">كل الإنجازات →</Link>
        </section>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="glass rounded-3xl p-6 border border-border/40">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="size-5 text-neon-purple" /> دروس مقترحة
          </h2>
          <div className="space-y-2">
            {suggested.length === 0 && <p className="text-sm text-muted-foreground">لا توجد اقتراحات حاليًا.</p>}
            {suggested.map((l) => (
              <Link
                key={l.id}
                to="/learn/$slug"
                params={{ slug: l.slug }}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/40 px-4 py-3 hover:border-neon-purple/50 transition"
              >
                <span className="text-sm font-medium truncate">{l.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">{l.duration_minutes} د</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl p-6 border border-border/40">
          <h2 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
            <Megaphone className="size-5 text-neon-pink" /> إعلانات المنصة
          </h2>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.title} className="rounded-xl border border-border/40 px-4 py-3">
                <div className="font-semibold text-sm">{a.title}</div>
                <p className="text-xs text-muted-foreground mt-1">{a.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
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
