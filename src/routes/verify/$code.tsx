import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ShieldX, Award } from "lucide-react";
import { verifyCertificate, type CertificateRow } from "@/lib/api/learning.functions";

export const Route = createFileRoute("/verify/$code")({
  loader: ({ params }) => verifyCertificate({ data: { code: params.code } }),
  head: ({ params }) => ({
    meta: [
      { title: `التحقّق من الشهادة ${params.code} — HN-AI` },
      { name: "description", content: "تحقّق من صحة شهادة إتمام صادرة عن منصة HN-AI عبر رقم التحقّق الرسمي." },
      { property: "og:title", content: "التحقّق من الشهادة — HN-AI" },
      { property: "og:description", content: "تحقّق من صحة شهادة إتمام صادرة عن منصة HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: VerifyPage,
  errorComponent: () => <div className="py-20 text-center text-muted-foreground">تعذّر التحقّق الآن.</div>,
  notFoundComponent: () => <div className="py-20 text-center text-muted-foreground">غير موجود.</div>,
});

function VerifyPage() {
  const cert = Route.useLoaderData() as CertificateRow | null;
  const { code } = Route.useParams();

  return (
    <div className="max-w-xl mx-auto py-14 space-y-6 text-center">
      {cert ? (
        <div className="glass-strong rounded-3xl border border-gold/30 p-8 space-y-4">
          <ShieldCheck className="mx-auto size-12 text-neon-cyan" />
          <h1 className="font-display text-2xl font-bold text-gold">شهادة صحيحة ✅</h1>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">حاملها</p>
            <p className="font-display text-lg">{cert.holder_name}</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">الدورة</p>
            <p className="inline-flex items-center gap-2 font-semibold"><Award className="size-4 text-gold" /> {cert.course_title}</p>
          </div>
          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            <span>النتيجة: <span className="text-neon-cyan">{cert.score}%</span></span>
            <span>{new Date(cert.issued_at).toLocaleDateString("ar")}</span>
          </div>
          <code className="inline-block rounded-lg border border-border/40 px-3 py-1.5 text-xs" dir="ltr">{cert.code}</code>
        </div>
      ) : (
        <div className="glass rounded-3xl border border-border/40 p-8 space-y-3">
          <ShieldX className="mx-auto size-12 text-neon-pink" />
          <h1 className="font-display text-2xl font-bold">لا توجد شهادة بهذا الرقم</h1>
          <p className="text-sm text-muted-foreground" dir="ltr">{code}</p>
        </div>
      )}
      <Link to="/courses" className="inline-block text-sm text-neon-cyan">تصفّح دورات HN-AI</Link>
    </div>
  );
}
