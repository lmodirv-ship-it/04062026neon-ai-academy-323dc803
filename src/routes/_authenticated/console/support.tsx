import { createFileRoute } from "@tanstack/react-router";
import { SupportPanel } from '@/components/console/UpcomingPanels';

export const Route = createFileRoute("/_authenticated/console/support")({
  head: () => ({
    meta: [
      { title: "الدعم والرسائل — لوحة تحكم HN-AI" },
      { name: "description", content: "تذاكر استفسارات الطلاب والمشاكل التقنية." },
      { property: "og:title", content: "الدعم والرسائل — لوحة تحكم HN-AI" },
      { property: "og:description", content: "تذاكر استفسارات الطلاب والمشاكل التقنية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SupportPanel />,
});
