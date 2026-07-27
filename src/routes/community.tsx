import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Trophy, Rocket, Newspaper, MessageCircle, Crown, Flame } from "lucide-react";
import { getLeaderboard } from "@/lib/api/admin.functions";
import { listPosts } from "@/lib/api/blog.functions";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "مجتمع HN-AI — تعلّم مع الآخرين" },
      { name: "description", content: "انضم إلى مجتمع HN-AI: أفضل المتعلّمين، مشاريع الطلاب، مقالات وتحديات أسبوعية." },
      { property: "og:title", content: "مجتمع HN-AI — تعلّم مع الآخرين" },
      { property: "og:description", content: "أفضل المتعلّمين، مشاريع الطلاب، ومقالات المجتمع في مكان واحد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const { data: top } = useQuery({ queryKey: ["leaderboard"], queryFn: () => getLeaderboard() });
  const { data: posts } = useQuery({ queryKey: ["posts", "community"], queryFn: () => listPosts() });

  const leaders = (top ?? []).slice(0, 5);
  const articles = (posts?.posts ?? []).slice(0, 3);

  return (
    <div className="space-y-6" dir="rtl">
      <header className="glass-strong rounded-3xl p-8 border border-border/40 relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.7_0.2_290/0.35),transparent_60%)]" />
        <Users className="size-10 text-neon-purple mx-auto glow-purple" />
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mt-3">مجتمع HN-AI</h1>
        <p className="text-muted-foreground mt-2 max-w-xl mx-auto text-sm">
          تعلّم أسرع مع الآخرين: شارك مشاريعك، تابع المتصدّرين، واقرأ مقالات المجتمع.
        </p>
      </header>

      <div className="grid lg:grid-cols-3 gap-4">
        <section className="glass rounded-3xl p-6 border border-border/40 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold flex items-center gap-2">
              <Trophy className="size-5 text-neon-orange" /> أفضل المتعلّمين
            </h2>
            <Link to="/leaderboard" className="text-sm text-neon-cyan">الترتيب الكامل →</Link>
          </div>
          <div className="space-y-2">
            {leaders.length === 0 && <p className="text-sm text-muted-foreground">لا يوجد متعلّمون بعد — كن الأول!</p>}
            {leaders.map((u, i) => (
              <div key={u.user_id} className="flex items-center gap-3 rounded-xl border border-border/40 px-4 py-3">
                <span className="font-display font-bold w-6 text-center text-muted-foreground">#{i + 1}</span>
                <div className="size-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center">
                  <Crown className="size-4 text-white" />
                </div>
                <div className="flex-1 min-w-0 truncate font-medium">{u.display_name ?? "متعلّم"}</div>
                <span className="text-sm text-neon-purple font-bold">{u.xp} XP</span>
                <span className="text-xs text-neon-orange inline-flex items-center gap-1">
                  <Flame className="size-3" />{u.streak}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-4">
          <CardLink to="/projects" icon={Rocket} title="مشاريع الطلاب" desc="أنجز مشروعًا صغيرًا وشاركه للمراجعة." />
          <CardLink to="/blog" icon={Newspaper} title="مقالات المجتمع" desc="مقالات ودروس مكتوبة من فريق HN-AI." />
          <CardLink to="/chat" icon={MessageCircle} title="HN AI Chat" desc="اسأل المرشد الذكي في أي وقت." />
        </div>
      </div>

      {articles.length > 0 && (
        <section className="grid sm:grid-cols-3 gap-4">
          {articles.map((p) => (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="glass rounded-2xl p-5 border border-border/40 hover:border-neon-purple/50 transition"
            >
              <div className="font-semibold line-clamp-2">{p.title}</div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}

function CardLink({ to, icon: Icon, title, desc }: { to: string; icon: React.ElementType; title: string; desc: string }) {
  return (
    <Link to={to} className="glass rounded-2xl p-5 border border-border/40 flex gap-3 hover:border-neon-cyan/50 transition">
      <div className="size-10 rounded-xl bg-muted/30 grid place-items-center shrink-0">
        <Icon className="size-5 text-neon-cyan" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{desc}</div>
      </div>
    </Link>
  );
}
