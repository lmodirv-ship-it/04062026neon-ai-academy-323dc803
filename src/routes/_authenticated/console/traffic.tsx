import { createFileRoute } from "@tanstack/react-router";
import { StatsPanel } from '@/components/console/CorePanels';

export const Route = createFileRoute("/_authenticated/console/traffic")({
  head: () => ({
    meta: [
      { title: "إحصائيات الزوار — لوحة تحكم HN-AI" },
      { name: "description", content: "حركة الزيارات اليومية والصفحات الأكثر مشاهدة." },
      { property: "og:title", content: "إحصائيات الزوار — لوحة تحكم HN-AI" },
      { property: "og:description", content: "حركة الزيارات اليومية والصفحات الأكثر مشاهدة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <StatsPanel />,
});
