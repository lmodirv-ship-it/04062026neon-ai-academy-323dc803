import { createFileRoute } from "@tanstack/react-router";
import { OverviewPanel } from '@/components/console/CorePanels';

export const Route = createFileRoute("/_authenticated/console/")({
  head: () => ({
    meta: [
      { title: "نظرة عامة — لوحة تحكم HN-AI" },
      { name: "description", content: "أرقام سريعة عن الطلاب والمحتوى والزوار في أكاديمية HN-AI." },
      { property: "og:title", content: "نظرة عامة — لوحة تحكم HN-AI" },
      { property: "og:description", content: "أرقام سريعة عن الطلاب والمحتوى والزوار في أكاديمية HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <OverviewPanel />,
});
