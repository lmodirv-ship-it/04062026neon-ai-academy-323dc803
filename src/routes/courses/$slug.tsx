import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { BookOpen, Clock, Award, CheckCircle2, Circle, Loader2, ArrowLeft } from "lucide-react";
import { getCourse, type CourseDetail } from "@/lib/api/curriculum.functions";
import { enrollInCourse, issueCertificate, myEnrollments, type EnrollmentRow } from "@/lib/api/learning.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/courses/$slug")({
  loader: async ({ params }) => {
    const course = await getCourse({ data: { slug: params.slug } });
    if (!course) throw notFound();
    return course;
  },
  head: ({ loaderData }) => {
    const c = loaderData as CourseDetail | undefined;
    const title = c?.title ?? "دورة";
    const desc = c?.description ?? "دورة ذكاء اصطناعي تفاعلية على منصة HN-AI.";
    return {
      meta: [
        { title: `${title} — HN-AI Academy` },
        { name: "description", content: desc.slice(0, 155) },
        { property: "og:title", content: `${title} — HN-AI Academy` },
        { property: "og:description", content: desc.slice(0, 155) },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CoursePage,
  errorComponent: () => <div className="py-20 text-center text-muted-foreground">تعذّر تحميل الدورة.</div>,
  notFoundComponent: () => <div className="py-20 text-center text-muted-foreground">الدورة غير موجودة.</div>,
});

function CoursePage() {
  const course = Route.useLoaderData() as CourseDetail;
  const { user } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<"enroll" | "cert" | null>(null);

  const { data: enrollments = [] } = useQuery<EnrollmentRow[]>({
    queryKey: ["my-enrollments"],
    queryFn: () => myEnrollments() as Promise<EnrollmentRow[]>,
    enabled: !!user,
  });
  const enrollment = enrollments.find((e) => e.course_id === course.id);

  const firstLesson = course.chapters.flatMap((c) => c.units).flatMap((u) => u.lessons)[0];

  const enroll = async () => {
    if (!user) return toast.info("سجّل الدخول للانضمام إلى الدورة.");
    setBusy("enroll");
    try {
      await enrollInCourse({ data: { courseId: course.id } });
      await qc.invalidateQueries({ queryKey: ["my-enrollments"] });
      toast.success("تم الانضمام إلى الدورة 🎉");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    } finally {
      setBusy(null);
    }
  };

  const claim = async () => {
    setBusy("cert");
    try {
      const cert = await issueCertificate({ data: { courseId: course.id } });
      toast.success(`تم إصدار الشهادة: ${cert.code}`);
      await qc.invalidateQueries({ queryKey: ["my-certificates"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <header className="glass-strong rounded-3xl border border-border/40 p-6 space-y-4">
        <div className="text-[11px] text-neon-cyan">{course.level_title}</div>
        <h1 className="font-display text-3xl font-bold text-gold">{course.title}</h1>
        {course.description && <p className="text-sm text-muted-foreground leading-7">{course.description}</p>}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><BookOpen className="size-3.5" /> {course.lessons_count} درس</span>
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {course.minutes} دقيقة</span>
          <span className="rounded-full border border-gold/40 px-2.5 py-1 text-gold">{course.difficulty}</span>
        </div>

        {enrollment && (
          <div>
            <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
              <span>تقدّمك</span>
              <span>{enrollment.completed_lessons}/{enrollment.total_lessons} · {enrollment.progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan" style={{ width: `${enrollment.progress}%` }} />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 pt-1">
          {!enrollment ? (
            <button
              onClick={enroll}
              disabled={busy === "enroll"}
              className="rounded-xl px-5 py-2.5 font-semibold bg-gradient-to-r from-neon-purple to-neon-blue text-white glow-purple inline-flex items-center gap-2 disabled:opacity-50"
            >
              {busy === "enroll" && <Loader2 className="size-4 animate-spin" />} انضم إلى الدورة
            </button>
          ) : (
            firstLesson && (
              <Link
                to="/learn/$slug"
                params={{ slug: firstLesson.slug }}
                className="rounded-xl px-5 py-2.5 font-semibold bg-gradient-to-r from-neon-purple to-neon-blue text-white glow-purple inline-flex items-center gap-2"
              >
                متابعة التعلّم <ArrowLeft className="size-4" />
              </Link>
            )
          )}
          {enrollment && enrollment.progress === 100 && (
            <button
              onClick={claim}
              disabled={busy === "cert"}
              className="rounded-xl px-5 py-2.5 font-semibold border border-gold/50 text-gold inline-flex items-center gap-2 disabled:opacity-50"
            >
              {busy === "cert" ? <Loader2 className="size-4 animate-spin" /> : <Award className="size-4" />} احصل على الشهادة
            </button>
          )}
        </div>
      </header>

      <section className="space-y-5">
        {course.chapters.map((ch, i) => (
          <div key={ch.id} className="glass rounded-3xl border border-border/40 p-5">
            <h2 className="font-display text-lg font-bold mb-3">
              <span className="text-neon-purple">الفصل {i + 1}:</span> {ch.title}
            </h2>
            <div className="space-y-4">
              {ch.units.map((u) => (
                <div key={u.id}>
                  <div className="mb-2 text-xs text-muted-foreground">{u.title}</div>
                  <ul className="space-y-1.5">
                    {u.lessons.map((l) => (
                      <li key={l.id}>
                        <Link
                          to="/learn/$slug"
                          params={{ slug: l.slug }}
                          className="flex items-center gap-3 rounded-2xl border border-border/40 px-4 py-3 text-sm transition hover:border-neon-purple/60"
                        >
                          <Circle className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate">{l.title}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{l.duration_minutes}د</span>
                          <span className="shrink-0 text-xs text-neon-orange">+{l.xp_reward}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {user && (
        <Link to="/certificates" className="inline-flex items-center gap-2 text-sm text-gold">
          <CheckCircle2 className="size-4" /> شهاداتي
        </Link>
      )}
    </div>
  );
}
