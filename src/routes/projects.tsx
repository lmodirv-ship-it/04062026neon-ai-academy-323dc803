import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { useContent } from "@/hooks/use-content";
import { useAuth } from "@/hooks/use-auth";
import { completeProject } from "@/lib/services/userService";
import { submitProject, mySubmissions, type SubmissionRow } from "@/lib/api/learning.functions";
import { Check, Rocket, Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "المشاريع المصغّرة — HN-AI" },
      { name: "description", content: "ابنِ مشاريع ذكاء اصطناعي صغيرة وسلّمها للمراجعة واحصل على تقييم ونقاط XP." },
      { property: "og:title", content: "المشاريع المصغّرة — HN-AI" },
      { property: "og:description", content: "مشاريع صغيرة حقيقية تُنجز في ساعات، مع مراجعة وتقييم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Projects,
});

const STATUS_LABEL: Record<string, string> = {
  submitted: "قيد المراجعة",
  approved: "مقبول ✅",
  changes_requested: "يحتاج تعديل",
};

function Projects() {
  const user = useUser();
  const { user: authUser } = useAuth();
  const { projects: miniProjects } = useContent();
  const qc = useQueryClient();
  const [openFor, setOpenFor] = useState<{ slug: string; title: string } | null>(null);

  const { data: subs = [] } = useQuery<SubmissionRow[]>({
    queryKey: ["my-submissions"],
    queryFn: () => mySubmissions() as Promise<SubmissionRow[]>,
    enabled: !!authUser,
  });

  return (
    <div className="space-y-6">
      <header className="glass-strong rounded-3xl p-6 border-neon-orange/30 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 size-60 rounded-full bg-neon-orange/20 blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-orange/15 border border-neon-orange/40 text-neon-orange text-xs font-semibold mb-3">
          <Rocket className="size-3.5" /> Ship Something Tiny
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">Mini Projects</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">مشاريع صغيرة حقيقية تُنجز في ساعات — اختر واحدًا وسلّمه للمراجعة.</p>
      </header>

      {subs.length > 0 && (
        <section className="glass rounded-3xl border border-border/40 p-5">
          <h2 className="font-display font-bold mb-3">تسليماتي</h2>
          <ul className="space-y-2">
            {subs.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/40 px-4 py-3 text-sm">
                <span className="min-w-0 flex-1 truncate">{s.project_title}</span>
                <span className="text-xs text-neon-cyan">{STATUS_LABEL[s.status] ?? s.status}</span>
                {s.score > 0 && <span className="text-xs text-neon-orange">{s.score}/100</span>}
                {s.review_notes && <p className="w-full text-xs text-muted-foreground">{s.review_notes}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {miniProjects.map((p) => {
          const done = user.completedProjects.includes(p.id);
          return (
            <div key={p.id} className="glass rounded-2xl p-5 border-neon-blue/20 hover:border-neon-blue/50 transition flex flex-col">
              <div className="aspect-video rounded-xl bg-gradient-to-br from-neon-purple/20 via-neon-blue/15 to-neon-cyan/20 border border-neon-purple/30 grid place-items-center text-6xl mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,oklch(0.65_0.27_305/0.35),transparent_60%)]" />
                <span className="relative">{p.emoji}</span>
              </div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] uppercase tracking-wider text-neon-cyan font-semibold">{p.difficulty}</span>
                <span className="text-xs text-neon-orange font-bold">+{p.xpReward} XP</span>
              </div>
              <h3 className="font-display font-bold text-lg">{p.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 flex-1">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {p.tags.map((t) => (
                  <span key={t} className="px-2 py-0.5 text-[10px] rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/30">{t}</span>
                ))}
              </div>
              <div className="mt-4 grid gap-2">
                <button
                  disabled={done}
                  onClick={() => {
                    completeProject(p.id, p.xpReward);
                    toast.success(`Project shipped! +${p.xpReward} XP`);
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-gradient-to-r from-neon-orange to-neon-pink text-black font-semibold text-sm hover:scale-[1.02] transition disabled:opacity-50"
                >
                  {done ? <span className="inline-flex items-center gap-1 justify-center"><Check className="size-4" /> Shipped</span> : "Start Project"}
                </button>
                <button
                  onClick={() => (authUser ? setOpenFor({ slug: p.id, title: p.title }) : toast.info("سجّل الدخول لتسليم مشروعك."))}
                  className="w-full px-4 py-2 rounded-xl border border-neon-cyan/40 text-neon-cyan text-sm inline-flex items-center justify-center gap-1.5"
                >
                  <Upload className="size-4" /> سلّم للمراجعة
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {openFor && (
        <SubmitDialog
          project={openFor}
          onClose={() => setOpenFor(null)}
          onDone={() => { setOpenFor(null); qc.invalidateQueries({ queryKey: ["my-submissions"] }); }}
        />
      )}
    </div>
  );
}

function SubmitDialog({
  project,
  onClose,
  onDone,
}: {
  project: { slug: string; title: string };
  onClose: () => void;
  onDone: () => void;
}) {
  const [repoUrl, setRepoUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!repoUrl && !demoUrl) return toast.error("أضف رابط المستودع أو رابط التجربة.");
    setBusy(true);
    try {
      await submitProject({
        data: { projectSlug: project.slug, projectTitle: project.title, repoUrl, demoUrl, notes },
      });
      toast.success("تم إرسال المشروع للمراجعة 🚀");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="glass-strong w-full max-w-md rounded-3xl border border-border/40 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold">تسليم: {project.title}</h3>
          <button onClick={onClose} aria-label="إغلاق"><X className="size-4" /></button>
        </div>
        <input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="https://github.com/..."
          dir="ltr"
          className="w-full rounded-xl border border-border/40 bg-transparent px-4 py-2.5 text-sm"
        />
        <input
          value={demoUrl}
          onChange={(e) => setDemoUrl(e.target.value)}
          placeholder="https://demo-url..."
          dir="ltr"
          className="w-full rounded-xl border border-border/40 bg-transparent px-4 py-2.5 text-sm"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ملاحظاتك حول المشروع…"
          rows={3}
          className="w-full rounded-xl border border-border/40 bg-transparent px-4 py-2.5 text-sm"
        />
        <button
          onClick={save}
          disabled={busy}
          className="w-full rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue px-4 py-2.5 font-semibold text-white inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {busy && <Loader2 className="size-4 animate-spin" />} إرسال
        </button>
      </div>
    </div>
  );
}
