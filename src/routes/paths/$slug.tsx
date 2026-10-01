import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, Clock, Lock, ChevronRight, Check } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useContent } from "@/hooks/use-content";
import { getAllLessons, getAllPaths } from "@/lib/services/contentService";

export const Route = createFileRoute("/paths/$slug")({
  head: ({ params }) => {
    const p = getAllPaths().find((x) => x.slug === params.slug);
    return { meta: [{ title: `${p?.title ?? "Path"} — HN-AI` }, { name: "description", content: p?.description ?? "AI learning path." }] };
  },
  loader: ({ params }) => {
    const path = getAllPaths().find((x) => x.slug === params.slug);
    if (!path) throw notFound();
    return { path };
  },
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Path not found.</div>,
  errorComponent: () => <div className="p-10 text-center text-destructive">Couldn't load this path.</div>,
  component: PathDetail,
});

function PathDetail() {
  const { path } = Route.useLoaderData() as { path: NonNullable<ReturnType<typeof getAllPaths>[number]> };
  const user = useUser();
  useContent(); // re-render when admin adds lessons
  const pathLessons = getAllLessons().filter((l) => l.pathSlug === path.slug);
  // pad with stubs to show structure
  const totalSlots = Math.max(path.lessons, pathLessons.length);
  const stubs = Array.from({ length: Math.max(0, totalSlots - pathLessons.length) }, (_, i) => ({
    id: `stub-${path.slug}-${i}`,
    title: `Lesson ${pathLessons.length + i + 1}`,
    duration: 8,
    xpReward: 10,
    stub: true as const,
  }));

  return (
    <div className="space-y-6">
      <header className="glass-strong rounded-3xl p-8 border-neon-purple/40 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 size-72 rounded-full bg-neon-purple/20 blur-3xl pointer-events-none" />
        <div className="text-xs uppercase tracking-wider text-neon-cyan font-semibold mb-2">{path.difficulty} Path</div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">{path.title}</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl">{path.description}</p>
        <div className="flex flex-wrap gap-3 mt-5 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-neon-blue/30"><BookOpen className="size-4 text-neon-blue" /> {totalSlots} lessons</span>
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-neon-cyan/30"><Clock className="size-4 text-neon-cyan" /> ~10 min each</span>
        </div>
      </header>

      <div className="space-y-3">
        {pathLessons.map((l, i) => {
          const done = user.completedLessons.includes(l.id);
          return (
            <Link key={l.id} to="/lessons/$id" params={{ id: l.id }} className="group flex items-center gap-4 glass rounded-2xl p-4 hover:border-neon-cyan/50 hover:glow-cyan transition">
              <div className={`size-12 rounded-xl grid place-items-center border ${done ? "border-neon-cyan/60 bg-neon-cyan/15 text-neon-cyan" : "border-neon-purple/40 bg-neon-purple/15 text-neon-purple"} font-display font-bold`}>
                {done ? <Check className="size-5" /> : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold">{l.title}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{l.description}</div>
              </div>
              <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {l.duration} min</span>
                <span className="text-neon-orange font-bold">+{l.xpReward} XP</span>
              </div>
              <ChevronRight className="size-4 text-muted-foreground group-hover:text-neon-cyan transition" />
            </Link>
          );
        })}
        {stubs.map((s, i) => (
          <div key={s.id} className="flex items-center gap-4 glass rounded-2xl p-4 opacity-50">
            <div className="size-12 rounded-xl grid place-items-center border border-border/50 bg-background/40 text-muted-foreground font-display font-bold">
              {pathLessons.length + i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold flex items-center gap-2">{s.title} <Lock className="size-3 text-muted-foreground" /></div>
              <div className="text-xs text-muted-foreground">Coming soon to your daily mission feed.</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
