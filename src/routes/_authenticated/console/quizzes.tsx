import { createFileRoute } from "@tanstack/react-router";
import { QuizzesPanel } from '@/components/console/LmsPanels';

export const Route = createFileRoute("/_authenticated/console/quizzes")({
  head: () => ({
    meta: [
      { title: "الاختبارات والواجبات — لوحة تحكم HN-AI" },
      { name: "description", content: "أسئلة التحقق التفاعلية والواجبات داخل دروس HN-AI." },
      { property: "og:title", content: "الاختبارات والواجبات — لوحة تحكم HN-AI" },
      { property: "og:description", content: "أسئلة التحقق التفاعلية والواجبات داخل دروس HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <QuizzesPanel />,
});
