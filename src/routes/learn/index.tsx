import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Clock, Star, GraduationCap } from "lucide-react";
import { getCurriculum, type CurriculumProgram } from "@/lib/api/curriculum.functions";

export const Route = createFileRoute("/learn/")({
  head: () => ({
    meta: [
      { title: "Learning Program — HN-AI Academy" },
      { name: "description", content: "A structured AI program: levels, courses, chapters, units and 10-minute interactive lessons." },
      { property: "og:title", content: "Learning Program — HN-AI Academy" },
      { property: "og:description", content: "A structured AI program with levels, chapters and interactive 10-minute lessons." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: () => getCurriculum(),
  component: LearnIndex,
  errorComponent: () => <div className="py-20 text-center text-muted-foreground">تعذّر تحميل البرنامج.</div>,
  notFoundComponent: () => <div className="py-20 text-center text-muted-foreground">غير موجود.</div>,
});

function LearnIndex() {
  const initial = Route.useLoaderData() as CurriculumProgram[];
  const { data: programs = initial } = useQuery<CurriculumProgram[]>({ queryKey: ["curriculum"], queryFn: () => getCurriculum(), initialData: initial });

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-4xl font-bold text-gold">البرنامج التعليمي</h1>
        <p className="text-muted-foreground mt-2">مستويات ← فصول دراسية ← فصول ← أجزاء ← دروس تفاعلية من 10 دقائق.</p>
      </header>

      {!programs.length && (
        <div className="glass rounded-3xl p-10 text-center text-muted-foreground border border-border/40">
          لم يُنشر أي برنامج بعد. أنشئ المحتوى من <span className="text-neon-cyan">Content Studio</span>.
        </div>
      )}

      {programs.map((program) => (
        <section key={program.id} className="space-y-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="size-6 text-neon-purple" />
            <h2 className="font-display text-2xl font-bold">{program.title}</h2>
          </div>
          {program.levels.map((level) => (
            <div key={level.id} className="glass rounded-3xl p-6 border border-border/40 space-y-5">
              <div>
                <div className="text-xs uppercase tracking-widest text-neon-cyan">المستوى {level.level_number}</div>
                <h3 className="font-display text-xl font-bold">{level.title}</h3>
                {level.description && <p className="text-sm text-muted-foreground mt-1">{level.description}</p>}
              </div>
              {level.courses.map((course) => (
                <div key={course.id} className="rounded-2xl border border-border/30 p-4">
                  <div className="font-semibold mb-3">{course.title}</div>
                  <div className="space-y-4">
                    {course.chapters.map((chapter) => (
                      <div key={chapter.id}>
                        <div className="text-sm font-medium text-neon-purple mb-2">{chapter.title}</div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {chapter.units.flatMap((unit) =>
                            unit.lessons.map((lesson) => (
                              <Link
                                key={lesson.id}
                                to="/learn/$slug"
                                params={{ slug: lesson.slug }}
                                className="rounded-2xl border border-border/40 p-4 hover:border-neon-purple/60 transition group"
                              >
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <BookOpen className="size-3.5" /> {unit.title}
                                </div>
                                <div className="font-semibold group-hover:text-neon-cyan">{lesson.title}</div>
                                {lesson.summary && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{lesson.summary}</p>}
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
                                  <span className="inline-flex items-center gap-1"><Clock className="size-3" />{lesson.duration_minutes}د</span>
                                  <span className="inline-flex items-center gap-1 text-neon-orange"><Star className="size-3" />{lesson.xp_reward} XP</span>
                                </div>
                              </Link>
                            )),
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
