import { createFileRoute } from "@tanstack/react-router";
import { PlansPanel } from '@/components/console/UpcomingPanels';

export const Route = createFileRoute("/_authenticated/console/plans")({
  head: () => ({
    meta: [
      { title: "الاشتراكات والخطط — لوحة تحكم HN-AI" },
      { name: "description", content: "باقات الاشتراك الشهرية والسنوية وشراء الدورات." },
      { property: "og:title", content: "الاشتراكات والخطط — لوحة تحكم HN-AI" },
      { property: "og:description", content: "باقات الاشتراك الشهرية والسنوية وشراء الدورات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <PlansPanel />,
});
