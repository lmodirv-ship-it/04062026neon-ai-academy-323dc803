import { createFileRoute } from "@tanstack/react-router";
import { BlogPanel } from '@/components/console/CorePanels';

export const Route = createFileRoute("/_authenticated/console/blog")({
  head: () => ({
    meta: [
      { title: "إدارة المدونة — لوحة تحكم HN-AI" },
      { name: "description", content: "تحرير مقالات وفئات مدونة HN-AI." },
      { property: "og:title", content: "إدارة المدونة — لوحة تحكم HN-AI" },
      { property: "og:description", content: "تحرير مقالات وفئات مدونة HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <BlogPanel />,
});
