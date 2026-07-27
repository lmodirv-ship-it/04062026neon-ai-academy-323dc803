import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Check, X, Star, Trophy, Sparkles, Loader2, Clock, Zap, PlayCircle } from "lucide-react";
import { getLesson, type LessonDetail } from "@/lib/api/curriculum.functions";
import { answerQuestion, completeLesson } from "@/lib/api/progress.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/learn/$slug")({
  loader: ({ params }) => getLesson({ data: { slug: params.slug } }),
  head: ({ loaderData }) => {
    const title = (loaderData as LessonDetail | null)?.title ?? "Lesson";
    const desc = (loaderData as LessonDetail | null)?.summary ?? "An interactive 10-minute AI lesson on HN-AI Academy.";
    return {
      meta: [
        { title: `${title} — HN-AI Academy` },
        { name: "description", content: desc.slice(0, 155) },
        { property: "og:title", content: `${title} — HN-AI Academy` },
        { property: "og:description", content: desc.slice(0, 155) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LessonPlayer,
  errorComponent: () => <div className="py-20 text-center text-muted-foreground">تعذّر تحميل الدرس.</div>,
  notFoundComponent: () => <div className="py-20 text-center text-muted-foreground">الدرس غير موجود.</div>,
});

const CHEERS = ["ممتاز! 🔥", "أحسنت! ⚡", "عبقري! 🚀", "إجابة ملكية 👑", "تقدّم رائع ✨"];

function LessonPlayer() {
  const initial = Route.useLoaderData() as LessonDetail | null;
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: lesson } = useQuery<LessonDetail | null>({
    queryKey: ["lesson", slug],
    queryFn: () => getLesson({ data: { slug } }) as Promise<LessonDetail | null>,
    initialData: initial,
  });

  const steps = useMemo(() => {
    if (!lesson) return [] as Array<{ type: "block" | "question"; index: number }>;
    return [
      ...lesson.blocks.map((_, i) => ({ type: "block" as const, index: i })),
      ...lesson.questions.map((_, i) => ({ type: "question" as const, index: i })),
    ];
  }, [lesson]);

  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<{ correct: boolean; explanation: string | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState<{ earned: number; accuracy: number } | null>(null);

  if (!lesson) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">الدرس غير متاح.</p>
        <Link to="/learn" className="text-neon-cyan text-sm">عودة للبرنامج</Link>
      </div>
    );
  }

  const total = steps.length;
  const current = steps[step];
  const progress = total ? Math.round(((step + (done ? 1 : 0)) / total) * 100) : 0;
  const questionCount = lesson.questions.length;

  const submitAnswer = async (optionId: string) => {
    if (result || busy) return;
    const q = lesson.questions[current.index];
    setPicked(optionId);
    if (!user) {
      toast.info("سجّل الدخول لحفظ تقدّمك ونقاطك.");
      setResult({ correct: false, explanation: q.explanation });
      return;
    }
    setBusy(true);
    try {
      const r = await answerQuestion({ data: { questionId: q.id, optionId } });
      setResult({ correct: r.correct, explanation: r.explanation });
      if (r.correct) {
        setCorrectCount((c) => c + 1);
        toast.success(CHEERS[Math.floor(Math.random() * CHEERS.length)]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    } finally {
      setBusy(false);
    }
  };

  const next = async () => {
    setPicked(null);
    setResult(null);
    if (step < total - 1) {
      setStep((s) => s + 1);
      return;
    }
    if (!user) {
      setDone({ earned: 0, accuracy: 0 });
      return;
    }
    setBusy(true);
    try {
      const r = await completeLesson({ data: { lessonId: lesson.id, correct: correctCount, total: questionCount } });
      setDone({ earned: r.earned, accuracy: r.accuracy });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطأ");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-6">
        <div className="relative mx-auto size-24 grid place-items-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-neon-purple/40 to-neon-orange/40 blur-2xl" />
          <Trophy className="size-16 relative text-neon-orange" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gold">أنهيت الدرس!</h1>
        <p className="text-muted-foreground">{lesson.title}</p>
        <div className="grid grid-cols-3 gap-3">
          <Box label="XP" value={`+${done.earned}`} />
          <Box label="الدقة" value={`${done.accuracy}%`} />
          <Box label="إجابات صحيحة" value={`${correctCount}/${questionCount}`} />
        </div>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          {lesson.next_slug && (
            <button
              onClick={() => { navigate({ to: "/learn/$slug", params: { slug: lesson.next_slug! } }); setDone(null); setStep(0); setCorrectCount(0); }}
              className="rounded-xl px-5 py-2.5 font-semibold bg-gradient-to-r from-neon-purple to-neon-blue text-white glow-purple inline-flex items-center gap-2"
            >
              الدرس التالي <ArrowLeft className="size-4" />
            </button>
          )}
          {lesson.course_slug && (
            <Link to="/courses/$slug" params={{ slug: lesson.course_slug }} className="rounded-xl px-5 py-2.5 font-semibold border border-border/50">
              صفحة الدورة
            </Link>
          )}
          <Link to="/learn" className="rounded-xl px-5 py-2.5 font-semibold border border-border/50">البرنامج</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-28">
      {/* Sticky HUD header */}
      <div className="sticky top-0 z-30 -mx-4 px-4 pt-3 pb-3 backdrop-blur-xl bg-background/70 border-b border-border/30">
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <div className="truncate text-muted-foreground">
              {lesson.course_title && (
                <>
                  <span className="text-gold">{lesson.course_title}</span>
                  <span className="mx-1.5 opacity-40">/</span>
                </>
              )}
              {lesson.unit_title}
            </div>
            <h1 className="truncate font-display text-base font-bold">{lesson.title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-border/40 px-2.5 py-1">
              <Clock className="size-3.5" /> {lesson.duration_minutes}د
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-neon-orange/40 text-neon-orange px-2.5 py-1">
              <Zap className="size-3.5" /> {lesson.xp_reward} XP
            </span>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-muted/30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-neon-purple via-neon-blue to-neon-cyan transition-all duration-500 glow-purple"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] text-muted-foreground">
          <span>{step + 1} / {total}</span>
          <span>{progress}%</span>
        </div>
      </div>

      <div className="space-y-6 pt-6">
        {current?.type === "block" && (
          <article className="glass-strong rounded-3xl p-6 border border-border/40">
            <BlockView block={lesson.blocks[current.index]} />
          </article>
        )}

        {current?.type === "question" && (
          <div className="glass-strong rounded-3xl p-6 border border-border/40 space-y-4">
            <div className="flex items-center gap-2 text-xs text-neon-cyan">
              <Sparkles className="size-4" /> اختر الإجابة الصحيحة
            </div>
            <h2 className="font-display text-xl font-bold">{lesson.questions[current.index].prompt}</h2>
            <div className="space-y-2">
              {lesson.questions[current.index].options.map((o) => {
                const isPicked = picked === o.id;
                const state = result && isPicked ? (result.correct ? "correct" : "wrong") : "idle";
                return (
                  <button
                    key={o.id}
                    onClick={() => submitAnswer(o.id)}
                    disabled={!!result || busy}
                    className={`w-full text-right rounded-2xl border px-4 py-3.5 text-sm transition flex items-center justify-between gap-3 ${
                      state === "correct"
                        ? "border-neon-cyan bg-neon-cyan/15"
                        : state === "wrong"
                          ? "border-neon-pink bg-neon-pink/15"
                          : "border-border/40 hover:border-neon-purple/60 hover:bg-neon-purple/5"
                    }`}
                  >
                    <span>{o.label}</span>
                    {state === "correct" && <Check className="size-4 text-neon-cyan" />}
                    {state === "wrong" && <X className="size-4 text-neon-pink" />}
                  </button>
                );
              })}
            </div>
            {result && (
              <div className={`rounded-2xl p-4 text-sm ${result.correct ? "bg-neon-cyan/10 text-neon-cyan" : "bg-neon-pink/10 text-neon-pink"}`}>
                <div className="font-semibold mb-1">{result.correct ? "إجابة صحيحة 🎉" : "ليست صحيحة"}</div>
                {result.explanation && <p className="text-muted-foreground">{result.explanation}</p>}
              </div>
            )}
          </div>
        )}

        {!user && (
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/auth" className="text-neon-cyan">سجّل الدخول</Link> لحفظ نقاطك وسلسلتك اليومية.
          </p>
        )}
      </div>

      {/* Fixed footer nav */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <button
            onClick={() => { setStep((s) => Math.max(0, s - 1)); setPicked(null); setResult(null); }}
            disabled={step === 0}
            className="rounded-xl px-4 py-2.5 text-sm border border-border/40 disabled:opacity-40 inline-flex items-center gap-2"
          >
            <ArrowRight className="size-4" /> السابق
          </button>
          <button
            onClick={next}
            disabled={busy || (current?.type === "question" && !result)}
            className="rounded-xl px-6 py-3 font-semibold bg-gradient-to-r from-[oklch(0.82_0.14_85)] to-[oklch(0.72_0.15_60)] text-black inline-flex items-center gap-2 disabled:opacity-50"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {step === total - 1 ? "إنهاء الدرس" : "متابعة"}
            <ArrowLeft className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BlockView({ block }: { block: LessonDetail["blocks"][number] }) {
  if (block.kind === "video") {
    const url = block.meta?.url || block.content;
    const isEmbed = /youtube|youtu\.be|vimeo/.test(url);
    return (
      <figure className="space-y-3">
        <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-black/60 aspect-video">
          {isEmbed ? (
            <iframe
              src={url}
              title={block.meta?.caption ?? "video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            <video src={url} poster={block.meta?.poster} controls playsInline className="absolute inset-0 size-full object-contain" />
          )}
        </div>
        {block.meta?.caption && (
          <figcaption className="flex items-center gap-2 text-xs text-muted-foreground">
            <PlayCircle className="size-3.5 text-neon-cyan" /> {block.meta.caption}
          </figcaption>
        )}
      </figure>
    );
  }
  if (block.kind === "code") {
    return (
      <pre className="rounded-2xl bg-black/50 border border-border/40 p-4 overflow-x-auto text-sm text-neon-cyan" dir="ltr">
        <code>{block.content}</code>
      </pre>
    );
  }
  if (block.kind === "image") {
    return <img src={block.content} alt={block.meta?.caption ?? ""} loading="lazy" className="rounded-2xl w-full" />;
  }
  if (block.kind === "note") {
    return (
      <div className="rounded-2xl border border-neon-orange/40 bg-neon-orange/10 p-4 text-sm">
        <Star className="size-4 text-neon-orange mb-2" />
        <p className="whitespace-pre-wrap leading-relaxed">{block.content}</p>
      </div>
    );
  }
  return <p className="whitespace-pre-wrap leading-8 text-[15px]">{block.content}</p>;
}

function Box({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4 border border-border/40">
      <div className="text-xl font-bold font-display">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
