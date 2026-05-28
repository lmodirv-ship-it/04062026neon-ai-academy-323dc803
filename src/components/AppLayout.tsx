import { Link, useLocation } from "@tanstack/react-router";
import {
  Home, Target, Route as RouteIcon, BookOpen, Sparkles, Rocket,
  ListChecks, Trophy, Wrench, User as UserIcon, Crown, Zap, Bell, Search,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { getLevelInfo } from "@/lib/services/userService";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/missions", label: "Daily Mission", icon: Target },
  { to: "/paths", label: "Learning Paths", icon: RouteIcon },
  { to: "/lessons", label: "Lessons", icon: BookOpen },
  { to: "/playground", label: "AI Playground", icon: Sparkles },
  { to: "/projects", label: "Mini Projects", icon: Rocket },
  { to: "/quiz", label: "Quiz & Challenges", icon: ListChecks },
  { to: "/tools", label: "AI Tools", icon: Wrench },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

const bottom = [
  { to: "/", label: "Home", icon: Home },
  { to: "/missions", label: "Mission", icon: Target },
  { to: "/paths", label: "Paths", icon: RouteIcon },
  { to: "/playground", label: "Play", icon: Sparkles },
  { to: "/profile", label: "Profile", icon: UserIcon },
] as const;

export function AppLayout({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const lvl = getLevelInfo(user.xp);

  return (
    <div className="min-h-screen flex w-full">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border/40 glass-strong sticky top-0 h-screen p-4 gap-1 z-30">
        <Link to="/" className="flex items-center gap-3 px-2 py-3 mb-2">
          <div className="size-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center glow-purple">
            <Crown className="size-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none">HN-AI</div>
            <div className="text-[10px] text-muted-foreground mt-1">Learn AI in 10 min/day</div>
          </div>
        </Link>
        <nav className="flex-1 overflow-y-auto pr-1">
          {nav.map((item) => (
            <SideLink key={item.to} {...item} />
          ))}
        </nav>
        <div className="mt-2 p-4 rounded-2xl border border-neon-orange/40 bg-gradient-to-br from-neon-orange/10 to-transparent text-center">
          <Crown className="size-5 text-neon-orange mx-auto mb-1" />
          <div className="text-sm font-bold text-neon-orange">HN-AI PREMIUM</div>
          <div className="text-[11px] text-muted-foreground mt-1 mb-3">Unlock all paths, projects & premium features.</div>
          <button className="w-full rounded-lg bg-gradient-to-r from-neon-orange to-neon-pink text-black font-semibold text-sm py-2 glow-orange hover:opacity-90">
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar streak={user.streak} level={lvl.level} levelName={lvl.name} />
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 pb-28 lg:pb-10 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}

function SideLink({ to, label, icon: Icon }: { to: string; label: string; icon: React.ElementType }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-all data-[status=active]:bg-gradient-to-r data-[status=active]:from-neon-purple/25 data-[status=active]:to-neon-blue/15 data-[status=active]:text-foreground data-[status=active]:border data-[status=active]:border-neon-purple/40"
      activeOptions={{ exact: to === "/" }}
    >
      <Icon className="size-4 shrink-0 group-data-[status=active]:text-neon-cyan" />
      <span className="font-medium">{label}</span>
    </Link>
  );
}

function TopBar({ streak, level, levelName }: { streak: number; level: number; levelName: string }) {
  const loc = useLocation();
  return (
    <header className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 glass-strong border-b border-border/40">
      <Link to="/" className="lg:hidden flex items-center gap-2">
        <div className="size-9 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center glow-purple">
          <Crown className="size-4 text-white" />
        </div>
        <span className="font-display font-bold">HN-AI</span>
      </Link>
      <div className="hidden sm:flex flex-1 max-w-xl mx-auto relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          placeholder="Search lessons, tools, topics…"
          className="w-full bg-input/60 border border-border/50 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-neon-blue/60 focus:ring-2 focus:ring-neon-blue/20 transition"
        />
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-neon-orange/15 border border-neon-orange/40 text-neon-orange font-bold text-sm">
          <Zap className="size-4 fill-neon-orange" />{streak}
        </div>
        <button className="size-9 grid place-items-center rounded-full glass hover:border-neon-blue/40 transition">
          <Bell className="size-4" />
        </button>
        <Link to="/profile" className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full glass border-neon-purple/40 hover:border-neon-purple transition">
          <div className="size-7 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center text-xs">👑</div>
          <div className="hidden sm:block leading-tight">
            <div className="text-xs font-semibold">{levelName}</div>
            <div className="text-[10px] text-muted-foreground">Level {level}</div>
          </div>
        </Link>
      </div>
      {/* hidden helper to silence unused */}
      <span className="hidden">{loc.pathname}</span>
    </header>
  );
}

function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-3 inset-x-3 z-40 glass-strong rounded-2xl border border-neon-purple/30 px-2 py-1.5 flex items-center justify-around shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
      {bottom.map((item, i) => {
        const Icon = item.icon;
        if (i === 2) {
          return (
            <span key="logo" className="flex flex-col items-center">
              <Link to="/" className="-mt-7 size-14 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center glow-purple ring-4 ring-background">
                <div className="text-center leading-none">
                  <div className="font-display font-extrabold text-[10px] text-white">HN</div>
                  <div className="font-display font-extrabold text-[10px] text-white">AI</div>
                </div>
              </Link>
              <Link to={item.to} className="text-[10px] text-muted-foreground data-[status=active]:text-neon-cyan mt-0.5">{item.label}</Link>
            </span>
          );
        }
        return (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-muted-foreground data-[status=active]:text-neon-cyan"
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
