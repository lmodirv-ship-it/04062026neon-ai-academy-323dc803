import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPanel } from '@/components/console/CorePanels';

export const Route = createFileRoute("/_authenticated/console/notifications")({
  head: () => ({
    meta: [
      { title: "الإشعارات — لوحة تحكم HN-AI" },
      { name: "description", content: "تنبيهات النظام لفريق إدارة HN-AI." },
      { property: "og:title", content: "الإشعارات — لوحة تحكم HN-AI" },
      { property: "og:description", content: "تنبيهات النظام لفريق إدارة HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <NotificationsPanel />,
});
