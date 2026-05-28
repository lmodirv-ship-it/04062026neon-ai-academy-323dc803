import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Play, Crown, Flame, Star, Trophy, BookOpen, Rocket, ListChecks, TrendingUp, ChevronRight, Zap, Quote } from "lucide-react";
import { learningPaths, aiQuotes, trendingTools, missions } from "@/lib/data/mockData";
import { PathCard } from "@/components/PathCard";
import { StatTile } from "@/components/StatTile";
import { Particles } from "@/components/Particles";
import { AIHologram } from "@/components/AIHologram";
import { XPBar } from "@/components/XPBar";
import { useUser } from "@/hooks/use-user";
import { getLevelInfo } from "@/lib/services/userService";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HN-AI — Daily AI Academy" },
      { name: "description", content: "Master AI in 10 minutes a day. Daily missions, learning paths, projects, and a neon AI playground." },
      { property: "og:title", content: "HN-AI — Daily AI Academy" },
      { property: "og:description", content: "Master AI in 10 minutes a day." },
    ],
  }),
  component: Home,
});

function Home() {
  const user = useUser();
  const lvl = getLevelInfo(user.xp);
  const todayMission = missions[(new Date().getDate() - 1) % missions.length];
  const quote = aiQuotes[new Date().getDate() % aiQuotes.length];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
      <div className="space-y-6 min-w-0">
        {/* CINEMATIC HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-neon-purple/30 glass-strong scan">
          <div className="absolute inset-0 grid-bg opacity-50" />
          <div className="absolute inset-0 aurora opacity-90" />
          <Particles count={26} />
          <div className="absolute -top-24 -right-24 size-[460px] rounded-full bg-neon-purple/25 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-28 -left-24 size-[360px] rounded-full bg-neon-blue/25 blur-3xl pointer-events-none" />

          <div className="relative grid md:grid-cols-[1.1fr_1fr] gap-6 items-center p-6 sm:p-10">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan text-[11px] font-semibold mb-5 backdrop-blur">
                <span className="size-1.5 rounded-full bg-neon-cyan pulse-dot text-neon-cyan" />
                AI OPERATING SYSTEM · v1.0
              </div>
              <p className="text-sm text-muted-foreground mb-2 tracking-widest uppercase">Welcome back</p>
              <h1 className="font-display font-extrabold tracking-tighter leading-[0.92] text-[clamp(2.6rem,7vw,5.5rem)]">
                <span className="text-gradient text-glow">HN-AI</span>
                <Crown className="inline size-7 ml-3 text-neon-orange -translate-y-3" />
              </h1>
              <p className="mt-4 text-lg text-foreground/85 max-w-md">
                Master the future with AI<br />
                <span className="text-muted-foreground">in just <b className="text-neon-cyan">10 minutes</b> a day.</span>
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/missions" className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold glow-purple hover:scale-[1.03] transition overflow-hidden">
                  <span className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition" />
                  <Sparkles className="size-4" /> Start Daily Mission
                </Link>
                <Link to="/paths" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border-neon-cyan/30 font-semibold hover:border-neon-cyan hover:glow-cyan transition">
                  <Play className="size-4 text-neon-cyan" /> Continue Learning
                </Link>
              </div>

              {/* mini live status bar */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-neon-cyan pulse-dot text-neon-cyan" /> 12,840 learners online</span>
                <span className="inline-flex items-center gap-2"><Flame className="size-3 text-neon-orange fire" /> {user.streak}-day streak</span>
                <span className="inline-flex items-center gap-2"><Star className="size-3 text-neon-orange" /> {user.stars} stars</span>
              </div>
            </div>

            {/* AI HOLOGRAM */}
            <div className="relative hidden md:flex items-center justify-center min-h-[340px]">
              <AIHologram size={340} />
            </div>
          </div>
        </section>

        {/* MARQUEE STRIP */}
        <section className="relative overflow-hidden rounded-2xl glass border-neon-cyan/20 py-3">
          <div className="marquee whitespace-nowrap text-xs uppercase tracking-[0.25em] text-muted-foreground">
            {[...Array(2)].map((_, k) => (
              <div key={k} className="flex items-center gap-8 px-6">
                {["Powered by HN-AI", "Daily Missions", "AI Pair Coding", "Prompt Mastery", "Build · Ship · Earn XP", "Cursor + Replit Workflow", "10 Minutes a Day"].map((t, i) => (
                  <span key={i} className="inline-flex items-center gap-3">
                    <span className="size-1.5 rounded-full bg-neon-cyan" />
                    <span className="text-foreground/70">{t}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatTile icon={<BookOpen className="size-5" />} label="Lessons" value={user.completedLessons.length} color="text-neon-cyan" ring="border-neon-cyan/40" bg="bg-neon-cyan/15" />
          <StatTile icon={<Rocket className="size-5" />} label="Projects" value={user.completedProjects.length} color="text-neon-purple" ring="border-neon-purple/40" bg="bg-neon-purple/15" />
          <StatTile icon={<ListChecks className="size-5" />} label="Quizzes" value={user.completedQuizzes.length} color="text-neon-blue" ring="border-neon-blue/40" bg="bg-neon-blue/15" />
          <StatTile icon={<Star className="size-5" />} label="Total XP" value={user.xp.toLocaleString()} color="text-neon-orange" ring="border-neon-orange/40" bg="bg-neon-orange/15" />
          <StatTile icon={<Trophy className="size-5" />} label="Rank" value="Top 3%" color="text-neon-pink" ring="border-neon-pink/40" bg="bg-neon-pink/15" />
        </section>

        {/* AI MISSION TIMELINE */}
        <section className="glass rounded-2xl p-5 border-neon-purple/25 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-xl">AI Mission Timeline</h2>
              <p className="text-xs text-muted-foreground">Your next 7 daily missions</p>
            </div>
            <Link to="/missions" className="text-xs text-neon-cyan inline-flex items-center gap-1 hover:underline">All missions <ChevronRight className="size-3" /></Link>
          </div>
          <div className="relative">
            <div className="absolute left-0 right-0 top-5 h-px bg-gradient-to-r from-transparent via-neon-purple/40 to-transparent" />
            <div className="grid grid-cols-7 gap-2 relative">
              {missions.slice(0, 7).map((m, i) => {
                const done = i < 3;
                const today = i === 3;
                return (
                  <div key={m.id} className="text-center">
                    <div className={`mx-auto size-10 rounded-xl grid place-items-center text-xs font-bold border transition
                      ${done ? "bg-gradient-to-br from-neon-purple to-neon-blue text-white border-neon-purple/60 glow-purple"
                            : today ? "bg-neon-cyan/15 text-neon-cyan border-neon-cyan/60 ring-pulse"
                            : "bg-background/40 text-muted-foreground border-border/50"}`}>
                      {done ? "✓" : m.day}
                    </div>
                    <div className="mt-2 text-[10px] text-muted-foreground line-clamp-2 leading-tight">{m.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BROWSE LEARNING PATHS */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-2xl">Browse Learning Paths</h2>
            <Link to="/paths" className="text-sm text-neon-cyan inline-flex items-center gap-1 hover:underline">
              View All <ChevronRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {learningPaths.slice(0, 5).map((p) => <PathCard key={p.id} path={p} />)}
          </div>
        </section>

        {/* TRENDING TOOLS */}
        <section className="glass rounded-2xl p-5 border-neon-orange/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="size-4 text-neon-orange" />
            <h3 className="font-display font-bold">Trending AI Tools</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingTools.map((t) => (
              <span key={t} className="px-3 py-1.5 rounded-full text-xs bg-neon-orange/10 border border-neon-orange/40 text-neon-orange font-medium hover:bg-neon-orange/20 transition cursor-default">{t}</span>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT RAIL */}
      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto pr-1">
        {/* Level */}
        <div className="relative glass rounded-2xl p-5 text-center border-neon-purple/30 overflow-hidden">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 size-40 rounded-full bg-neon-purple/30 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="size-20 mx-auto rounded-2xl bg-gradient-to-br from-neon-purple/40 to-neon-blue/30 border border-neon-purple/50 grid place-items-center glow-purple float">
              <div className="text-center">
                <Crown className="size-5 text-neon-orange mx-auto" />
                <div className="font-display font-extrabold text-2xl leading-none">{lvl.level}</div>
              </div>
            </div>
            <div className="mt-3 font-display font-bold text-lg">{lvl.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{user.xp.toLocaleString()} / {lvl.nextXp.toLocaleString()} XP</div>
            <XPBar value={lvl.pct} className="mt-3" />
            <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
              <div className="rounded-lg bg-background/40 py-2 border border-border/40"><div className="text-[10px] text-muted-foreground uppercase">XP</div><div className="font-bold text-neon-blue">{user.xp}</div></div>
              <div className="rounded-lg bg-background/40 py-2 border border-border/40"><div className="text-[10px] text-muted-foreground uppercase">Stars</div><div className="font-bold text-neon-orange">★ {user.stars}</div></div>
              <div className="rounded-lg bg-background/40 py-2 border border-border/40"><div className="text-[10px] text-muted-foreground uppercase">Streak</div><div className="font-bold text-neon-pink inline-flex items-center gap-1"><span className="fire">🔥</span>{user.streak}</div></div>
            </div>
          </div>
        </div>

        {/* Daily Mission */}
        <div className="glass rounded-2xl p-5 border-neon-cyan/30 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-neon-cyan/25 blur-3xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2 relative">
            <h3 className="font-display font-bold text-neon-cyan">Daily Mission</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">Day {todayMission.day}</span>
          </div>
          <div className="font-semibold mb-1 relative">{todayMission.title}</div>
          <p className="text-xs text-muted-foreground relative">{todayMission.description}</p>
          <XPBar value={30} className="my-3" height={6} />
          <div className="text-[10px] text-muted-foreground mb-3">30% Completed</div>
          <Link to="/missions" className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white text-sm font-semibold glow-blue hover:scale-[1.02] transition">
            Continue Mission <ChevronRight className="size-4" />
          </Link>
        </div>

        {/* AI Quote */}
        <div className="glass rounded-2xl p-5 border-neon-purple/20">
          <div className="flex items-center gap-2 mb-2">
            <Quote className="size-4 text-neon-purple" />
            <h3 className="font-display font-bold text-neon-purple">AI Quote of the Day</h3>
          </div>
          <p className="text-sm italic leading-relaxed">"{quote.quote}"</p>
          <div className="text-xs text-muted-foreground mt-2">— {quote.author}</div>
        </div>

        {/* Streak week */}
        <div className="glass rounded-2xl p-5 border-neon-orange/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold">Your Streak</h3>
            <span className="inline-flex items-center gap-1 text-neon-orange text-sm font-semibold">
              <Flame className="size-4 fill-neon-orange fire" /> {user.streak} Days
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={i} className="text-center">
                <div className={`size-8 mx-auto rounded-lg grid place-items-center text-xs font-bold transition ${user.weekProgress[i] ? "bg-gradient-to-br from-neon-orange/70 to-neon-pink/70 text-white glow-orange" : "bg-background/40 border border-border/40 text-muted-foreground"}`}>
                  {user.weekProgress[i] ? <Zap className="size-4" /> : d}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">{d}</div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
