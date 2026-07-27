import { createFileRoute } from "@tanstack/react-router";
import { ProfilePanel } from '@/components/console/SystemPanels';

export const Route = createFileRoute("/_authenticated/console/profile")({
  head: () => ({
    meta: [
      { title: "الملف الشخصي — لوحة تحكم HN-AI" },
      { name: "description", content: "إعدادات حساب المسؤول وتغيير كلمة المرور." },
      { property: "og:title", content: "الملف الشخصي — لوحة تحكم HN-AI" },
      { property: "og:description", content: "إعدادات حساب المسؤول وتغيير كلمة المرور." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ProfilePanel />,
});
