import { PanelHeader, Upcoming } from "./ui";

export function ForumPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="المنتدى والمناقشات" desc="أسئلة الطلاب وإدارة مجتمع المنصة." />
      <Upcoming title="نظام المناقشات" desc="تعليقات على الدروس وموضوعات منتدى مع إشراف."
        bullets={["تعليقات أسفل كل درس", "موضوعات ووسوم للمنتدى", "إبلاغ وحظر ومراجعة", "إجابات مثبتة من المدربين"]} />
    </div>
  );
}

export function PlansPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="الاشتراكات والخطط" desc="باقات شهرية وسنوية أو شراء دورة منفردة." />
      <Upcoming title="إدارة الباقات" desc="تتطلب تفعيل بوابة الدفع."
        bullets={["خطة شهرية / سنوية", "شراء دورة منفردة", "فترة تجريبية مجانية", "ترقية وإلغاء الاشتراك"]} />
    </div>
  );
}

export function TransactionsPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="المدفوعات والفواتير" desc="سجل عمليات الدفع والفواتير." />
      <Upcoming title="سجل المعاملات" desc="يظهر بعد ربط بوابة الدفع."
        bullets={["سجل كل عملية دفع", "فواتير PDF", "استرجاع المبالغ", "تصدير محاسبي"]} />
    </div>
  );
}

export function CouponsPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="الكوبونات والخصومات" desc="أكواد خصم للحملات التسويقية." />
      <Upcoming title="مولّد الكوبونات" desc="يتطلب تفعيل نظام الاشتراكات."
        bullets={["نسبة أو مبلغ ثابت", "تاريخ انتهاء وحد استخدام", "كوبون لدورة محددة", "تتبّع أداء كل كود"]} />
    </div>
  );
}

export function FinancialReportsPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="التقارير المالية" desc="الإيرادات ونمو المشتركين." />
      <Upcoming title="تقارير الإيرادات" desc="تُحتسب تلقائيًا بعد أول عملية دفع."
        bullets={["إيراد شهري متكرر (MRR)", "نمو المشتركين", "معدل الإلغاء", "متوسط قيمة الطالب"]} />
    </div>
  );
}

export function SupportPanel() {
  return (
    <div className="space-y-4">
      <PanelHeader title="الدعم والرسائل" desc="تذاكر الاستفسارات والمشاكل التقنية." />
      <Upcoming title="نظام التذاكر" desc="استقبال ومتابعة طلبات الدعم."
        bullets={["إنشاء تذكرة من صفحة الطالب", "حالات: مفتوحة/قيد المعالجة/مغلقة", "إسناد التذكرة لعضو فريق", "ردود بالبريد"]} />
    </div>
  );
}
