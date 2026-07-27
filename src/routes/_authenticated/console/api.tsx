import { createFileRoute } from "@tanstack/react-router";
import { ApiUsagePanel } from '@/components/console/LabPanels';

export const Route = createFileRoute("/_authenticated/console/api")({
  head: () => ({
    meta: [
      { title: "مفاتيح الـ API والاستهلاك — لوحة تحكم HN-AI" },
      { name: "description", content: "مراقبة استهلاك نماذج الذكاء الاصطناعي وحماية الرصيد." },
      { property: "og:title", content: "مفاتيح الـ API والاستهلاك — لوحة تحكم HN-AI" },
      { property: "og:description", content: "مراقبة استهلاك نماذج الذكاء الاصطناعي وحماية الرصيد." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <ApiUsagePanel />,
});
