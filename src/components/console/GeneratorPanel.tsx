import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Sparkles, Wand2, CheckCircle2, AlertTriangle, Rocket } from "lucide-react";
import {
  generateCourseOutline,
  saveCourseOutline,
  generateLessonContent,
  getCourseQueue,
  setSubtreeStatus,
  getGeneratorTargets,
  type CourseOutline,
} from "@/lib/api/generator.functions";
import { ErrorBox, PanelHeader } from "./ui";

type QueueItem = {
  id: string;
  title: string;
  status: string;
  unitTitle: string;
  chapterTitle: string;
  blocks: number;
  questions: number;
};

type RunState = Record<string, "idle" | "running" | "done" | "error">;

export function GeneratorPanel() {
  const qc = useQueryClient();
  const targets = useQuery({ queryKey: ["gen-targets"], queryFn: () => getGeneratorTargets() });

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [chapters, setChapters] = useState(3);
  const [unitsPerChapter, setUnitsPerChapter] = useState(2);
  const [lessonsPerUnit, setLessonsPerUnit] = useState(4);
  const [levelId, setLevelId] = useState("");
  const [outline, setOutline] = useState<CourseOutline | null>(null);
  const [courseId, setCourseId] = useState("");
  const [runState, setRunState] = useState<RunState>({});
  const [runError, setRunError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const levels = targets.data?.levels ?? [];
  const effectiveLevelId = levelId || levels[0]?.id || "";

  const outlineMut = useMutation({
    mutationFn: () =>
      generateCourseOutline({
        data: { topic, level, language, chapters, unitsPerChapter, lessonsPerUnit },
      }),
    onSuccess: (o) => setOutline(o as CourseOutline),
  });

  const saveMut = useMutation({
    mutationFn: () => saveCourseOutline({ data: { levelId: effectiveLevelId, outline: outline! } }),
    onSuccess: (res) => {
      setCourseId(res.courseId);
      setOutline(null);
      qc.invalidateQueries({ queryKey: ["gen-targets"] });
      qc.invalidateQueries({ queryKey: ["console-lms"] });
    },
  });

  const queue = useQuery({
    queryKey: ["gen-queue", courseId],
    queryFn: () => getCourseQueue({ data: { courseId } }),
    enabled: !!courseId,
  });

  const items = (queue.data ?? []) as QueueItem[];
  const pending = useMemo(() => items.filter((l) => l.blocks === 0 || l.questions === 0), [items]);

  async function runOne(id: string) {
    setRunState((s) => ({ ...s, [id]: "running" }));
    try {
      await generateLessonContent({ data: { lessonId: id, language, overwrite: true } });
      setRunState((s) => ({ ...s, [id]: "done" }));
    } catch (e) {
      setRunState((s) => ({ ...s, [id]: "error" }));
      setRunError((e as Error).message);
      throw e;
    }
  }

  async function runAll(list: QueueItem[]) {
    setBusy(true);
    setRunError(null);
    for (const l of list) {
      try {
        await runOne(l.id);
      } catch {
        /* keep going with the rest */
      }
      await new Promise((r) => setTimeout(r, 1200));
    }
    setBusy(false);
    queue.refetch();
    qc.invalidateQueries({ queryKey: ["console-lms"] });
  }

  const publishMut = useMutation({
    mutationFn: () => setSubtreeStatus({ data: { table: "courses", id: courseId, status: "published" } }),
    onSuccess: () => {
      queue.refetch();
      qc.invalidateQueries({ queryKey: ["console-lms"] });
    },
  });

  if (targets.error) return <ErrorBox error={targets.error} />;

  return (
    <div className="space-y-5">
      <PanelHeader
        title="مولّد الدروس"
        desc="ولّد منهجًا كاملًا (دورة ← فصول ← وحدات ← دروس) ثم اكتب محتوى كل درس تلقائيًا، وراجعه قبل النشر."
      />

      {/* Step 1 — spec */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-purple" /> 1. تحديد الموضوع
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="مثال: هندسة الأوامر للمبتدئين"
            className="glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none"
          />
          <select
            value={effectiveLevelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none"
          >
            {levels.map((l: any) => (
              <option key={l.id} value={l.id} className="bg-background">
                المستوى {l.level_number} — {l.title}
              </option>
            ))}
          </select>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none"
          >
            {["Beginner", "Intermediate", "Advanced"].map((d) => (
              <option key={d} value={d} className="bg-background">{d}</option>
            ))}
          </select>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "ar" | "en")}
            className="glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none"
          >
            <option value="ar" className="bg-background">العربية</option>
            <option value="en" className="bg-background">English</option>
          </select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <NumField label="فصول" value={chapters} onChange={setChapters} max={8} />
          <NumField label="وحدات / فصل" value={unitsPerChapter} onChange={setUnitsPerChapter} max={6} />
          <NumField label="دروس / وحدة" value={lessonsPerUnit} onChange={setLessonsPerUnit} max={8} />
        </div>
        <button
          disabled={topic.trim().length < 3 || outlineMut.isPending || !effectiveLevelId}
          onClick={() => outlineMut.mutate()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40"
        >
          {outlineMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          توليد المخطط
        </button>
        {outlineMut.error && <ErrorBox error={outlineMut.error} />}
      </div>

      {/* Step 2 — review outline */}
      {outline && (
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="text-sm font-semibold">2. مراجعة المخطط</div>
          <input
            value={outline.title}
            onChange={(e) => setOutline({ ...outline, title: e.target.value })}
            className="glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none w-full font-semibold"
          />
          <div className="space-y-3 max-h-[420px] overflow-auto pe-1">
            {outline.chapters.map((ch, ci) => (
              <div key={ci} className="rounded-xl border border-border/40 p-3 space-y-2">
                <input
                  value={ch.title}
                  onChange={(e) => {
                    const next = structuredClone(outline);
                    next.chapters[ci].title = e.target.value;
                    setOutline(next);
                  }}
                  className="bg-transparent outline-none text-sm font-semibold w-full"
                />
                {ch.units.map((un, ui) => (
                  <div key={ui} className="ms-3 space-y-1">
                    <div className="text-xs text-neon-cyan">{un.title}</div>
                    {un.lessons.map((ls, li) => (
                      <div key={li} className="flex items-center gap-2 ms-3">
                        <input
                          value={ls.title}
                          onChange={(e) => {
                            const next = structuredClone(outline);
                            next.chapters[ci].units[ui].lessons[li].title = e.target.value;
                            setOutline(next);
                          }}
                          className="bg-transparent outline-none text-xs flex-1 text-muted-foreground"
                        />
                        <button
                          onClick={() => {
                            const next = structuredClone(outline);
                            next.chapters[ci].units[ui].lessons.splice(li, 1);
                            setOutline(next);
                          }}
                          className="text-[11px] text-muted-foreground hover:text-neon-pink"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              disabled={saveMut.isPending}
              onClick={() => saveMut.mutate()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40"
            >
              {saveMut.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              حفظ كمسودة
            </button>
            <button onClick={() => setOutline(null)} className="px-4 py-2 rounded-xl glass text-sm">
              إلغاء
            </button>
          </div>
          {saveMut.error && <ErrorBox error={saveMut.error} />}
        </div>
      )}

      {/* Step 3 — content generation queue */}
      <div className="glass rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="text-sm font-semibold">3. توليد محتوى الدروس</div>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="glass rounded-xl px-3 py-2 text-sm bg-transparent outline-none ms-auto"
          >
            <option value="" className="bg-background">اختر دورة…</option>
            {(targets.data?.courses ?? []).map((c: any) => (
              <option key={c.id} value={c.id} className="bg-background">{c.title}</option>
            ))}
          </select>
        </div>

        {courseId && (
          <>
            <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
              <span>{items.length} درس · {pending.length} بحاجة إلى محتوى</span>
              <div className="ms-auto flex gap-2">
                <button
                  disabled={busy || pending.length === 0}
                  onClick={() => runAll(pending)}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-neon-purple to-neon-blue text-xs font-semibold inline-flex items-center gap-2 disabled:opacity-40"
                >
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                  توليد الدروس الفارغة
                </button>
                <button
                  disabled={busy || items.length === 0}
                  onClick={() => runAll(items)}
                  className="px-3 py-2 rounded-lg glass text-xs disabled:opacity-40"
                >
                  إعادة توليد الكل
                </button>
                <button
                  disabled={publishMut.isPending || items.length === 0}
                  onClick={() => publishMut.mutate()}
                  className="px-3 py-2 rounded-lg glass border-neon-cyan/40 text-xs inline-flex items-center gap-2 disabled:opacity-40"
                >
                  <Rocket className="w-3.5 h-3.5" /> نشر الدورة
                </button>
              </div>
            </div>

            {runError && (
              <div className="text-xs text-neon-pink flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5" /> {runError}
              </div>
            )}

            <div className="rounded-xl divide-y divide-border/40 overflow-hidden border border-border/40">
              {items.map((l) => {
                const st = runState[l.id] ?? "idle";
                const complete = l.blocks > 0 && l.questions > 0;
                return (
                  <div key={l.id} className="p-3 flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex-1 min-w-[220px]">
                      <div className="font-medium">{l.title}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {l.chapterTitle} · {l.unitTitle} · {l.blocks} فقرة · {l.questions} سؤال
                      </div>
                    </div>
                    {st === "running" && <Loader2 className="w-4 h-4 animate-spin text-neon-purple" />}
                    {st === "error" && <AlertTriangle className="w-4 h-4 text-neon-pink" />}
                    {(st === "done" || complete) && st !== "error" && st !== "running" && (
                      <CheckCircle2 className="w-4 h-4 text-neon-cyan" />
                    )}
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${l.status === "published" ? "bg-neon-cyan/15 text-neon-cyan" : "bg-muted/30 text-muted-foreground"}`}>
                      {l.status === "published" ? "منشور" : "مسودة"}
                    </span>
                    <button
                      disabled={busy}
                      onClick={() => runAll([l])}
                      className="px-3 py-1.5 rounded-lg glass text-xs disabled:opacity-40"
                    >
                      {complete ? "إعادة التوليد" : "توليد"}
                    </button>
                  </div>
                );
              })}
              {items.length === 0 && !queue.isLoading && (
                <div className="p-6 text-center text-sm text-muted-foreground">لا توجد دروس في هذه الدورة.</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, max }: { label: string; value: number; onChange: (n: number) => void; max: number }) {
  return (
    <label className="glass rounded-xl px-3 py-2 text-xs flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <input
        type="number"
        min={1}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(1, Number(e.target.value) || 1)))}
        className="bg-transparent outline-none w-14 text-end"
      />
    </label>
  );
}
