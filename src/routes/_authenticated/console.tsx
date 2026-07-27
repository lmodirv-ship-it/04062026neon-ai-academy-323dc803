import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity, BarChart3, Bell, BookOpen, ChevronDown, CreditCard, Crown, FileCode2, FileText,
  FlaskConical, Globe, GraduationCap, Home, KeyRound, LayoutGrid, LifeBuoy, LineChart, Lock,
  LogOut, Menu, MessageSquare, Newspaper, Receipt, Search, Settings as SettingsIcon,
  Shield, Tags, Trophy, User, UserCog, Users, X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import logo from "@/assets/hn-ai-logo.jpg";

export const Route = createFileRoute("/_authenticated/console")({
  head: () => ({
    meta: [
      { title: "لوحة تحكم HN-AI — إدارة الأكاديمية" },
      { name: "description", content: "لوحة تحكم متكاملة: المحتوى التعليمي، مختبر الذكاء الاصطناعي، الطلاب، الاشتراكات، التحليلات والإعدادات." },
      { property: "og:title", content: "لوحة تحكم HN-AI" },
      { property: "og:description", content: "إدارة الدورات والدروس والاختبارات والطلاب والتحليلات في أكاديمية HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConsoleLayout,
});

const NAV = [
  {
    group: "اللوحة الرئيسية", icon: Home, cap: "console",
    items: [
      { to: "/console", label: "الرئيسية", icon: LayoutGrid, exact: true },
      { to: "/console/realtime", label: "المراقبة اللحظية", icon: Radio },
    ],
  },
  {
    group: "إدارة المحتوى التعليمي", icon: BookOpen, cap: "content",
    items: [
      { to: "/console/courses", label: "المسارات والدورات", icon: BookOpen },
      { to: "/console/lessons", label: "الدروس والوحدات", icon: FileText },
      { to: "/console/quizzes", label: "الاختبارات والواجبات", icon: Trophy },
      { to: "/console/certificates", label: "الشهادات", icon: GraduationCap },
    ],
  },
  {
    group: "بيئات الذكاء الاصطناعي", icon: FlaskConical, cap: "content",
    items: [
      { to: "/console/playground", label: "المختبر التفاعلي", icon: FlaskConical },
      { to: "/console/api", label: "مفاتيح الـ API والاستهلاك", icon: KeyRound },
      { to: "/console/repos", label: "المشاريع ومكتبات الأكواد", icon: FileCode2 },
    ],
  },
  {
    group: "الطلاب والمجتمع", icon: Users, cap: "students",
    items: [
      { to: "/console/students", label: "إدارة الطلاب", icon: Users },
      { to: "/console/instructors", label: "المدربون والمساعدون", icon: UserCog },
      { to: "/console/forum", label: "المنتدى والمناقشات", icon: MessageSquare },
      { to: "/console/blog", label: "المدونة", icon: Newspaper },
    ],
  },
  {
    group: "الاشتراكات والمبيعات", icon: CreditCard, cap: "billing",
    items: [
      { to: "/console/plans", label: "الاشتراكات والخطط", icon: CreditCard },
      { to: "/console/transactions", label: "المدفوعات والفواتير", icon: Receipt },
      { to: "/console/coupons", label: "الكوبونات والخصومات", icon: Tags },
    ],
  },
  {
    group: "التحليلات والتقارير", icon: BarChart3, cap: "analytics",
    items: [
      { to: "/console/learning", label: "تحليلات التعلم", icon: BarChart3 },
      { to: "/console/traffic", label: "إحصائيات الزوار", icon: LineChart },
      { to: "/console/financial", label: "التقارير المالية", icon: LineChart },
    ],
  },
  {
    group: "النظام والإعدادات", icon: SettingsIcon, cap: "system",
    items: [
      { to: "/console/support", label: "الدعم والرسائل", icon: LifeBuoy },
      { to: "/console/notifications", label: "الإشعارات", icon: Bell },
      { to: "/console/logs", label: "سجل الأنشطة", icon: Activity },
      { to: "/console/settings", label: "إعدادات المنصة", icon: SettingsIcon },
      { to: "/console/security", label: "الأمان والصلاحيات", icon: Lock },
    ],
  },
  {
    group: "حسابي", icon: User, cap: "console",
    items: [
      { to: "/console/account", label: "إعدادات الحساب", icon: User },
      { to: "/console/profile", label: "الملف الشخصي", icon: UserCog },
    ],
  },
] as const;

type NavItem = (typeof NAV)[number]["items"][number];

const ROLE_LABEL: Record<string, string> = {
  owner: "مالك المنصة", admin: "مدير المنصة", editor: "محرّر المحتوى", student: "طالب",
};

function ConsoleLayout() {
  const { role, roles, rolesLoaded, user, can, signOut } = useAuth();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV.map((g) => [g.group, true])),
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [q, setQ] = useState("");

  const allowedGroups = NAV.filter((g) => can(g.cap as never));
  const ALL_ITEMS: NavItem[] = allowedGroups.flatMap((g) => [...g.items] as NavItem[]);

  if (rolesLoaded && !can("console")) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-3" dir="rtl">
        <Shield className="size-10 mx-auto text-neon-pink" />
        <h1 className="font-display text-2xl font-bold">هذه المنطقة مخصّصة لفريق الإدارة</h1>
        <p className="text-sm text-muted-foreground">
          حسابك مسجَّل كـ«{ROLE_LABEL[role ?? "student"]}» ولا يملك صلاحية الدخول للوحة التحكم.
        </p>
        <Link to="/dashboard" className="inline-block rounded-xl bg-gradient-to-l from-neon-purple to-neon-blue px-4 py-2 text-sm font-semibold text-white">
          العودة إلى لوحتي
        </Link>
      </div>
    );
  }

  const filtered = q.trim()
    ? ALL_ITEMS.filter((i) => i.label.includes(q.trim()))
    : null;


  const navLink = (it: NavItem) => (
    <Link
      key={it.to}
      to={it.to}
      activeOptions={{ exact: "exact" in it ? it.exact : false }}
      onClick={() => { setMobileOpen(false); setQ(""); }}
      className="group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm transition-all text-sidebar-foreground/75 hover:bg-white/5 hover:text-foreground data-[status=active]:bg-gradient-to-l data-[status=active]:from-neon-purple data-[status=active]:to-neon-blue data-[status=active]:text-white data-[status=active]:shadow-[0_10px_30px_-12px_var(--neon-purple)] data-[status=active]:font-semibold"
    >
      <it.icon className="size-[18px] shrink-0 opacity-90" />
      <span className="truncate">{it.label}</span>
    </Link>
  );

  const sidebar = (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/5 bg-[color-mix(in_oklab,var(--background)_70%,black)] p-4 shadow-[0_20px_60px_-30px_var(--neon-purple)]">
      <Link to="/" className="flex items-center gap-3 px-1">
        <img src={logo} alt="شعار HN-AI" className="size-11 rounded-2xl object-cover mix-blend-screen shrink-0" />
        <div className="min-w-0">
          <div className="font-display text-lg font-extrabold leading-none text-gold">HN-AI</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-tight">
            تعلم الذكاء الاصطناعي<br />في 10 دقائق يوميًا
          </div>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto pe-1 space-y-2">
        {filtered
          ? (filtered.length ? filtered.map(navLink) : <p className="text-xs text-muted-foreground px-2 py-6 text-center">لا توجد نتائج</p>)
          : NAV.map((g) => {
              const isOpen = open[g.group];
              return (
                <div key={g.group}>
                  <button
                    type="button"
                    onClick={() => setOpen({ ...open, [g.group]: !isOpen })}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wide text-muted-foreground/70 hover:text-foreground"
                  >
                    <g.icon className="size-3.5 shrink-0" />
                    <span className="flex-1 text-start truncate">{g.group}</span>
                    <ChevronDown className={`size-3.5 shrink-0 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                  </button>
                  {isOpen && <div className="space-y-1">{g.items.map(navLink)}</div>}
                </div>
              );
            })}
      </nav>

      <div className="rounded-2xl border border-neon-orange/25 bg-gradient-to-b from-neon-orange/10 to-transparent p-4 text-center">
        <Crown className="size-6 mx-auto text-neon-orange" />
        <div className="font-display font-bold text-sm mt-2 text-gold">النسخة الاحترافية</div>
        <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground text-start">
          <li>• دروس حصرية ومتقدمة</li>
          <li>• شهادات معتمدة</li>
          <li>• دعم بأولوية</li>
        </ul>
        <Link
          to="/console/plans"
          onClick={() => setMobileOpen(false)}
          className="mt-3 block rounded-xl bg-gradient-to-l from-neon-purple to-neon-blue px-3 py-2 text-xs font-semibold text-white"
        >
          ترقية الآن
        </Link>
      </div>

      <button
        type="button"
        onClick={() => signOut()}
        className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs text-muted-foreground hover:text-destructive"
      >
        <LogOut className="size-4" /> تسجيل الخروج
      </button>
    </div>
  );

  return (
    <div dir="rtl" className="min-h-screen">
      <div className="mx-auto max-w-[1500px] p-3 sm:p-4 lg:p-5">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-4 lg:gap-5">
          <aside className="hidden lg:block">
            <div className="sticky top-4 h-[calc(100vh-2rem)]">{sidebar}</div>
          </aside>

          <div className="min-w-0 space-y-4">
            {/* top bar */}
            <header className="glass-strong sticky top-3 z-30 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-3xl border border-white/5 px-3 py-2.5 sm:px-4">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden grid size-10 shrink-0 place-items-center rounded-xl bg-white/5"
                aria-label="فتح القائمة"
              >
                <Menu className="size-5" />
              </button>
              <div className="hidden lg:block" />

              <div className="relative min-w-0">
                <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="ابحث في أقسام لوحة التحكم…"
                  className="w-full rounded-2xl bg-white/5 border border-white/5 py-2.5 pe-10 ps-3 text-sm outline-none focus:border-neon-purple/50"
                />
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to="/console/notifications"
                  className="relative grid size-10 place-items-center rounded-xl bg-white/5 hover:bg-white/10"
                  aria-label="الإشعارات"
                >
                  <Bell className="size-[18px]" />
                  <span className="absolute -top-0.5 -end-0.5 size-2.5 rounded-full bg-neon-pink" />
                </Link>
                <Link to="/" className="hidden sm:grid size-10 place-items-center rounded-xl bg-white/5 hover:bg-white/10" aria-label="الموقع">
                  <Globe className="size-[18px]" />
                </Link>
                <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-2.5 py-1.5">
                  <div className="hidden sm:block text-end leading-tight">
                    <div className="text-xs font-semibold truncate max-w-[140px]">
                      مرحبًا، {user?.user_metadata?.full_name ?? user?.email?.split("@")[0] ?? "المدير"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">مدير المنصة</div>
                  </div>
                  <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-neon-purple to-neon-blue text-white text-xs font-bold">
                    {(user?.email ?? "A").slice(0, 1).toUpperCase()}
                  </div>
                </div>
              </div>
            </header>

            <main className="min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button type="button" aria-label="إغلاق" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="absolute inset-y-0 end-0 w-[86%] max-w-[320px] p-3">
            <div className="relative h-full">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="absolute -start-1 top-1 z-10 grid size-9 place-items-center rounded-xl bg-white/10"
                aria-label="إغلاق القائمة"
              >
                <X className="size-4" />
              </button>
              {sidebar}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
