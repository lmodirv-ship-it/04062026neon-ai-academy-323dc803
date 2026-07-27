import { createFileRoute } from "@tanstack/react-router";
import { FinancialReportsPanel } from '@/components/console/UpcomingPanels';

export const Route = createFileRoute("/_authenticated/console/financial")({
  head: () => ({
    meta: [
      { title: "التقارير المالية — لوحة تحكم HN-AI" },
      { name: "description", content: "الإيرادات ونمو المشتركين في HN-AI." },
      { property: "og:title", content: "التقارير المالية — لوحة تحكم HN-AI" },
      { property: "og:description", content: "الإيرادات ونمو المشتركين في HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <FinancialReportsPanel />,
});
