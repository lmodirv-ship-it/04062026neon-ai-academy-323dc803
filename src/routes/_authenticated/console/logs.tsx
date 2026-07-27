import { createFileRoute } from "@tanstack/react-router";
import { LogsPanel } from '@/components/console/CorePanels';

export const Route = createFileRoute("/_authenticated/console/logs")({
  head: () => ({
    meta: [
      { title: "سجل الأنشطة — لوحة تحكم HN-AI" },
      { name: "description", content: "من فعل ماذا ومتى داخل لوحة تحكم HN-AI." },
      { property: "og:title", content: "سجل الأنشطة — لوحة تحكم HN-AI" },
      { property: "og:description", content: "من فعل ماذا ومتى داخل لوحة تحكم HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LogsPanel />,
});
