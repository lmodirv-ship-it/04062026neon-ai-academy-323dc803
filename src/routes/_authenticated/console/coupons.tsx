import { createFileRoute } from "@tanstack/react-router";
import { CouponsPanel } from '@/components/console/UpcomingPanels';

export const Route = createFileRoute("/_authenticated/console/coupons")({
  head: () => ({
    meta: [
      { title: "الكوبونات والخصومات — لوحة تحكم HN-AI" },
      { name: "description", content: "أكواد الخصم للحملات التسويقية." },
      { property: "og:title", content: "الكوبونات والخصومات — لوحة تحكم HN-AI" },
      { property: "og:description", content: "أكواد الخصم للحملات التسويقية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <CouponsPanel />,
});
