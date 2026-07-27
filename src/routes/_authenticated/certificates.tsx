import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Award, ShieldCheck, Copy } from "lucide-react";
import { toast } from "sonner";
import { myCertificates, type CertificateRow } from "@/lib/api/learning.functions";

export const Route = createFileRoute("/_authenticated/certificates")({
  head: () => ({
    meta: [
      { title: "شهاداتي — HN-AI Academy" },
      { name: "description", content: "شهادات إتمام الدورات الخاصة بك على منصة HN-AI مع رقم تحقّق رسمي." },
      { property: "og:title", content: "شهاداتي — HN-AI Academy" },
      { property: "og:description", content: "شهادات إتمام الدورات مع رقم تحقّق رسمي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CertificatesPage,
  errorComponent: () => <div className="py-20 text-center text-muted-foreground">تعذّر تحميل الشهادات.</div>,
  notFoundComponent: () => <div className="py-20 text-center text-muted-foreground">غير موجود.</div>,
});

function CertificatesPage() {
  const { data: certs = [], isLoading } = useQuery<CertificateRow[]>({
    queryKey: ["my-certificates"],
    queryFn: () => myCertificates() as Promise<CertificateRow[]>,
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-6">
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-gold">شهاداتي</h1>
        <p className="text-sm text-muted-foreground">كل شهادة تحمل رقم تحقّق يمكن لأي جهة التأكد منه عبر صفحة التحقّق.</p>
      </header>

      {isLoading && <div className="text-sm text-muted-foreground">جارٍ التحميل…</div>}

      {!isLoading && certs.length === 0 && (
        <div className="glass rounded-3xl border border-border/40 p-10 text-center space-y-3">
          <Award className="mx-auto size-10 text-muted-foreground" />
          <p className="text-muted-foreground text-sm">لا توجد شهادات بعد — أكمل دورة كاملة للحصول على شهادتك الأولى.</p>
          <Link to="/courses" className="text-neon-cyan text-sm">تصفّح الدورات</Link>
        </div>
      )}

      <div className="space-y-4">
        {certs.map((c) => (
          <article key={c.id} className="glass-strong relative overflow-hidden rounded-3xl border border-gold/30 p-6">
            <div className="absolute -left-16 -top-16 size-40 rounded-full bg-gradient-to-br from-[oklch(0.82_0.14_85)]/25 to-transparent blur-2xl" />
            <div className="relative space-y-3">
              <div className="flex items-center gap-2 text-xs text-gold">
                <Award className="size-4" /> شهادة إتمام معتمدة من HN-AI
              </div>
              <h2 className="font-display text-xl font-bold">{c.course_title}</h2>
              <p className="text-sm text-muted-foreground">تُمنح إلى: <span className="text-foreground">{c.holder_name}</span></p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span>النتيجة: <span className="text-neon-cyan">{c.score}%</span></span>
                <span>{new Date(c.issued_at).toLocaleDateString("ar")}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <code className="rounded-lg border border-border/40 px-3 py-1.5 text-xs" dir="ltr">{c.code}</code>
                <button
                  onClick={() => { navigator.clipboard.writeText(c.code); toast.success("تم نسخ رقم التحقّق"); }}
                  className="inline-flex items-center gap-1 rounded-lg border border-border/40 px-3 py-1.5 text-xs"
                >
                  <Copy className="size-3.5" /> نسخ
                </button>
                <Link
                  to="/verify/$code"
                  params={{ code: c.code }}
                  className="inline-flex items-center gap-1 rounded-lg border border-neon-cyan/40 px-3 py-1.5 text-xs text-neon-cyan"
                >
                  <ShieldCheck className="size-3.5" /> صفحة التحقّق
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
