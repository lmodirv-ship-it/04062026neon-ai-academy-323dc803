import { createFileRoute } from "@tanstack/react-router";
import { ForumPanel } from '@/components/console/UpcomingPanels';

export const Route = createFileRoute("/_authenticated/console/forum")({
  head: () => ({
    meta: [
      { title: "المنتدى والمناقشات — لوحة تحكم HN-AI" },
      { name: "description", content: "أسئلة الطلاب وإدارة مجتمع منصة HN-AI." },
      { property: "og:title", content: "المنتدى والمناقشات — لوحة تحكم HN-AI" },
      { property: "og:description", content: "أسئلة الطلاب وإدارة مجتمع منصة HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ForumPanel />,
});
