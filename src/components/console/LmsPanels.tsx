import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getLmsOverview, getLearningAnalytics } from "@/lib/api/console-lms.functions";
import { ErrorBox, ExportButton, Loading, PanelHeader, Stat, Upcoming } from "./ui";

function useLms() {
  return useQuery({ queryKey: ["console-lms"], queryFn: () => getLmsOverview() });
}

export function CoursesPanel() {
  const { data, isLoading, error } = useLms();
  const [q, setQ] = useState("");
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const rows = data!.courses.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <PanelHeader title="المسارات والدورات" desc="إدارة البرامج والمستويات والدورات التعليمية (Machine Learning، Prompt Engineering، LLMs…)."
        action={<Link to="/studio" className="px-3 py-2 rounded-lg glass border-neon-purple/50 text-sm">فتح الاستوديو للتحرير</Link>} />

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="برامج" value={data!.counts.programs} />
        <Stat label="مستويات" value={data!.counts.levels} />
        <Stat label="دورات" value={data!.counts.courses} />
        <Stat label="فصول" value={data!.counts.chapters} />
        <Stat label="وحدات" value={data!.counts.units} />
        <Stat label="دروس" value={data!.counts.lessons} hint={`${data!.counts.lessonsPublished} منشور`} />
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في الدورات…" className="glass rounded-xl px-3 py-2 text-sm w-full max-w-xs bg-transparent outline-none" />
        <div className="ms-auto"><ExportButton name="courses" rows={rows as unknown as Record<string, unknown>[]} /></div>
      </div>

      <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
        {rows.map((c) => (
          <div key={c.id} className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <div className="font-semibold">{c.title}</div>
              <div className="text-xs text-muted-foreground">/{c.slug} · {c.difficulty} · {c.chapters} فصل · {c.units} وحدة · {c.lessons} درس · {c.xp} XP</div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${c.status === "published" ? "bg-neon-cyan/15 text-neon-cyan" : "bg-muted/30 text-muted-foreground"}`}>
              {c.status === "published" ? "منشور" : "مسودة"}
            </span>
          </div>
        ))}
        {rows.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">لا توجد دورات.</div>}
      </div>
    </div>
  );
}

export function LessonsPanel() {
  const { data, isLoading, error } = useLms();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const rows = data!.lessons.filter(
    (l) => l.title.toLowerCase().includes(q.toLowerCase()) && (status === "all" || l.status === status),
  );

  return (
    <div className="space-y-4">
      <PanelHeader title="الدروس والوحدات" desc="تنظيم محتوى الدروس: فقرات، أكواد، صور وفيديو مرفق لكل درس."
        action={<Link to="/studio" className="px-3 py-2 rounded-lg glass border-neon-purple/50 text-sm">تحرير المحتوى</Link>} />

      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في الدروس…" className="glass rounded-xl px-3 py-2 text-sm w-full max-w-xs bg-transparent outline-none" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="glass rounded-xl px-3 py-2 text-sm bg-transparent">
          <option value="all">الكل</option>
          <option value="published">منشور</option>
          <option value="draft">مسودة</option>
        </select>
        <span className="text-xs text-muted-foreground">{rows.length} درس</span>
        <div className="ms-auto"><ExportButton name="lessons" rows={rows as unknown as Record<string, unknown>[]} /></div>
      </div>

      <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
        {rows.map((l) => (
          <div key={l.id} className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <div className="font-semibold">{l.title}</div>
              <div className="text-xs text-muted-foreground">{l.blocks} فقرة · {l.questions} سؤال · {l.minutes} دقيقة · {l.xp} XP</div>
            </div>
            <span className={`text-[11px] px-2 py-0.5 rounded-full ${l.status === "published" ? "bg-neon-cyan/15 text-neon-cyan" : "bg-muted/30 text-muted-foreground"}`}>
              {l.status === "published" ? "منشور" : "مسودة"}
            </span>
            <Link to="/learn/$slug" params={{ slug: l.slug }} className="text-xs text-neon-cyan">معاينة</Link>
          </div>
        ))}
        {rows.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">لا توجد دروس.</div>}
      </div>
    </div>
  );
}

export function QuizzesPanel() {
  const { data, isLoading, error } = useLms();
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div className="space-y-4">
      <PanelHeader title="الاختبارات والواجبات" desc="أسئلة التحقق التفاعلية داخل الدروس مع الاختيارات والنقاط."
        action={<Link to="/studio" className="px-3 py-2 rounded-lg glass border-neon-purple/50 text-sm">إضافة أسئلة</Link>} />

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="دروس بها اختبار" value={data!.counts.quizzes} />
        <Stat label="إجمالي الأسئلة" value={data!.counts.questions} />
        <Stat label="فقرات المحتوى" value={data!.counts.blocks} />
      </div>

      <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
        {data!.quizzes.map((qz) => (
          <div key={qz.lessonId} className="p-4 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[220px]">
              <div className="font-semibold">{qz.lesson}</div>
              <div className="text-xs text-muted-foreground">{qz.questions} سؤال · {qz.options} خيار · {qz.xp} XP</div>
            </div>
            <Link to="/learn/$slug" params={{ slug: qz.slug }} className="text-xs text-neon-cyan">تجربة</Link>
          </div>
        ))}
        {data!.quizzes.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">لا توجد اختبارات بعد.</div>}
      </div>
    </div>
  );
}

export function CertificatesPanel() {
  const { data, isLoading } = useQuery({ queryKey: ["learning-analytics"], queryFn: () => getLearningAnalytics() });
  const eligible = (data?.learners ?? []).filter((l) => l.completed > 0);

  return (
    <div className="space-y-4">
      <PanelHeader title="الشهادات" desc="المتعلمون المؤهلون لشهادة إتمام بناءً على الدروس المكتملة ونسبة الدقة." />
      {isLoading ? <Loading /> : (
        <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
          {eligible.map((l) => (
            <div key={l.userId} className="p-4 flex flex-wrap items-center gap-3">
              <div className="flex-1 min-w-[200px]">
                <div className="font-semibold">{l.name}</div>
                <div className="text-xs text-muted-foreground">{l.completed} درس مكتمل · دقة {l.accuracy}% · {l.xp} XP</div>
              </div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${l.accuracy >= 70 ? "bg-neon-cyan/15 text-neon-cyan" : "bg-muted/30 text-muted-foreground"}`}>
                {l.accuracy >= 70 ? "مؤهل للشهادة" : "قيد التقدم"}
              </span>
            </div>
          ))}
          {eligible.length === 0 && <div className="p-6 text-center text-sm text-muted-foreground">لا يوجد مؤهلون بعد.</div>}
        </div>
      )}
      <Upcoming title="مولّد الشهادات التلقائي" desc="قوالب PDF وتوقيع رقمي ورمز تحقق لكل شهادة."
        bullets={["قوالب تصميم قابلة للتخصيص", "توليد PDF تلقائي عند الإتمام", "رابط تحقق عام لكل شهادة", "إرسال بالبريد للطالب"]} />
    </div>
  );
}

export function LearningAnalyticsPanel() {
  const { data, isLoading, error } = useQuery({ queryKey: ["learning-analytics"], queryFn: () => getLearningAnalytics() });
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const k = data!.kpis;

  return (
    <div className="space-y-4">
      <PanelHeader title="تحليلات التعلم" desc="نسب الإكمال، أكثر الدروس تفاعلًا، ونقاط تعثّر الطلاب."
        action={<ExportButton name="lesson-analytics" rows={data!.perLesson as unknown as Record<string, unknown>[]} />} />

      <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="متعلّمون" value={k.learners} />
        <Stat label="دروس بدأت" value={k.totalStarts} />
        <Stat label="دروس مكتملة" value={k.totalDone} />
        <Stat label="نسبة الإكمال" value={`${k.globalCompletion}%`} />
        <Stat label="دقة الإجابات" value={`${k.avgAccuracy}%`} />
        <Stat label="محاولات الأسئلة" value={k.attempts} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4">
          <div className="text-sm font-semibold mb-3">أكثر الدروس تفاعلًا</div>
          <ul className="space-y-2 text-sm">
            {data!.perLesson.slice(0, 10).map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3">
                <span className="truncate">{l.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">{l.starts} بدء · {l.completionRate}% إكمال</span>
              </li>
            ))}
            {data!.perLesson.length === 0 && <li className="text-muted-foreground">لا توجد بيانات.</li>}
          </ul>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-sm font-semibold mb-3">نقاط التعثّر (أصعب الأسئلة)</div>
          <ul className="space-y-2 text-sm">
            {data!.hardestQuestions.map((q) => (
              <li key={q.id} className="flex items-center justify-between gap-3">
                <span className="truncate">{q.prompt}</span>
                <span className="text-xs text-neon-pink shrink-0">{q.successRate}% نجاح</span>
              </li>
            ))}
            {data!.hardestQuestions.length === 0 && <li className="text-muted-foreground">لا توجد محاولات بعد.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
