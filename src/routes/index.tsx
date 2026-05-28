import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Play, Crown, Flame, Star, Trophy, BookOpen, Rocket, ListChecks, TrendingUp, ChevronRight, Zap, Quote } from "lucide-react";
import heroImg from "@/assets/hero-throne.jpg";
import { learningPaths, aiQuotes, trendingTools, missions } from "@/lib/data/mockData";
import { PathCard } from "@/components/PathCard";
import { StatTile } from "@/components/StatTile";
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
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
      <div className="space-y-6 min-w-0">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-3xl border border-neon-purple/30 glass-strong p-6 sm:p-10">
          <div className="absolute -top-20 -right-20 size-[420px] rounded-full bg-neon-purple/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-[320px] rounded-full bg-neon-blue/20 blur-3xl pointer-events-none" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan text-xs font-semibold mb-4">
                <Sparkles className="size-3.5" /> Daily AI Academy
              </div>
              <p className="text-sm text-muted-foreground mb-2">Welcome back to</p>
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tighter leading-[0.95]">
                <span className="text-gradient">HN-AI</span>
                <Crown className="inline size-7 ml-3 text-neon-orange -translate-y-3" />
              </h1>
              <p className="mt-4 text-lg text-foreground/80 max-w-md">
                Master the future with AI<br />
                <span className="text-muted-foreground">in just 10 minutes a day.</span>
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link to="/missions" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold glow-purple hover:scale-105 transition">
                  <Sparkles className="size-4" /> Start Daily Mission
                </Link>
                <Link to="/paths" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border-neon-cyan/30 font-semibold hover:border-neon-cyan transition">
                  <Play className="size-4 text-neon-cyan" /> Continue Learning
                </Link>
              </div>
            </div>
            <div className="relative aspect-square max-h-[420px] mx-auto float">
              <img src={heroImg} alt="HN-AI neon throne" className="w-full h-full object-cover rounded-3xl border border-neon-blue/40 glow-blue" width={1024} height={1024} />
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatTile icon={<BookOpen className="size-5" />} label="Lessons Completed" value={user.completedLessons.length} color="text-neon-cyan" ring="border-neon-cyan/40" bg="bg-neon-cyan/15" />
          <StatTile icon={<Rocket className="size-5" />} label="Projects Built" value={user.completedProjects.length} color="text-neon-purple" ring="border-neon-purple/40" bg="bg-neon-purple/15" />
          <StatTile icon={<ListChecks className="size-5" />} label="Quizzes Done" value={user.completedQuizzes.length} color="text-neon-blue" ring="border-neon-blue/40" bg="bg-neon-blue/15" />
          <StatTile icon={<Star className="size-5" />} label="Total XP" value={user.xp.toLocaleString()} color="text-neon-orange" ring="border-neon-orange/40" bg="bg-neon-orange/15" />
          <StatTile icon={<Trophy className="size-5" />} label="Global Rank" value="Top 3%" color="text-neon-pink" ring="border-neon-pink/40" bg="bg-neon-pink/15" />
        </section>

        {/* BROWSE LEARNING PATHS */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-2xl">Browse Learning Paths</h2>
            <Link to="/paths" className="text-sm text-neon-cyan inline-flex items-center gap-1 hover:underline">
              View All Paths <ChevronRight className="size-4" />
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
              <span key={t} className="px-3 py-1.5 rounded-full text-xs bg-neon-orange/10 border border-neon-orange/40 text-neon-orange font-medium">{t}</span>
            ))}
          </div>
        </section>
      </div>

      {/* RIGHT RAIL */}
      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
        {/* Level */}
        <div className="glass rounded-2xl p-5 text-center border-neon-purple/30">
          <div className="relative w-fit mx-auto">
            <div className="size-20 rounded-2xl bg-gradient-to-br from-neon-purple/40 to-neon-blue/30 border border-neon-purple/50 grid place-items-center glow-purple">
              <div className="text-center">
                <Crown className="size-5 text-neon-orange mx-auto" />
                <div className="font-display font-extrabold text-2xl leading-none">{lvl.level}</div>
              </div>
            </div>
          </div>
          <div className="mt-3 font-display font-bold">{lvl.name}</div>
          <div className="text-xs text-muted-foreground mt-1">{user.xp.toLocaleString()} / {lvl.nextXp.toLocaleString()} XP</div>
          <div className="mt-3 h-2 rounded-full bg-background/50 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan shimmer" style={{ width: `${lvl.pct}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
            <div className="rounded-lg bg-background/40 py-2"><div className="text-muted-foreground">XP</div><div className="font-bold text-neon-blue">{user.xp}</div></div>
            <div className="rounded-lg bg-background/40 py-2"><div className="text-muted-foreground">Stars</div><div className="font-bold text-neon-orange">★ {user.stars}</div></div>
            <div className="rounded-lg bg-background/40 py-2"><div className="text-muted-foreground">Streak</div><div className="font-bold text-neon-pink">🔥 {user.streak}</div></div>
          </div>
        </div>

        {/* Daily Mission */}
        <div className="glass rounded-2xl p-5 border-neon-cyan/30">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-display font-bold text-neon-cyan">Daily Mission</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30">Day {todayMission.day}</span>
          </div>
          <div className="font-semibold mb-1">{todayMission.title}</div>
          <p className="text-xs text-muted-foreground">{todayMission.description}</p>
          <div className="my-3 h-2 rounded-full bg-background/50 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue" style={{ width: `30%` }} />
          </div>
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
            <span className="inline-flex items-center gap-1 text-neon-orange text-sm"><Flame className="size-4 fill-neon-orange" /> {user.streak} Days</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {["M","T","W","T","F","S","S"].map((d, i) => (
              <div key={i} className="text-center">
                <div className={`size-8 mx-auto rounded-lg grid place-items-center text-xs font-bold ${user.weekProgress[i] ? "bg-gradient-to-br from-neon-orange/60 to-neon-pink/60 text-white glow-orange" : "bg-background/40 border border-border/40 text-muted-foreground"}`}>
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
