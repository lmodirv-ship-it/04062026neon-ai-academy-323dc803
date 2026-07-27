import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Star, Flame, Target, BookOpen, Clock } from "lucide-react";
import { getMyProgress } from "@/lib/api/progress.functions";
import { getCurriculum } from "@/lib/api/curriculum.functions";

export const Route = createFileRoute("/_authenticated/stats")({
  head: () => ({
    meta: [
      { title: "إحصائياتي — HN-AI" },
      { name: "description", content: "تحليل مفصّل لتقدّمك: النقاط، الدقة، ساعات التعلّم والدروس المكتملة في HN-AI." },
      { property: "og:title", content: "إحصائياتي — HN-AI" },
      { property: "og:description", content: "لوحة تحليلات شخصية لرحلتك التعليمية في HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StatsPage,
});

function StatsPage() {
  const { data } = useQuery({ queryKey: ["my-progress"], queryFn: () => getMyProgress() });
  const { data: curriculum } = useQuery({ queryKey: ["curriculum"], queryFn: () => getCurriculum() });

  const s = data?.stats;
  const progress = data?.progress ?? [];
  const accuracy = s && s.total_answers > 0 ? Math.round((s.correct_answers / s.total_answers) * 100) : 0;

  const allLessons = (curriculum ?? []).flatMap((p) =>
    p.levels.flatMap((l) => l.courses.flatMap((c) => c.chapters.flatMap((ch) => ch.units.flatMap((u) => u.lessons)))),
  );
  const doneIds = new Set(progress.filter((p) => p.status === "completed").map((p) => p.lesson_id));
  const minutes = allLessons.filter((l) => doneIds.has(l.id)).reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0);

  // Last 7 days activity from completion timestamps.
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const perDay = days.map(
    (day) => progress.filter((p) => (p.completed_at ?? "").slice(0, 10) === day).length,
  );
  const max = Math.max(1, ...perDay);

  return (
    <div className="space-y-6" dir="rtl">
      <header>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="size-7 text-neon-cyan" /> إحصائياتي
        </h1>
        <p className="text-muted-foreground text-sm mt-1">نظرة تحليلية على أدائك خلال رحلتك التعليمية.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Tile icon={Star} label="XP" value={s?.xp ?? 0} />
        <Tile icon={Flame} label="السلسلة" value={`${s?.streak ?? 0} يوم`} />
        <Tile icon={BookOpen} label="دروس مكتملة" value={s?.lessons_completed ?? 0} />
        <Tile icon={Target} label="الدقة" value={`${accuracy}%`} />
        <Tile icon={Clock} label="ساعات التعلّم" value={`${(minutes / 60).toFixed(1)}س`} />
      </div>

      <section className="glass-strong rounded-3xl p-6 border border-border/40">
        <h2 className="font-display text-xl font-bold mb-5">نشاط آخر 7 أيام</h2>
        <div className="flex items-end gap-3 h-40">
          {perDay.map((n, i) => (
            <div key={days[i]} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-lg bg-gradient-to-t from-neon-purple to-neon-cyan transition-all"
                style={{ height: `${(n / max) * 100}%`, minHeight: n ? "8px" : "3px", opacity: n ? 1 : 0.25 }} />
              <span className="text-[10px] text-muted-foreground">{days[i].slice(5)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-6 border border-border/40">
        <h2 className="font-display text-xl font-bold mb-4">إجابات صحيحة مقابل الإجمالي</h2>
        <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue" style={{ width: `${accuracy}%` }} />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {s?.correct_answers ?? 0} صحيحة من {s?.total_answers ?? 0} إجابة
        </p>
      </section>
    </div>
  );
}

function Tile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4 border border-border/40">
      <Icon className="size-5 text-neon-cyan mb-2" />
      <div className="text-2xl font-bold font-display">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
