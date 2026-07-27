import { createFileRoute } from "@tanstack/react-router";
import { CoursesPanel } from '@/components/console/LmsPanels';

export const Route = createFileRoute("/_authenticated/console/courses")({
  head: () => ({
    meta: [
      { title: "المسارات والدورات — لوحة تحكم HN-AI" },
      { name: "description", content: "إدارة البرامج والمستويات والدورات التعليمية في HN-AI." },
      { property: "og:title", content: "المسارات والدورات — لوحة تحكم HN-AI" },
      { property: "og:description", content: "إدارة البرامج والمستويات والدورات التعليمية في HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <CoursesPanel />,
});
