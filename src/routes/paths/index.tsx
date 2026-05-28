import { createFileRoute } from "@tanstack/react-router";
import { PathCard } from "@/components/PathCard";
import { useContent } from "@/hooks/use-content";

export const Route = createFileRoute("/paths/")({
  head: () => ({ meta: [{ title: "Learning Paths — HN-AI" }, { name: "description", content: "Curated AI learning paths from beginner to advanced." }] }),
  component: Paths,
});

function Paths() {
  const { paths } = useContent();
  return (
    <div className="space-y-6">
      <header className="glass-strong rounded-3xl p-6 border-neon-purple/30 relative overflow-hidden">
        <div className="absolute -top-10 -left-10 size-60 rounded-full bg-neon-purple/20 blur-3xl pointer-events-none" />
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">Learning Paths</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">Curated journeys, from zero to AI engineer. Pick one and we'll handle the daily 10-minute structure.</p>
      </header>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {paths.map((p) => <PathCard key={p.id} path={p} />)}
      </div>
    </div>
  );
}
