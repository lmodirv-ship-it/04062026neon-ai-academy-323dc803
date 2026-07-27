import { createFileRoute } from "@tanstack/react-router";
import { ReposPanel } from '@/components/console/LabPanels';

export const Route = createFileRoute("/_authenticated/console/repos")({
  head: () => ({
    meta: [
      { title: "المشاريع ومكتبات الأكواد — لوحة تحكم HN-AI" },
      { name: "description", content: "مجموعات البيانات والأكواد الجاهزة المرفقة بالدروس." },
      { property: "og:title", content: "المشاريع ومكتبات الأكواد — لوحة تحكم HN-AI" },
      { property: "og:description", content: "مجموعات البيانات والأكواد الجاهزة المرفقة بالدروس." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ReposPanel />,
});
