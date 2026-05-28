import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lessons } from "@/lib/data/mockData";
import { Clock, Sparkles, Play, Check, ChevronLeft, Lightbulb, Target } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { completeLesson } from "@/lib/services/userService";
import { toast } from "sonner";

export const Route = createFileRoute("/lessons/$id")({
  loader: ({ params }) => {
    const lesson = lessons.find((l) => l.id === params.id);
    if (!lesson) throw notFound();
    return { lesson };
  },
  head: ({ params }) => {
    const l = lessons.find((x) => x.id === params.id);
    return { meta: [{ title: `${l?.title ?? "Lesson"} — HN-AI` }, { name: "description", content: l?.description ?? "AI lesson." }] };
  },
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Lesson not found.</div>,
  errorComponent: () => <div className="p-10 text-center text-destructive">Couldn't load this lesson.</div>,
  component: LessonView,
});

function LessonView() {
  const { lesson } = Route.useLoaderData();
  const user = useUser();
  const done = user.completedLessons.includes(lesson.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/lessons" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Back to Lessons
      </Link>

      {/* Hero */}
      <header className="glass-strong rounded-3xl p-6 sm:p-8 border-neon-purple/40 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 size-60 rounded-full bg-neon-purple/20 blur-3xl pointer-events-none" />
        <div className="text-[11px] uppercase tracking-wider text-neon-cyan font-semibold">{lesson.difficulty}</div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight mt-1">{lesson.title}</h1>
        <p className="text-muted-foreground mt-2">{lesson.description}</p>
        <div className="flex flex-wrap gap-3 mt-4 text-xs">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full glass border-neon-blue/30"><Clock className="size-3 text-neon-blue" /> {lesson.duration} min</span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full glass border-neon-orange/30 text-neon-orange font-bold">+{lesson.xpReward} XP</span>
        </div>
      </header>

      {/* Video placeholder */}
      <div className="relative aspect-video glass rounded-2xl grid place-items-center border-neon-blue/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,oklch(0.72_0.22_245/0.25),transparent_60%)]" />
        <button className="relative size-20 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center glow-purple ring-pulse">
          <Play className="size-8 text-white fill-white ml-1" />
        </button>
      </div>

      {/* Content */}
      <section className="glass rounded-2xl p-6">
        <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><Lightbulb className="size-5 text-neon-orange" /> The Idea</h2>
        <p className="text-foreground/90 leading-relaxed">{lesson.content}</p>
      </section>

      <section className="glass rounded-2xl p-6 border-neon-cyan/30">
        <h2 className="font-display font-bold text-xl mb-3">Example</h2>
        <pre className="text-sm whitespace-pre-wrap bg-background/40 rounded-xl p-4 border border-border/40">{lesson.example}</pre>
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display font-bold text-xl mb-3">Prompt Examples — Try Them Now</h2>
        <div className="space-y-2">
          {lesson.promptExamples.map((p: string, i: number) => (
            <div key={i} className="rounded-xl p-4 border border-neon-purple/30 bg-neon-purple/5 text-sm">
              <span className="text-neon-purple font-semibold mr-2">{i + 1}.</span>{p}
            </div>
          ))}
        </div>
        <Link to="/playground" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-cyan/30 to-neon-blue/30 border border-neon-cyan/40 text-neon-cyan font-semibold text-sm hover:bg-neon-cyan/20">
          <Sparkles className="size-4" /> Open in AI Playground
        </Link>
      </section>

      <section className="glass rounded-2xl p-6 border-neon-orange/30">
        <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2"><Target className="size-5 text-neon-orange" /> Mini Challenge</h2>
        <p>{lesson.challenge}</p>
      </section>

      <div className="flex justify-end">
        <button
          disabled={done}
          onClick={() => {
            completeLesson(lesson.id, lesson.xpReward);
            toast.success(`+${lesson.xpReward} XP — lesson complete!`);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold glow-purple hover:scale-105 transition disabled:opacity-50"
        >
          {done ? <><Check className="size-4" /> Completed</> : <><Sparkles className="size-4" /> Mark Complete (+{lesson.xpReward} XP)</>}
        </button>
      </div>
    </div>
  );
}
