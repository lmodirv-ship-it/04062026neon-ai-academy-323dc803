import { createFileRoute } from "@tanstack/react-router";
import { AccountPanel } from "@/components/console/AccountPanel";

export const Route = createFileRoute("/_authenticated/console/account")({
  head: () => ({
    meta: [
      { title: "إعدادات الحساب — لوحة تحكم HN-AI" },
      { name: "description", content: "تعديل الاسم والبريد الإلكتروني وصورة الملف الشخصي وكلمة المرور وتسجيل الخروج." },
      { property: "og:title", content: "إعدادات الحساب — لوحة تحكم HN-AI" },
      { property: "og:description", content: "إدارة بيانات حسابك في أكاديمية HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AccountPanel />,
});
