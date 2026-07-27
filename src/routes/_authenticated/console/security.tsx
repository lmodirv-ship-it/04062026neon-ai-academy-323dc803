import { createFileRoute } from "@tanstack/react-router";
import { SecurityPanel } from '@/components/console/SystemPanels';

export const Route = createFileRoute("/_authenticated/console/security")({
  head: () => ({
    meta: [
      { title: "الأمان والصلاحيات — لوحة تحكم HN-AI" },
      { name: "description", content: "توزيع الأدوار وقواعد الحماية في المنصة." },
      { property: "og:title", content: "الأمان والصلاحيات — لوحة تحكم HN-AI" },
      { property: "og:description", content: "توزيع الأدوار وقواعد الحماية في المنصة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SecurityPanel />,
});
