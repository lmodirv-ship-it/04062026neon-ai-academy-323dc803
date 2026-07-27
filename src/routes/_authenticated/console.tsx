import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BarChart3, Newspaper, Save, Shield, Trash2, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { listUsers, setUserRole } from "@/lib/api/admin.functions";
import { getAdminAnalytics } from "@/lib/api/analytics.functions";
import { listAllPosts, savePost, deletePost, saveCategory } from "@/lib/api/blog.functions";

export const Route = createFileRoute("/_authenticated/console")({
  head: () => ({
    meta: [
      { title: "لوحة المدير — HN-AI" },
      { name: "description", content: "إدارة المستخدمين والأدوار، المدونة، وإحصائيات الزوار في منصة HN-AI." },
      { property: "og:title", content: "لوحة المدير — HN-AI" },
      { property: "og:description", content: "إدارة المستخدمين والمدونة والإحصائيات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Console,
});

const TABS = [
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "blog", label: "المدونة", icon: Newspaper },
  { id: "stats", label: "الإحصائيات", icon: BarChart3 },
] as const;

function Console() {
  const { role } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("users");

  if (role && role !== "admin") {
    return (
      <div className="max-w-md mx-auto text-center py-20" dir="rtl">
        <Shield className="size-10 mx-auto text-neon-pink mb-4" />
        <h1 className="font-display text-2xl font-bold">صلاحية المدير مطلوبة</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <header>
        <h1 className="font-display text-3xl font-bold text-gold">لوحة المدير</h1>
        <p className="text-sm text-muted-foreground mt-1">المستخدمون والأدوار، المدونة، وعداد الزوار.</p>
      </header>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl glass text-sm inline-flex items-center gap-2 ${tab === t.id ? "border-neon-purple text-neon-purple" : ""}`}>
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersPanel />}
      {tab === "blog" && <BlogPanel />}
      {tab === "stats" && <StatsPanel />}
    </div>
  );
}

function UsersPanel() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-users"], queryFn: () => listUsers() });
  const [q, setQ] = useState("");
  const mut = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "editor" | "student" }) => setUserRole({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("تم تحديث الدور"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">جارٍ التحميل…</div>;
  if (error) return <div className="py-12 text-center text-neon-pink">{(error as Error).message}</div>;

  const rows = (data ?? []).filter((u) => u.display_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-3">
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم…" className="glass rounded-xl px-3 py-2 text-sm w-full max-w-xs bg-transparent outline-none" />
      <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
        {rows.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex-1 min-w-[160px]">
              <div className="font-semibold">{u.display_name}</div>
              <div className="text-xs text-muted-foreground">{u.xp} XP · {u.lessons_completed} درس · دقة {u.accuracy}%</div>
            </div>
            <select
              value={u.role}
              onChange={(e) => mut.mutate({ userId: u.id, role: e.target.value as "admin" | "editor" | "student" })}
              className="glass rounded-lg px-2 py-1.5 text-sm bg-transparent"
            >
              <option value="student">طالب</option>
              <option value="editor">محرّر</option>
              <option value="admin">مدير</option>
            </select>
          </div>
        ))}
        {rows.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">لا يوجد مستخدمون.</div>}
      </div>
    </div>
  );
}

const emptyPost = { title: "", slug: "", excerpt: "", content: "", cover_url: "", status: "draft" as "draft" | "published" };

function BlogPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-posts"], queryFn: () => listAllPosts() });
  const [form, setForm] = useState<typeof emptyPost & { id?: string }>(emptyPost);
  const [catName, setCatName] = useState("");

  const save = useMutation({
    mutationFn: () => savePost({
      data: {
        ...(form.id ? { id: form.id } : {}),
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt || null,
        content: form.content,
        cover_url: form.cover_url || null,
        tags: [],
        status: form.status,
      },
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-posts"] }); setForm(emptyPost); toast.success("تم الحفظ"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deletePost({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-posts"] }); toast.success("تم الحذف"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const cat = useMutation({
    mutationFn: () => saveCategory({ data: { name: catName, slug: slugify(catName) } }),
    onSuccess: () => { setCatName(""); toast.success("تمت إضافة الفئة"); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="glass rounded-2xl p-4 space-y-3">
        <h2 className="font-display font-bold">{form.id ? "تعديل مقال" : "مقال جديد"}</h2>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="العنوان" className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug (اختياري)" className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
        <input value={form.cover_url} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} placeholder="رابط صورة الغلاف" className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
        <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="المقتطف" rows={2} className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
        <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="محتوى المقال" rows={10} className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
        <div className="flex items-center gap-2">
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "draft" | "published" })} className="glass rounded-lg px-2 py-2 text-sm bg-transparent">
            <option value="draft">مسودة</option>
            <option value="published">منشور</option>
          </select>
          <button onClick={() => save.mutate()} disabled={!form.title || save.isPending} className="px-4 py-2 rounded-lg glass border-neon-purple/50 text-sm inline-flex items-center gap-2 disabled:opacity-50">
            <Save className="size-4" /> حفظ
          </button>
          {form.id && <button onClick={() => setForm(emptyPost)} className="text-xs text-muted-foreground">إلغاء</button>}
        </div>

        <div className="pt-3 border-t border-border/40 flex gap-2">
          <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="فئة جديدة" className="flex-1 glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
          <button onClick={() => cat.mutate()} disabled={!catName} className="px-3 py-2 rounded-lg glass text-sm disabled:opacity-50">إضافة</button>
        </div>
      </div>

      <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden self-start">
        {isLoading && <div className="p-6 text-center text-muted-foreground text-sm">جارٍ التحميل…</div>}
        {(data ?? []).map((p: any) => (
          <div key={p.id} className="flex items-center gap-3 p-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{p.title}</div>
              <div className="text-xs text-muted-foreground">{p.status === "published" ? "منشور" : "مسودة"} · /{p.slug}</div>
            </div>
            <button onClick={() => setForm({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", content: p.content ?? "", cover_url: p.cover_url ?? "", status: p.status })} className="text-xs text-neon-cyan">تعديل</button>
            <button onClick={() => del.mutate(p.id)} className="text-muted-foreground hover:text-neon-pink"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {!isLoading && (data ?? []).length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">لا توجد مقالات.</div>}
      </div>
    </div>
  );
}

function StatsPanel() {
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-analytics"], queryFn: () => getAdminAnalytics() });
  if (isLoading) return <div className="py-12 text-center text-muted-foreground">جارٍ التحميل…</div>;
  if (error) return <div className="py-12 text-center text-neon-pink">{(error as Error).message}</div>;

  const daily = data!.daily;
  const max = Math.max(1, ...daily.map((d) => d.views));
  const today = daily[daily.length - 1];

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-3">
        <Stat label="زوار اليوم" value={today?.visitors ?? 0} />
        <Stat label="مشاهدات اليوم" value={today?.views ?? 0} />
        <Stat label="المستخدمون" value={data!.totalUsers} />
        <Stat label="دروس مكتملة" value={data!.totalLessonsCompleted} />
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="text-sm font-semibold mb-3">الزيارات (آخر 30 يومًا)</div>
        <div className="flex items-end gap-1 h-32">
          {daily.map((d) => (
            <div key={d.day} title={`${d.day}: ${d.views}`} className="flex-1 bg-gradient-to-t from-neon-purple/40 to-neon-cyan/70 rounded-t" style={{ height: `${(d.views / max) * 100}%`, minHeight: 2 }} />
          ))}
          {daily.length === 0 && <div className="text-sm text-muted-foreground">لا توجد بيانات بعد.</div>}
        </div>
      </div>

      <div className="glass rounded-2xl p-4">
        <div className="text-sm font-semibold mb-3">الصفحات الأكثر زيارة</div>
        <ul className="space-y-1 text-sm">
          {data!.topPaths.map((p) => (
            <li key={p.path} className="flex justify-between"><span className="text-muted-foreground truncate">{p.path}</span><span className="text-neon-cyan font-semibold">{p.count}</span></li>
          ))}
          {data!.topPaths.length === 0 && <li className="text-muted-foreground">لا توجد بيانات.</li>}
        </ul>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-2xl font-display font-extrabold text-gold">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 80) || `post-${Date.now().toString(36)}`;
}
