import { createFileRoute } from "@tanstack/react-router";
import { TransactionsPanel } from '@/components/console/UpcomingPanels';

export const Route = createFileRoute("/_authenticated/console/transactions")({
  head: () => ({
    meta: [
      { title: "المدفوعات والفواتير — لوحة تحكم HN-AI" },
      { name: "description", content: "سجل عمليات الدفع والفواتير في HN-AI." },
      { property: "og:title", content: "المدفوعات والفواتير — لوحة تحكم HN-AI" },
      { property: "og:description", content: "سجل عمليات الدفع والفواتير في HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <TransactionsPanel />,
});
