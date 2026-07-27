import { createFileRoute } from "@tanstack/react-router";
import { RealtimePanel } from "@/components/console/RealtimePanel";

export const Route = createFileRoute("/_authenticated/console/realtime")({
  head: () => ({
    meta: [
      { title: "المراقبة اللحظية — لوحة تحكم HN-AI" },
      { name: "description", content: "مؤشرات حيّة للجلسات النشطة والمستخدمين وصحة النظام في أكاديمية HN-AI." },
      { property: "og:title", content: "المراقبة اللحظية — لوحة تحكم HN-AI" },
      { property: "og:description", content: "جلسات نشطة، مؤشرات مستخدمين، وصحة النظام لحظة بلحظة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <RealtimePanel />,
});
