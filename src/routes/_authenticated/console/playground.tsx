import { createFileRoute } from "@tanstack/react-router";
import { PlaygroundAdminPanel } from '@/components/console/LabPanels';

export const Route = createFileRoute("/_authenticated/console/playground")({
  head: () => ({
    meta: [
      { title: "المختبر التفاعلي — لوحة تحكم HN-AI" },
      { name: "description", content: "إدارة بيئة تجربة الـ Prompts والنماذج للطلاب." },
      { property: "og:title", content: "المختبر التفاعلي — لوحة تحكم HN-AI" },
      { property: "og:description", content: "إدارة بيئة تجربة الـ Prompts والنماذج للطلاب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlaygroundAdminPanel />,
});
