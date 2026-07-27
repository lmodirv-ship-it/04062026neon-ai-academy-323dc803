import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Save, Loader2, Shield } from "lucide-react";
import {
  getStudioTree, upsertNode, deleteNode, saveLessonContent, getLessonForEdit, generateLessonDraft,
} from "@/lib/api/studio.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/studio")({
  head: () => ({
    meta: [
      { title: "Content Studio — HN-AI Academy" },
      { name: "description", content: "Build the HN-AI curriculum: programs, levels, courses, chapters, units and AI-generated lessons." },
      { property: "og:title", content: "Content Studio — HN-AI Academy" },
      { property: "og:description", content: "Build the HN-AI curriculum with AI-assisted lesson authoring." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Studio,
});

type Draft = Awaited<ReturnType<typeof generateLessonDraft>>;

function Studio() {
  const { isEditor, role } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["studio-tree"], queryFn: () => getStudioTree() });

  const [sel, setSel] = useState<Record<string, string | null>>({});
  const pick = (k: string, v: string | null) => setSel((s) => ({ ...s, [k]: v }));

  const save = useMutation({
    mutationFn: (v: { table: any; values: Record<string, any> }) => upsertNode({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studio-tree"] }); toast.success("تم الحفظ"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (v: { table: any; id: string }) => deleteNode({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["studio-tree"] }); toast.success("تم الحذف"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (role && !isEditor) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <Shield className="size-10 mx-auto text-neon-pink mb-4" />
        <h1 className="font-display text-2xl font-bold">صلاحية مطلوبة</h1>
        <p className="text-sm text-muted-foreground mt-2">هذه اللوحة مخصّصة للمدير والمحرّرين فقط.</p>
      </div>
    );
  }
  if (isLoading) return <div className="py-20 text-center text-muted-foreground">جارٍ التحميل…</div>;
  if (error) return <div className="py-20 text-center text-neon-pink">{(error as Error).message}</div>;

  const t = data!;
  const levels = t.levels.filter((l: any) => l.program_id === sel.program);
  const courses = t.courses.filter((c: any) => c.level_id === sel.level);
  const chapters = t.chapters.filter((c: any) => c.course_id === sel.course);
  const units = t.units.filter((u: any) => u.chapter_id === sel.chapter);
  const lessons = t.lessons.filter((l: any) => l.unit_id === sel.unit);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-gold">Content Studio</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ابنِ البرنامج التعليمي: برنامج ← مستوى ← فصل دراسي ← فصل ← جزء ← درس.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-4">
        <Column
          title="البرامج" items={t.programs} selected={sel.program}
          onSelect={(id) => { pick("program", id); pick("level", null); pick("course", null); pick("chapter", null); pick("unit", null); }}
          onAdd={(title) => save.mutate({ table: "programs", values: { title, slug: slugify(title), status: "published", order_index: t.programs.length } })}
          onDelete={(id) => remove.mutate({ table: "programs", id })}
          onToggle={(row) => save.mutate({ table: "programs", values: { ...row, status: row.status === "published" ? "draft" : "published" } })}
        />
        <Column
          title="المستويات" items={levels} disabled={!sel.program} selected={sel.level}
          onSelect={(id) => { pick("level", id); pick("course", null); pick("chapter", null); pick("unit", null); }}
          onAdd={(title) => save.mutate({ table: "levels", values: { title, program_id: sel.program, level_number: levels.length + 1, status: "published", order_index: levels.length } })}
          onDelete={(id) => remove.mutate({ table: "levels", id })}
          onToggle={(row) => save.mutate({ table: "levels", values: { ...row, status: row.status === "published" ? "draft" : "published" } })}
        />
        <Column
          title="الفصول الدراسية" items={courses} disabled={!sel.level} selected={sel.course}
          onSelect={(id) => { pick("course", id); pick("chapter", null); pick("unit", null); }}
          onAdd={(title) => save.mutate({ table: "courses", values: { title, slug: slugify(title), level_id: sel.level, status: "published", order_index: courses.length } })}
          onDelete={(id) => remove.mutate({ table: "courses", id })}
          onToggle={(row) => save.mutate({ table: "courses", values: { ...row, status: row.status === "published" ? "draft" : "published" } })}
        />
        <Column
          title="الفصول" items={chapters} disabled={!sel.course} selected={sel.chapter}
          onSelect={(id) => { pick("chapter", id); pick("unit", null); }}
          onAdd={(title) => save.mutate({ table: "chapters", values: { title, course_id: sel.course, status: "published", order_index: chapters.length } })}
          onDelete={(id) => remove.mutate({ table: "chapters", id })}
          onToggle={(row) => save.mutate({ table: "chapters", values: { ...row, status: row.status === "published" ? "draft" : "published" } })}
        />
        <Column
          title="الأجزاء" items={units} disabled={!sel.chapter} selected={sel.unit}
          onSelect={(id) => pick("unit", id)}
          onAdd={(title) => save.mutate({ table: "units", values: { title, chapter_id: sel.chapter, status: "published", order_index: units.length } })}
          onDelete={(id) => remove.mutate({ table: "units", id })}
          onToggle={(row) => save.mutate({ table: "units", values: { ...row, status: row.status === "published" ? "draft" : "published" } })}
        />
        <Column
          title="الدروس" items={lessons} disabled={!sel.unit} selected={sel.lesson}
          onSelect={(id) => pick("lesson", id)}
          onAdd={(title) => save.mutate({ table: "lessons", values: { title, slug: slugify(title), unit_id: sel.unit, status: "published", order_index: lessons.length } })}
          onDelete={(id) => remove.mutate({ table: "lessons", id })}
          onToggle={(row) => save.mutate({ table: "lessons", values: { ...row, status: row.status === "published" ? "draft" : "published" } })}
        />
      </div>

      {sel.lesson && <LessonEditor lessonId={sel.lesson} lessonTitle={lessons.find((l: any) => l.id === sel.lesson)?.title ?? ""} />}
    </div>
  );
}

function Column({
  title, items, selected, disabled, onSelect, onAdd, onDelete, onToggle,
}: {
  title: string; items: any[]; selected?: string | null; disabled?: boolean;
  onSelect: (id: string) => void; onAdd: (title: string) => void;
  onDelete: (id: string) => void; onToggle: (row: any) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div className={`glass rounded-2xl p-4 border border-border/40 ${disabled ? "opacity-40 pointer-events-none" : ""}`}>
      <div className="font-semibold mb-3">{title}</div>
      <div className="space-y-1 max-h-56 overflow-y-auto mb-3">
        {items.map((it) => (
          <div key={it.id} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${selected === it.id ? "bg-neon-purple/20 border border-neon-purple/40" : "hover:bg-muted/20"}`}>
            <button className="flex-1 text-right truncate" onClick={() => onSelect(it.id)}>{it.title}</button>
            <button title="نشر/مسودة" onClick={() => onToggle(it)} className={`text-[10px] px-1.5 py-0.5 rounded ${it.status === "published" ? "bg-neon-cyan/20 text-neon-cyan" : "bg-muted/40 text-muted-foreground"}`}>
              {it.status === "published" ? "منشور" : "مسودة"}
            </button>
            <button onClick={() => onDelete(it.id)} className="text-muted-foreground hover:text-neon-pink"><Trash2 className="size-3.5" /></button>
          </div>
        ))}
        {!items.length && <div className="text-xs text-muted-foreground py-2">لا عناصر بعد</div>}
      </div>
      <div className="flex gap-2">
        <input
          value={value} onChange={(e) => setValue(e.target.value)} placeholder="عنوان جديد"
          className="flex-1 rounded-lg bg-muted/20 border border-border/40 px-2 py-1.5 text-sm outline-none focus:border-neon-purple/60"
        />
        <button
          onClick={() => { if (value.trim()) { onAdd(value.trim()); setValue(""); } }}
          className="rounded-lg px-2 bg-gradient-to-r from-neon-purple to-neon-blue text-white"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function LessonEditor({ lessonId, lessonTitle }: { lessonId: string; lessonTitle: string }) {
  const qc = useQueryClient();
  const [topic, setTopic] = useState(lessonTitle);
  const [draft, setDraft] = useState<Draft | null>(null);
  const { data: existing } = useQuery({ queryKey: ["lesson-edit", lessonId], queryFn: () => getLessonForEdit({ data: { lessonId } }) });

  const gen = useMutation({
    mutationFn: () => generateLessonDraft({ data: { topic, level: "Beginner", language: "ar" } }),
    onSuccess: (d) => { setDraft(d); toast.success("تم توليد مسودة الدرس"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const persist = useMutation({
    mutationFn: () =>
      saveLessonContent({
        data: {
          lessonId,
          blocks: draft!.blocks.map((b) => ({ kind: b.kind, content: b.content, language: b.language ?? null })),
          questions: draft!.questions.map((q) => ({
            prompt: q.prompt, explanation: q.explanation ?? null, xp: q.xp || 10,
            options: q.options.map((o) => ({ label: o.label, is_correct: o.is_correct })),
          })),
        },
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lesson-edit", lessonId] }); toast.success("تم نشر محتوى الدرس"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <section className="glass-strong rounded-3xl p-6 border border-border/40 space-y-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-neon-cyan" />
        <h2 className="font-display text-xl font-bold">محرّر الدرس — {lessonTitle}</h2>
      </div>

      <div className="text-xs text-muted-foreground">
        المحتوى الحالي: {existing?.blocks.length ?? 0} فقرة، {existing?.questions.length ?? 0} سؤال.
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="موضوع الدرس"
          className="flex-1 min-w-[220px] rounded-xl bg-muted/20 border border-border/40 px-3 py-2 text-sm outline-none focus:border-neon-cyan/60"
        />
        <button
          disabled={gen.isPending || !topic.trim()}
          onClick={() => gen.mutate()}
          className="rounded-xl px-4 py-2 font-semibold bg-gradient-to-r from-neon-cyan to-neon-blue text-black inline-flex items-center gap-2 disabled:opacity-60"
        >
          {gen.isPending ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          توليد بالذكاء الاصطناعي
        </button>
      </div>

      {draft && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/40 p-4 space-y-3 max-h-[420px] overflow-y-auto">
            <div className="font-bold">{draft.title}</div>
            <div className="text-sm text-muted-foreground">{draft.summary}</div>
            {draft.blocks.map((b, i) => (
              <div key={i} className="text-sm whitespace-pre-wrap rounded-lg bg-muted/15 p-3">
                <span className="text-[10px] uppercase text-neon-purple">{b.kind}</span>
                <div className="mt-1">{b.content}</div>
              </div>
            ))}
            {draft.questions.map((q, i) => (
              <div key={i} className="text-sm rounded-lg border border-neon-purple/30 p-3">
                <div className="font-medium">{i + 1}. {q.prompt}</div>
                <ul className="mt-1 space-y-0.5">
                  {q.options.map((o, oi) => (
                    <li key={oi} className={o.is_correct ? "text-neon-cyan" : "text-muted-foreground"}>• {o.label}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <button
            disabled={persist.isPending}
            onClick={() => persist.mutate()}
            className="rounded-xl px-5 py-2.5 font-semibold bg-gradient-to-r from-neon-purple to-neon-blue text-white glow-purple inline-flex items-center gap-2 disabled:opacity-60"
          >
            {persist.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            حفظ في الدرس
          </button>
        </div>
      )}
    </section>
  );
}

function slugify(s: string) {
  const base = s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
  return `${base || "item"}-${Math.random().toString(36).slice(2, 6)}`;
}
