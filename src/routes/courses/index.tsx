import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Layers, ArrowLeft } from "lucide-react";
import { listCourses, type CourseCard } from "@/lib/api/curriculum.functions";

export const Route = createFileRoute("/courses/")({
  loader: () => listCourses(),
  head: () => ({
    meta: [
      { title: "مكتبة الدورات — HN-AI Academy" },
      { name: "description", content: "تصفّح جميع دورات الذكاء الاصطناعي والبرمجة الحديثة في HN-AI: مستويات، فصول، ودروس قصيرة يوميًا." },
      { property: "og:title", content: "مكتبة الدورات — HN-AI Academy" },
      { property: "og:description", content: "دورات ذكاء اصطناعي قصيرة وممتعة، 10 دقائق يوميًا." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoursesPage,
  errorComponent: () => <div className="py-20 text-center text-muted-foreground">تعذّر تحميل الدورات.</div>,
  notFoundComponent: () => <div className="py-20 text-center text-muted-foreground">غير موجود.</div>,
});

function CoursesPage() {
  const initial = Route.useLoaderData() as CourseCard[];
  const { data: courses = [] } = useQuery<CourseCard[]>({
    queryKey: ["courses"],
    queryFn: () => listCourses() as Promise<CourseCard[]>,
    initialData: initial,
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-gold">مكتبة الدورات</h1>
        <p className="text-muted-foreground text-sm">كل دورة مقسّمة إلى فصول ووحدات ودروس قصيرة — تعلّم 10 دقائق يوميًا.</p>
      </header>

      {courses.length === 0 && (
        <div className="glass rounded-3xl border border-border/40 p-10 text-center text-muted-foreground">
          لا توجد دورات منشورة بعد.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((c) => (
          <Link
            key={c.id}
            to="/courses/$slug"
            params={{ slug: c.slug }}
            className="glass-strong group rounded-3xl border border-border/40 p-5 transition hover:border-neon-purple/60"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] text-neon-cyan">{c.level_title ?? "مستوى"}</div>
                <h2 className="font-display text-lg font-bold truncate">{c.title}</h2>
              </div>
              <span className="shrink-0 rounded-full border border-gold/40 px-2.5 py-1 text-[11px] text-gold">{c.difficulty}</span>
            </div>
            {c.description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>}
            <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><BookOpen className="size-3.5" /> {c.lessons_count} درس</span>
              <span className="inline-flex items-center gap-1"><Clock className="size-3.5" /> {c.minutes} دقيقة</span>
              <span className="mr-auto inline-flex items-center gap-1 text-neon-purple opacity-0 transition group-hover:opacity-100">
                ابدأ <ArrowLeft className="size-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <Link to="/learn" className="inline-flex items-center gap-2 text-sm text-neon-cyan">
        <Layers className="size-4" /> عرض البرنامج الكامل
      </Link>
    </div>
  );
}
