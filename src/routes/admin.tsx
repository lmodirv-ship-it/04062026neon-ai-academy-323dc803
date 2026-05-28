import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Plus, Trash2, BookOpen, Route as RouteIcon, Target, ListChecks, Rocket, Users, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  addLesson, addMission, addPath, addProject, addQuiz,
  removeExtra, resetExtras,
} from "@/lib/services/contentService";
import { useContent } from "@/hooks/use-content";
import { useUser } from "@/hooks/use-user";
import { resetUser } from "@/lib/services/userService";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — HN-AI" }, { name: "description", content: "Manage lessons, paths, missions, quizzes, projects, and users." }] }),
  component: Admin,
});

type Tab = "paths" | "lessons" | "missions" | "quiz" | "projects" | "users";

const tabs: { id: Tab; label: string; icon: React.ElementType; color: string }[] = [
  { id: "paths",    label: "Paths",    icon: RouteIcon,  color: "neon-purple" },
  { id: "lessons",  label: "Lessons",  icon: BookOpen,   color: "neon-cyan"   },
  { id: "missions", label: "Missions", icon: Target,     color: "neon-orange" },
  { id: "quiz",     label: "Quiz",     icon: ListChecks, color: "neon-blue"   },
  { id: "projects", label: "Projects", icon: Rocket,     color: "neon-pink"   },
  { id: "users",    label: "Users",    icon: Users,      color: "neon-orange" },
];

function Admin() {
  const [tab, setTab] = useState<Tab>("paths");

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="glass-strong rounded-3xl p-6 border-neon-orange/30 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 size-60 rounded-full bg-neon-orange/20 blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-orange/15 border border-neon-orange/40 text-neon-orange text-xs font-semibold mb-3">
          <Shield className="size-3.5" /> Royal Control Center
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Add unlimited paths, lessons, missions, quizzes and projects. Changes are stored locally and will sync to HN-DB once connected.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                active
                  ? `bg-${t.color}/20 text-${t.color} border-${t.color}/50 glow-purple`
                  : "border-border/40 text-muted-foreground hover:text-foreground hover:border-neon-purple/40"
              }`}
            >
              <Icon className="size-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {tab === "paths"    && <PathsPanel />}
        {tab === "lessons"  && <LessonsPanel />}
        {tab === "missions" && <MissionsPanel />}
        {tab === "quiz"     && <QuizPanel />}
        {tab === "projects" && <ProjectsPanel />}
        {tab === "users"    && <UsersPanel />}
      </div>

      <div className="glass rounded-2xl p-5 border-destructive/30 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-display font-bold">Reset Admin Content</div>
          <div className="text-xs text-muted-foreground">Clears all custom paths, lessons, missions, quizzes, and projects you added.</div>
        </div>
        <button
          onClick={() => { if (confirm("Reset all admin-created content?")) { resetExtras(); toast.success("Admin content cleared."); } }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-sm hover:bg-destructive/10"
        >
          <RotateCcw className="size-4" /> Reset
        </button>
      </div>
    </div>
  );
}

/* ===== Reusable form pieces ===== */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
const inputCls = "w-full bg-input/60 border border-border/50 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-neon-blue/60";
const btnCls = "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold text-sm glow-purple hover:scale-[1.02] transition";

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg">{title}</h2>
        <span className="text-xs text-muted-foreground">{count} custom</span>
      </div>
      {children}
    </div>
  );
}

function ItemRow({ title, subtitle, onDelete }: { title: string; subtitle?: string; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-background/30">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
      </div>
      <button onClick={onDelete} className="size-8 grid place-items-center rounded-lg border border-destructive/40 text-destructive hover:bg-destructive/10">
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}

/* ===== Panels ===== */

function PathsPanel() {
  const { extras } = useContent();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");

  const submit = () => {
    if (!title.trim() || !slug.trim()) return toast.error("Title and slug are required.");
    addPath({
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      title: title.trim(),
      description: description.trim() || "New custom learning path.",
      icon: "Sparkles",
      color: "neon-purple",
      lessons: 0,
      difficulty,
      tagline: title.trim(),
    });
    toast.success("Path added.");
    setTitle(""); setSlug(""); setDescription("");
  };

  return (
    <>
      <Section title="Create Learning Path" count={extras.paths.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Title"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="AI for Architects" /></Field>
          <Field label="Slug"><input className={inputCls} value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="ai-architects" /></Field>
          <Field label="Difficulty">
            <select className={inputCls} value={difficulty} onChange={(e) => setDifficulty(e.target.value as never)}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </Field>
          <Field label="Description"><input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What this path teaches…" /></Field>
        </div>
        <button onClick={submit} className={`${btnCls} mt-4`}><Plus className="size-4" /> Add Path</button>
      </Section>

      <div className="space-y-2 mt-4">
        {extras.paths.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No custom paths yet.</div>}
        {extras.paths.map((p) => (
          <ItemRow key={p.id} title={p.title} subtitle={`/${p.slug} · ${p.difficulty}`} onDelete={() => removeExtra("paths", p.id)} />
        ))}
      </div>
    </>
  );
}

function LessonsPanel() {
  const { extras, paths } = useContent();
  const [pathSlug, setPathSlug] = useState(paths[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(10);
  const [xpReward, setXpReward] = useState(15);
  const [content, setContent] = useState("");
  const [challenge, setChallenge] = useState("");

  const submit = () => {
    if (!title.trim() || !pathSlug) return toast.error("Title and path are required.");
    addLesson({
      pathSlug, title: title.trim(), description: description.trim() || "Custom lesson.",
      duration, xpReward, difficulty: "Beginner",
      content: content.trim() || description.trim(),
      example: "—", promptExamples: [], challenge: challenge.trim() || "Practice this lesson today.",
    });
    toast.success("Lesson added.");
    setTitle(""); setDescription(""); setContent(""); setChallenge("");
  };

  return (
    <>
      <Section title="Create Lesson" count={extras.lessons.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Title"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What is an Embedding?" /></Field>
          <Field label="Path">
            <select className={inputCls} value={pathSlug} onChange={(e) => setPathSlug(e.target.value)}>
              {paths.map((p) => <option key={p.id} value={p.slug}>{p.title}</option>)}
            </select>
          </Field>
          <Field label="Duration (min)"><input type="number" min={1} className={inputCls} value={duration} onChange={(e) => setDuration(+e.target.value || 1)} /></Field>
          <Field label="XP Reward"><input type="number" min={1} className={inputCls} value={xpReward} onChange={(e) => setXpReward(+e.target.value || 1)} /></Field>
          <Field label="Description"><input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" /></Field>
          <Field label="Challenge"><input className={inputCls} value={challenge} onChange={(e) => setChallenge(e.target.value)} placeholder="Try this today…" /></Field>
        </div>
        <div className="mt-3">
          <Field label="Content">
            <textarea rows={4} className={inputCls} value={content} onChange={(e) => setContent(e.target.value)} placeholder="The main idea of the lesson…" />
          </Field>
        </div>
        <button onClick={submit} className={`${btnCls} mt-4`}><Plus className="size-4" /> Add Lesson</button>
      </Section>

      <div className="space-y-2 mt-4">
        {extras.lessons.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No custom lessons yet.</div>}
        {extras.lessons.map((l) => (
          <ItemRow key={l.id} title={l.title} subtitle={`${l.pathSlug} · ${l.duration} min · +${l.xpReward} XP`} onDelete={() => removeExtra("lessons", l.id)} />
        ))}
      </div>
    </>
  );
}

function MissionsPanel() {
  const { extras } = useContent();
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(31);
  const [reward, setReward] = useState(60);
  const [description, setDescription] = useState("");

  const submit = () => {
    if (!title.trim()) return toast.error("Title required.");
    addMission({ day, title: title.trim(), description: description.trim() || "Custom mission.", category: "Custom", reward });
    toast.success("Mission added.");
    setTitle(""); setDescription("");
  };

  return (
    <>
      <Section title="Create Daily Mission" count={extras.missions.length}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Day"><input type="number" min={1} className={inputCls} value={day} onChange={(e) => setDay(+e.target.value || 1)} /></Field>
          <Field label="XP Reward"><input type="number" min={1} className={inputCls} value={reward} onChange={(e) => setReward(+e.target.value || 1)} /></Field>
          <Field label="Title"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Build a chatbot in 10 min" /></Field>
        </div>
        <div className="mt-3">
          <Field label="Description"><input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What to do today…" /></Field>
        </div>
        <button onClick={submit} className={`${btnCls} mt-4`}><Plus className="size-4" /> Add Mission</button>
      </Section>

      <div className="space-y-2 mt-4">
        {extras.missions.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No custom missions yet.</div>}
        {extras.missions.map((m) => (
          <ItemRow key={m.id} title={`Day ${m.day} · ${m.title}`} subtitle={`+${m.reward} XP`} onDelete={() => removeExtra("missions", m.id)} />
        ))}
      </div>
    </>
  );
}

function QuizPanel() {
  const { extras } = useContent();
  const [question, setQuestion] = useState("");
  const [a, setA] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [explanation, setExplanation] = useState("");

  const submit = () => {
    if (!question.trim() || a.some((x) => !x.trim())) return toast.error("Fill question and all 4 answers.");
    addQuiz({ question: question.trim(), answers: a.map((x) => x.trim()), correctAnswer: correct, explanation: explanation.trim() || "Good question!", category: "Custom" });
    toast.success("Question added.");
    setQuestion(""); setA(["", "", "", ""]); setExplanation(""); setCorrect(0);
  };

  return (
    <>
      <Section title="Create Quiz Question" count={extras.quiz.length}>
        <Field label="Question">
          <input className={inputCls} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What is RAG?" />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          {a.map((val, idx) => (
            <Field key={idx} label={`Answer ${String.fromCharCode(65 + idx)}${idx === correct ? " ✓" : ""}`}>
              <div className="flex gap-2">
                <input className={inputCls} value={val} onChange={(e) => setA(a.map((x, i) => i === idx ? e.target.value : x))} />
                <button onClick={() => setCorrect(idx)} className={`px-3 rounded-xl text-xs font-bold border ${correct === idx ? "border-neon-cyan/60 text-neon-cyan bg-neon-cyan/10" : "border-border/40 text-muted-foreground"}`}>✓</button>
              </div>
            </Field>
          ))}
        </div>
        <div className="mt-3">
          <Field label="Explanation"><input className={inputCls} value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Why this answer is correct…" /></Field>
        </div>
        <button onClick={submit} className={`${btnCls} mt-4`}><Plus className="size-4" /> Add Question</button>
      </Section>

      <div className="space-y-2 mt-4">
        {extras.quiz.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No custom questions yet.</div>}
        {extras.quiz.map((q) => (
          <ItemRow key={q.id} title={q.question} subtitle={`Correct: ${String.fromCharCode(65 + q.correctAnswer)} — ${q.answers[q.correctAnswer]}`} onDelete={() => removeExtra("quiz", q.id)} />
        ))}
      </div>
    </>
  );
}

function ProjectsPanel() {
  const { extras } = useContent();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [xpReward, setXpReward] = useState(100);
  const [emoji, setEmoji] = useState("✨");
  const [difficulty, setDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");

  const submit = () => {
    if (!title.trim()) return toast.error("Title required.");
    addProject({ title: title.trim(), description: description.trim() || "Custom project.", difficulty, xpReward, tags: ["Custom"], emoji });
    toast.success("Project added.");
    setTitle(""); setDescription("");
  };

  return (
    <>
      <Section title="Create Mini Project" count={extras.projects.length}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Title"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="AI Recipe Generator" /></Field>
          <Field label="Emoji"><input className={inputCls} value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={4} /></Field>
          <Field label="XP Reward"><input type="number" min={1} className={inputCls} value={xpReward} onChange={(e) => setXpReward(+e.target.value || 1)} /></Field>
          <Field label="Difficulty">
            <select className={inputCls} value={difficulty} onChange={(e) => setDifficulty(e.target.value as never)}>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
            </select>
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Description"><input className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What the student will build…" /></Field>
        </div>
        <button onClick={submit} className={`${btnCls} mt-4`}><Plus className="size-4" /> Add Project</button>
      </Section>

      <div className="space-y-2 mt-4">
        {extras.projects.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">No custom projects yet.</div>}
        {extras.projects.map((p) => (
          <ItemRow key={p.id} title={`${p.emoji} ${p.title}`} subtitle={`${p.difficulty} · +${p.xpReward} XP`} onDelete={() => removeExtra("projects", p.id)} />
        ))}
      </div>
    </>
  );
}

function UsersPanel() {
  const user = useUser();
  return (
    <Section title="Local User" count={1}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="glass rounded-xl p-3"><div className="text-[10px] uppercase text-muted-foreground">Name</div><div className="font-bold">{user.name}</div></div>
        <div className="glass rounded-xl p-3"><div className="text-[10px] uppercase text-muted-foreground">XP</div><div className="font-bold text-neon-orange">{user.xp.toLocaleString()}</div></div>
        <div className="glass rounded-xl p-3"><div className="text-[10px] uppercase text-muted-foreground">Streak</div><div className="font-bold text-neon-pink">{user.streak}d</div></div>
        <div className="glass rounded-xl p-3"><div className="text-[10px] uppercase text-muted-foreground">Badges</div><div className="font-bold text-neon-cyan">{user.badges.length}</div></div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Multi-user management arrives when HN-AI connects to <b>HN.auth</b> + <b>HN-DB</b>. For now you can reset the current local profile.
      </p>
      <button
        onClick={() => { if (confirm("Reset the local user?")) { resetUser(); toast.success("User reset."); } }}
        className="inline-flex items-center gap-2 px-4 py-2 mt-3 rounded-xl border border-destructive/40 text-destructive text-sm hover:bg-destructive/10"
      >
        <RotateCcw className="size-4" /> Reset User
      </button>
    </Section>
  );
}
