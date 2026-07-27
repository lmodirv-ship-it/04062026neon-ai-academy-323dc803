import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getLmsOverview } from "@/lib/api/console-lms.functions";
import { PanelHeader, Stat, Upcoming } from "./ui";

export function PlaygroundAdminPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="المختبر التفاعلي" desc="البيئة التي يجرّب فيها الطلاب الـ Prompts والنماذج."
        action={<Link to="/playground" className="px-3 py-2 rounded-lg glass border-neon-purple/50 text-sm">فتح المختبر</Link>} />
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="نموذج التوليد" value="Gemini Flash" hint="مفتاح محفوظ في الخادم" />
        <Stat label="وضع تحسين Prompt" value="مفعّل" hint="إطار CRISP" />
        <Stat label="بيئات خارجية" value="Colab / Jupyter" hint="روابط مرجعية" />
      </div>
      <Upcoming title="إدارة بيئات التدريب" desc="ربط دفاتر Jupyter/Colab وتمارين تفاعلية لكل درس."
        bullets={["ربط دفتر Colab بكل درس", "قوالب Prompt جاهزة للطلاب", "حدود استخدام لكل طالب", "حفظ محاولات الطلاب ومراجعتها"]} />
    </div>
  );
}

export function ApiUsagePanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="مفاتيح الـ API واستهلاك الموارد" desc="مراقبة استهلاك نماذج الذكاء الاصطناعي وحماية الرصيد." />
      <div className="glass rounded-2xl p-4 text-sm space-y-2">
        <div className="font-semibold">المفاتيح المهيّأة</div>
        <ul className="text-muted-foreground space-y-1 text-xs">
          <li>• Gemini (توليد المحتوى والمختبر) — محفوظ بشكل آمن في الخادم</li>
          <li>• Gemini Flash (توليد الدروس في الاستوديو) — محفوظ بشكل آمن في الخادم</li>
        </ul>
        <p className="text-[11px] text-muted-foreground/70">لا تُعرض قيم المفاتيح هنا لأسباب أمنية.</p>
      </div>
      <Upcoming title="عدّاد الاستهلاك" desc="تتبّع عدد الطلبات والتوكنات لكل طالب مع حدود يومية."
        bullets={["عدّاد توكنات لكل مستخدم", "حد يومي/شهري قابل للضبط", "تنبيه عند تجاوز الحد", "تقرير تكلفة تقديري"]} />
    </div>
  );
}

export function ReposPanel() {
  const { data } = useQuery({ queryKey: ["console-lms"], queryFn: () => getLmsOverview() });
  return (
    <div className="space-y-4">
      <PanelHeader title="المشاريع ومكتبات الأكواد" desc="مجموعات البيانات والأكواد الجاهزة المرفقة بالدروس." />
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="فقرات كود داخل الدروس" value={data?.counts.blocks ?? 0} />
        <Stat label="دروس" value={data?.counts.lessons ?? 0} />
        <Stat label="دورات" value={data?.counts.courses ?? 0} />
      </div>
      <Upcoming title="مكتبة الملفات والبيانات" desc="رفع Datasets وملفات مرفقة وربطها بالدروس."
        bullets={["رفع ملفات ومجموعات بيانات", "ربط مستودع GitHub بكل مشروع", "مراجعة مشاريع الطلاب", "نسخ جاهزة للتشغيل"]} />
    </div>
  );
}
