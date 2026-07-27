import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity, BarChart3, Bell, BookOpen, ChevronDown, CreditCard, FileCode2, FileText,
  FlaskConical, GraduationCap, Home, KeyRound, LayoutGrid, LifeBuoy, LineChart, Lock,
  LogOut, Menu, MessageSquare, Newspaper, Receipt, Settings as SettingsIcon,
  Shield, Tags, Trophy, User, UserCog, Users,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

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
    group: "اللوحة الرئيسية", icon: Home,
    items: [{ to: "/console", label: "الرئيسية", icon: LayoutGrid, exact: true }],
  },
  {
    group: "إدارة المحتوى التعليمي", icon: BookOpen,
    items: [
      { to: "/console/courses", label: "المسارات والدورات", icon: BookOpen },
      { to: "/console/lessons", label: "الدروس والوحدات", icon: FileText },
      { to: "/console/quizzes", label: "الاختبارات والواجبات", icon: Trophy },
      { to: "/console/certificates", label: "الشهادات", icon: GraduationCap },
    ],
  },
  {
    group: "بيئات الذكاء الاصطناعي", icon: FlaskConical,
    items: [
      { to: "/console/playground", label: "المختبر التفاعلي", icon: FlaskConical },
      { to: "/console/api", label: "مفاتيح الـ API والاستهلاك", icon: KeyRound },
      { to: "/console/repos", label: "المشاريع ومكتبات الأكواد", icon: FileCode2 },
    ],
  },
  {
    group: "الطلاب والمجتمع", icon: Users,
    items: [
      { to: "/console/students", label: "إدارة الطلاب", icon: Users },
      { to: "/console/instructors", label: "المدربون والمساعدون", icon: UserCog },
      { to: "/console/forum", label: "المنتدى والمناقشات", icon: MessageSquare },
      { to: "/console/blog", label: "المدونة", icon: Newspaper },
    ],
  },
  {
    group: "الاشتراكات والمبيعات", icon: CreditCard,
    items: [
      { to: "/console/plans", label: "الاشتراكات والخطط", icon: CreditCard },
      { to: "/console/transactions", label: "المدفوعات والفواتير", icon: Receipt },
      { to: "/console/coupons", label: "الكوبونات والخصومات", icon: Tags },
    ],
  },
  {
    group: "التحليلات والتقارير", icon: BarChart3,
    items: [
      { to: "/console/learning", label: "تحليلات التعلم", icon: BarChart3 },
      { to: "/console/traffic", label: "إحصائيات الزوار", icon: LineChart },
      { to: "/console/financial", label: "التقارير المالية", icon: LineChart },
    ],
  },
  {
    group: "النظام والإعدادات", icon: SettingsIcon,
    items: [
      { to: "/console/support", label: "الدعم والرسائل", icon: LifeBuoy },
      { to: "/console/notifications", label: "الإشعارات", icon: Bell },
      { to: "/console/logs", label: "سجل الأنشطة", icon: Activity },
      { to: "/console/settings", label: "إعدادات المنصة", icon: SettingsIcon },
      { to: "/console/security", label: "الأمان والصلاحيات", icon: Lock },
      { to: "/console/profile", label: "الملف الشخصي", icon: User },
    ],
  },
] as const;

function ConsoleLayout() {
  const { role, signOut } = useAuth();
  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NAV.map((g) => [g.group, true])),
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  if (role && role !== "admin") {
    return (
      <div className="max-w-md mx-auto text-center py-20" dir="rtl">
        <Shield className="size-10 mx-auto text-neon-pink mb-4" />
        <h1 className="font-display text-2xl font-bold">صلاحية المدير مطلوبة</h1>
      </div>
    );
  }

  const sidebar = (
    <nav className="glass rounded-2xl p-3 space-y-2 lg:sticky lg:top-4">
      {NAV.map((g) => {
        const isOpen = open[g.group];
        return (
          <div key={g.group}>
            <button
              type="button"
              onClick={() => setOpen({ ...open, [g.group]: !isOpen })}
              className="w-full flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <g.icon className="size-4 shrink-0" />
              <span className="flex-1 text-start truncate">{g.group}</span>
              <ChevronDown className={`size-3.5 shrink-0 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
            </button>
            {isOpen && (
              <div className="ps-2 space-y-0.5">
                {g.items.map((it) => (
                  <Link
                    key={it.to}
                    to={it.to}
                    activeOptions={{ exact: "exact" in it ? it.exact : false }}
                    onClick={() => setMobileOpen(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm transition text-muted-foreground hover:bg-muted/40 hover:text-foreground data-[status=active]:bg-primary/15 data-[status=active]:text-primary data-[status=active]:font-semibold"
                  >
                    <it.icon className="size-4 shrink-0" />
                    <span className="truncate">{it.label}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => signOut()}
        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-sm text-muted-foreground hover:text-destructive"
      >
        <LogOut className="size-4" /> تسجيل الخروج
      </button>
    </nav>
  );

  return (
    <div dir="rtl" className="max-w-[1400px] mx-auto p-3 sm:p-4">
      <div className="lg:hidden mb-3">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="glass rounded-xl px-3 py-2 flex items-center gap-2 text-sm"
        >
          <Menu className="size-4" /> القائمة
        </button>
        {mobileOpen && <div className="mt-3">{sidebar}</div>}
      </div>

      <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-4">
        <aside className="hidden lg:block">{sidebar}</aside>
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
