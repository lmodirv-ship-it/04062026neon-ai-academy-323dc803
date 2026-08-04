import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useEffect } from "react";
import { Newspaper, Search, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { listPosts } from "@/lib/api/blog.functions";

const PAGE_SIZE = 20;

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: "مدونة HN-AI — مقالات الذكاء الاصطناعي" },
      { name: "description", content: "مقالات ودروس مكتوبة حول الذكاء الاصطناعي، هندسة الأوامر، والأتمتة من فريق HN-AI." },
      { property: "og:title", content: "مدونة HN-AI — مقالات الذكاء الاصطناعي" },
      { property: "og:description", content: "مقالات ودروس مكتوبة حول الذكاء الاصطناعي والأتمتة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data, isLoading } = useQuery({ queryKey: ["blog-list"], queryFn: () => listPosts() });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      (data?.posts ?? []).filter(
        (p) =>
          (!cat || p.category_id === cat) &&
          (q.trim() === "" || (p.title + " " + (p.excerpt ?? "")).toLowerCase().includes(q.toLowerCase())),
      ),
    [data?.posts, cat, q],
  );

  useEffect(() => { setPage(1); }, [q, cat]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const posts = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      <header className="glass-strong rounded-3xl p-6 border-neon-cyan/30 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,oklch(0.8_0.15_200/0.3),transparent_60%)]" />
        <Newspaper className="size-10 mx-auto text-neon-cyan" />
        <h1 className="font-display font-extrabold text-4xl mt-3 text-gold">مدونة HN-AI</h1>
        <p className="text-muted-foreground mt-2">مقالات قصيرة وعميقة عن الذكاء الاصطناعي والأتمتة.</p>
      </header>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في المقالات…" className="bg-transparent outline-none text-sm flex-1" />
        </div>
        <button onClick={() => setCat(null)} className={`px-3 py-2 rounded-xl text-sm glass ${!cat ? "border-neon-purple text-neon-purple" : ""}`}>الكل</button>
        {(data?.categories ?? []).map((c) => (
          <button key={c.id} onClick={() => setCat(c.id)} className={`px-3 py-2 rounded-xl text-sm glass inline-flex items-center gap-1 ${cat === c.id ? "border-neon-purple text-neon-purple" : ""}`}>
            <Tag className="size-3" /> {c.name}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-center text-muted-foreground py-16">جارٍ التحميل…</div>}
      {!isLoading && posts.length === 0 && (
        <div className="text-center text-muted-foreground py-16 glass rounded-2xl">لا توجد مقالات منشورة بعد.</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {posts.map((p) => (
          <Link key={p.id} to="/blog/$slug" params={{ slug: p.slug }} className="glass rounded-2xl overflow-hidden hover:border-neon-cyan/60 transition group">
            {p.cover_url && <img src={p.cover_url} alt={p.title} loading="lazy" className="w-full h-40 object-cover group-hover:scale-[1.02] transition" />}
            <div className="p-4">
              <h2 className="font-display font-bold text-lg">{p.title}</h2>
              {p.excerpt && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{p.excerpt}</p>}
              <div className="text-xs text-muted-foreground mt-3">
                {p.published_at ? new Date(p.published_at).toLocaleDateString("ar") : ""}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-2 rounded-xl glass text-sm inline-flex items-center gap-1 disabled:opacity-40"
          >
            <ChevronRight className="size-4" /> السابق
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`size-9 rounded-xl glass text-sm ${n === page ? "border-neon-purple text-neon-purple font-bold" : ""}`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-2 rounded-xl glass text-sm inline-flex items-center gap-1 disabled:opacity-40"
          >
            التالي <ChevronLeft className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
