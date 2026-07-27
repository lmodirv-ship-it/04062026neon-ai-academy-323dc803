import { createFileRoute } from "@tanstack/react-router";
import { LearningAnalyticsPanel } from '@/components/console/LmsPanels';

export const Route = createFileRoute("/_authenticated/console/learning")({
  head: () => ({
    meta: [
      { title: "تحليلات التعلم — لوحة تحكم HN-AI" },
      { name: "description", content: "نسب الإكمال وأكثر الدروس تفاعلًا ونقاط تعثّر الطلاب." },
      { property: "og:title", content: "تحليلات التعلم — لوحة تحكم HN-AI" },
      { property: "og:description", content: "نسب الإكمال وأكثر الدروس تفاعلًا ونقاط تعثّر الطلاب." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <LearningAnalyticsPanel />,
});
