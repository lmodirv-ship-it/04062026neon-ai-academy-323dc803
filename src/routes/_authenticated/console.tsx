import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Activity, BarChart3, Bell, Download, KeyRound, LayoutGrid, Newspaper, Save,
  Settings as SettingsIcon, Shield, ShieldOff, Trash2, Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { listUsers, setUserRole } from "@/lib/api/admin.functions";
import { getAdminAnalytics } from "@/lib/api/analytics.functions";
import { listAllPosts, savePost, deletePost, saveCategory } from "@/lib/api/blog.functions";
import {
  adminUserAction, getOverview, getSettings, listAuditLogs, listNotifications,
  markNotificationRead, saveSetting,
} from "@/lib/api/console.functions";

export const Route = createFileRoute("/_authenticated/console")({
  head: () => ({
    meta: [
      { title: "لوحة المدير — HN-AI" },
      { name: "description", content: "إدارة المستخدمين والأدوار، المحتوى، الإشعارات، سجل الأنشطة، الإعدادات وإحصائيات الزوار في منصة HN-AI." },
      { property: "og:title", content: "لوحة المدير — HN-AI" },
      { property: "og:description", content: "مركز تحكم كامل: مستخدمون، محتوى، تحليلات، سجل أنشطة وإعدادات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Console,
});

const TABS = [
  { id: "overview", label: "نظرة عامة", icon: LayoutGrid },
  { id: "users", label: "المستخدمون", icon: Users },
  { id: "blog", label: "المدونة", icon: Newspaper },
  { id: "stats", label: "الإحصائيات", icon: BarChart3 },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "logs", label: "سجل الأنشطة", icon: Activity },
  { id: "settings", label: "الإعدادات", icon: SettingsIcon },
] as const;

function Console() {
  const { role } = useAuth();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");

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
        <p className="text-sm text-muted-foreground mt-1">مركز تحكم كامل: المستخدمون والأدوار، المحتوى، التحليلات، الإشعارات، سجل الأنشطة والإعدادات.</p>
      </header>

      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl glass text-sm inline-flex items-center gap-2 ${tab === t.id ? "border-neon-purple text-neon-purple" : ""}`}>
            <t.icon className="size-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewPanel />}
      {tab === "users" && <UsersPanel />}
      {tab === "blog" && <BlogPanel />}
      {tab === "stats" && <StatsPanel />}
      {tab === "notifications" && <NotificationsPanel />}
      {tab === "logs" && <LogsPanel />}
      {tab === "settings" && <SettingsPanel />}
    </div>
  );
}

/* ------------------------- helpers ------------------------- */

function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-2xl font-display font-extrabold text-gold">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      {hint && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{hint}</div>}
    </div>
  );
}

function exportCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return toast.error("لا توجد بيانات للتصدير");
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("تم التصدير");
}

function ExportButton({ name, rows }: { name: string; rows: Record<string, unknown>[] }) {
  return (
    <button onClick={() => exportCsv(name, rows)} className="px-3 py-2 rounded-lg glass text-sm inline-flex items-center gap-2">
      <Download className="size-4" /> تصدير CSV
    </button>
  );
}

function Bars({ data }: { data: { day: string; views: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.views));
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.day} title={`${d.day}: ${d.views}`}
          className="flex-1 bg-gradient-to-t from-neon-purple/40 to-neon-cyan/70 rounded-t"
          style={{ height: `${(d.views / max) * 100}%`, minHeight: 2 }} />
      ))}
      {data.length === 0 && <div className="text-sm text-muted-foreground">لا توجد بيانات بعد.</div>}
    </div>
  );
}

const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" }) : "—");

/* ------------------------- overview ------------------------- */

function OverviewPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["console-overview"],
    queryFn: () => getOverview(),
    refetchInterval: 30_000,
  });
  if (isLoading) return <div className="py-12 text-center text-muted-foreground">جارٍ التحميل…</div>;
  if (error) return <div className="py-12 text-center text-neon-pink">{(error as Error).message}</div>;

  const k = data!.kpis;
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="زوار اليوم" value={k.visitorsToday} hint={`${k.viewsToday} مشاهدة اليوم`} />
        <Stat label="المشاهدات (30 يومًا)" value={k.views30} />
        <Stat label="المستخدمون" value={k.users} hint={`${k.admins} مدير · ${k.editors} محرّر`} />
        <Stat label="متعلّمون نشطون (7 أيام)" value={k.activeLearners7d} />
        <Stat label="دروس منشورة" value={k.lessonsPublished} hint={`${k.lessonsDraft} مسودة`} />
        <Stat label="مقالات منشورة" value={k.postsPublished} hint={`${k.postsDraft} مسودة`} />
        <Stat label="دروس مكتملة" value={k.completions} />
        <Stat label="إجمالي XP" value={k.totalXp} hint={`${k.activeStreaks} سلسلة نشطة`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4">
          <div className="text-sm font-semibold mb-3">الزيارات (آخر 30 يومًا)</div>
          <Bars data={data!.series} />
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="text-sm font-semibold mb-3">آخر الأنشطة</div>
          <ul className="space-y-2 text-sm">
            {data!.recent.map((r) => (
              <li key={r.id} className="flex justify-between gap-3">
                <span className="truncate">{r.actor_name ?? "—"} · {r.action} · {r.entity}</span>
                <span className="text-xs text-muted-foreground shrink-0">{fmt(r.created_at)}</span>
              </li>
            ))}
            {data!.recent.length === 0 && <li className="text-muted-foreground">لا توجد أنشطة بعد.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- users ------------------------- */

function UsersPanel() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-users"], queryFn: () => listUsers() });
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });
  const roleMut = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "editor" | "student" }) => setUserRole({ data: v }),
    onSuccess: () => { invalidate(); toast.success("تم تحديث الدور"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const actionMut = useMutation({
    mutationFn: (v: { userId: string; action: "ban" | "unban" | "reset_password" | "rename"; value?: string }) =>
      adminUserAction({ data: v }),
    onSuccess: () => { invalidate(); toast.success("تم تنفيذ الإجراء"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    let r = (data ?? []).filter((u) =>
      `${u.display_name} ${u.email}`.toLowerCase().includes(q.toLowerCase()),
    );
    if (roleFilter !== "all") r = r.filter((u) => u.role === roleFilter);
    if (sort === "xp") r = [...r].sort((a, b) => b.xp - a.xp);
    if (sort === "name") r = [...r].sort((a, b) => a.display_name.localeCompare(b.display_name));
    return r;
  }, [data, q, roleFilter, sort]);

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">جارٍ التحميل…</div>;
  if (error) return <div className="py-12 text-center text-neon-pink">{(error as Error).message}</div>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم أو البريد…"
          className="glass rounded-xl px-3 py-2 text-sm w-full max-w-xs bg-transparent outline-none" />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="glass rounded-xl px-3 py-2 text-sm bg-transparent">
          <option value="all">كل الأدوار</option>
          <option value="admin">مدير</option>
          <option value="editor">محرّر</option>
          <option value="student">طالب</option>
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="glass rounded-xl px-3 py-2 text-sm bg-transparent">
          <option value="recent">الأحدث</option>
          <option value="xp">الأعلى XP</option>
          <option value="name">الاسم</option>
        </select>
        <span className="text-xs text-muted-foreground">{rows.length} مستخدم</span>
        <div className="ms-auto"><ExportButton name="users" rows={rows as unknown as Record<string, unknown>[]} /></div>
      </div>

      <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
        {rows.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold flex items-center gap-2">
                {u.display_name}
                {u.banned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink">محظور</span>}
              </div>
              <div className="text-xs text-muted-foreground">{u.email} · {u.xp} XP · {u.lessons_completed} درس · دقة {u.accuracy}%</div>
              <div className="text-[11px] text-muted-foreground/70">آخر دخول: {fmt(u.last_sign_in_at)}</div>
            </div>

            <select value={u.role}
              onChange={(e) => roleMut.mutate({ userId: u.id, role: e.target.value as "admin" | "editor" | "student" })}
              className="glass rounded-lg px-2 py-1.5 text-sm bg-transparent">
              <option value="student">طالب</option>
              <option value="editor">محرّر</option>
              <option value="admin">مدير</option>
            </select>

            <button title="إعادة تعيين كلمة السر"
              onClick={() => {
                const v = window.prompt("كلمة سر جديدة (8 أحرف على الأقل):");
                if (v) actionMut.mutate({ userId: u.id, action: "reset_password", value: v });
              }}
              className="p-2 rounded-lg glass text-muted-foreground hover:text-neon-cyan"><KeyRound className="size-4" /></button>

            <button title={u.banned ? "رفع الحظر" : "حظر الحساب"}
              onClick={() => actionMut.mutate({ userId: u.id, action: u.banned ? "unban" : "ban" })}
              className={`p-2 rounded-lg glass ${u.banned ? "text-neon-cyan" : "text-muted-foreground hover:text-neon-pink"}`}>
              {u.banned ? <Shield className="size-4" /> : <ShieldOff className="size-4" />}
            </button>
          </div>
        ))}
        {rows.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">لا يوجد مستخدمون مطابقون.</div>}
      </div>
    </div>
  );
}

/* ------------------------- blog ------------------------- */

const emptyPost = { title: "", slug: "", excerpt: "", content: "", cover_url: "", status: "draft" as "draft" | "published" };

function BlogPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-posts"], queryFn: () => listAllPosts() });
  const [form, setForm] = useState<typeof emptyPost & { id?: string }>(emptyPost);
  const [catName, setCatName] = useState("");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

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

  const posts = ((data ?? []) as any[]).filter(
    (p) => p.title.toLowerCase().includes(q.toLowerCase()) && (statusFilter === "all" || p.status === statusFilter),
  );

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

      <div className="space-y-3 self-start">
        <div className="flex flex-wrap gap-2 items-center">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في المقالات…" className="glass rounded-xl px-3 py-2 text-sm flex-1 min-w-[140px] bg-transparent outline-none" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="glass rounded-xl px-3 py-2 text-sm bg-transparent">
            <option value="all">الكل</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
          </select>
          <ExportButton name="posts" rows={posts.map((p) => ({ title: p.title, slug: p.slug, status: p.status, views: p.views, created_at: p.created_at }))} />
        </div>

        <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
          {isLoading && <div className="p-6 text-center text-muted-foreground text-sm">جارٍ التحميل…</div>}
          {posts.map((p: any) => (
            <div key={p.id} className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground">{p.status === "published" ? "منشور" : "مسودة"} · /{p.slug} · {p.views ?? 0} مشاهدة</div>
              </div>
              <button onClick={() => setForm({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", content: p.content ?? "", cover_url: p.cover_url ?? "", status: p.status })} className="text-xs text-neon-cyan">تعديل</button>
              <button onClick={() => del.mutate(p.id)} className="text-muted-foreground hover:text-neon-pink"><Trash2 className="size-4" /></button>
            </div>
          ))}
          {!isLoading && posts.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">لا توجد مقالات.</div>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------- stats ------------------------- */

function StatsPanel() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => getAdminAnalytics(),
    refetchInterval: 60_000,
  });
  if (isLoading) return <div className="py-12 text-center text-muted-foreground">جارٍ التحميل…</div>;
  if (error) return <div className="py-12 text-center text-neon-pink">{(error as Error).message}</div>;

  const daily = data!.daily;
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
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">الزيارات (آخر 30 يومًا)</div>
          <ExportButton name="daily-stats" rows={daily as unknown as Record<string, unknown>[]} />
        </div>
        <Bars data={daily} />
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

/* ------------------------- notifications ------------------------- */

function NotificationsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => listNotifications(),
    refetchInterval: 30_000,
  });
  const mut = useMutation({
    mutationFn: (v: { id: string; read: boolean }) => markNotificationRead({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-notifications"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">جارٍ التحميل…</div>;
  const rows = data ?? [];

  return (
    <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
      {rows.map((n) => (
        <div key={n.id} className={`p-4 flex items-start gap-3 ${n.is_read ? "opacity-60" : ""}`}>
          <Bell className="size-4 mt-1 text-neon-cyan shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm">{n.title}</div>
            {n.body && <div className="text-xs text-muted-foreground mt-0.5">{n.body}</div>}
            <div className="text-[11px] text-muted-foreground/70 mt-1">{fmt(n.created_at)}</div>
          </div>
          <button onClick={() => mut.mutate({ id: n.id, read: !n.is_read })} className="text-xs text-neon-cyan shrink-0">
            {n.is_read ? "تعليم كغير مقروء" : "تعليم كمقروء"}
          </button>
        </div>
      ))}
      {rows.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">لا توجد إشعارات.</div>}
    </div>
  );
}

/* ------------------------- audit logs ------------------------- */

function LogsPanel() {
  const { data, isLoading, error } = useQuery({ queryKey: ["audit-logs"], queryFn: () => listAuditLogs() });
  const [q, setQ] = useState("");
  if (isLoading) return <div className="py-12 text-center text-muted-foreground">جارٍ التحميل…</div>;
  if (error) return <div className="py-12 text-center text-neon-pink">{(error as Error).message}</div>;

  const rows = (data ?? []).filter((l) =>
    `${l.actor_name ?? ""} ${l.action} ${l.entity}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث في السجل…" className="glass rounded-xl px-3 py-2 text-sm w-full max-w-xs bg-transparent outline-none" />
        <span className="text-xs text-muted-foreground">{rows.length} سجل</span>
        <div className="ms-auto"><ExportButton name="audit-logs" rows={rows.map((l) => ({ actor: l.actor_name, action: l.action, entity: l.entity, entity_id: l.entity_id, created_at: l.created_at }))} /></div>
      </div>
      <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
        {rows.map((l) => (
          <div key={l.id} className="p-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold min-w-[120px]">{l.actor_name ?? "—"}</span>
            <span className="text-neon-cyan">{l.action}</span>
            <span className="text-muted-foreground">{l.entity}</span>
            <span className="text-[11px] text-muted-foreground/70 ms-auto">{fmt(l.created_at)}</span>
          </div>
        ))}
        {rows.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">لا توجد أنشطة مسجّلة.</div>}
      </div>
    </div>
  );
}

/* ------------------------- settings ------------------------- */

function SettingsPanel() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["app-settings"], queryFn: () => getSettings() });
  const [site, setSite] = useState<Record<string, any> | null>(null);
  const [features, setFeatures] = useState<Record<string, boolean> | null>(null);

  const s = site ?? data?.site ?? { name: "", tagline: "", logo_url: "", locale: "ar", theme: "dark" };
  const f = features ?? data?.features ?? { blog: true, leaderboard: true, playground: true, registration: true };

  const mut = useMutation({
    mutationFn: (v: { key: string; value: Record<string, any> }) => saveSetting({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["app-settings"] }); toast.success("تم حفظ الإعدادات"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="py-12 text-center text-muted-foreground">جارٍ التحميل…</div>;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="glass rounded-2xl p-4 space-y-3">
        <h2 className="font-display font-bold">الإعدادات العامة</h2>
        <label className="block text-xs text-muted-foreground">اسم الموقع</label>
        <input value={s.name ?? ""} onChange={(e) => setSite({ ...s, name: e.target.value })} className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
        <label className="block text-xs text-muted-foreground">الشعار النصي</label>
        <input value={s.tagline ?? ""} onChange={(e) => setSite({ ...s, tagline: e.target.value })} className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
        <label className="block text-xs text-muted-foreground">رابط اللوغو</label>
        <input value={s.logo_url ?? ""} onChange={(e) => setSite({ ...s, logo_url: e.target.value })} className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">اللغة والاتجاه</label>
            <select value={s.locale ?? "ar"} onChange={(e) => setSite({ ...s, locale: e.target.value })} className="w-full glass rounded-lg px-2 py-2 text-sm bg-transparent">
              <option value="ar">العربية (RTL)</option>
              <option value="en">English (LTR)</option>
              <option value="fr">Français (LTR)</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs text-muted-foreground mb-1">المظهر</label>
            <select value={s.theme ?? "dark"} onChange={(e) => setSite({ ...s, theme: e.target.value })} className="w-full glass rounded-lg px-2 py-2 text-sm bg-transparent">
              <option value="dark">داكن</option>
              <option value="light">فاتح</option>
              <option value="system">حسب النظام</option>
            </select>
          </div>
        </div>
        <button onClick={() => mut.mutate({ key: "site", value: s })} className="px-4 py-2 rounded-lg glass border-neon-purple/50 text-sm inline-flex items-center gap-2">
          <Save className="size-4" /> حفظ
        </button>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3 self-start">
        <h2 className="font-display font-bold">تفعيل الأقسام</h2>
        {([
          ["blog", "المدونة"],
          ["leaderboard", "لوحة الصدارة"],
          ["playground", "ملعب الذكاء الاصطناعي"],
          ["registration", "تسجيل مستخدمين جدد"],
        ] as const).map(([key, label]) => (
          <label key={key} className="flex items-center justify-between text-sm py-1">
            <span>{label}</span>
            <input type="checkbox" checked={Boolean(f[key])} onChange={(e) => setFeatures({ ...f, [key]: e.target.checked })} className="size-4 accent-[oklch(0.7_0.2_300)]" />
          </label>
        ))}
        <button onClick={() => mut.mutate({ key: "features", value: f })} className="px-4 py-2 rounded-lg glass border-neon-purple/50 text-sm inline-flex items-center gap-2">
          <Save className="size-4" /> حفظ
        </button>

        <div className="pt-3 border-t border-border/40 text-xs text-muted-foreground space-y-1">
          <div className="font-semibold text-foreground text-sm mb-1">مفاتيح الربط (API)</div>
          <p>المفاتيح السرّية (Gemini، مفاتيح الخدمات) محفوظة بشكل آمن في الخادم ولا تُعرض هنا لأسباب أمنية.</p>
        </div>
      </div>
    </div>
  );
}

function slugify(s: string) {
  return s.trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 80) || `post-${Date.now().toString(36)}`;
}
