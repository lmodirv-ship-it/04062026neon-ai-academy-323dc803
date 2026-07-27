import { createFileRoute } from "@tanstack/react-router";
import { LessonsPanel } from '@/components/console/LmsPanels';

export const Route = createFileRoute("/_authenticated/console/lessons")({
  head: () => ({
    meta: [
      { title: "الدروس والوحدات — لوحة تحكم HN-AI" },
      { name: "description", content: "تنظيم دروس ووحدات المنهج التعليمي في HN-AI." },
      { property: "og:title", content: "الدروس والوحدات — لوحة تحكم HN-AI" },
      { property: "og:description", content: "تنظيم دروس ووحدات المنهج التعليمي في HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LessonsPanel />,
});
