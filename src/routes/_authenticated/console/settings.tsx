import { createFileRoute } from "@tanstack/react-router";
import { SettingsPanel } from '@/components/console/CorePanels';

export const Route = createFileRoute("/_authenticated/console/settings")({
  head: () => ({
    meta: [
      { title: "إعدادات المنصة — لوحة تحكم HN-AI" },
      { name: "description", content: "الهوية واللغة والمظهر وتفعيل الأقسام." },
      { property: "og:title", content: "إعدادات المنصة — لوحة تحكم HN-AI" },
      { property: "og:description", content: "الهوية واللغة والمظهر وتفعيل الأقسام." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <SettingsPanel />,
});
