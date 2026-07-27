import { createFileRoute } from "@tanstack/react-router";
import { UsersPanel } from '@/components/console/UsersPanel';

export const Route = createFileRoute("/_authenticated/console/students")({
  head: () => ({
    meta: [
      { title: "إدارة الطلاب — لوحة تحكم HN-AI" },
      { name: "description", content: "ملفات الطلاب وتقدّمهم وإدارة حساباتهم." },
      { property: "og:title", content: "إدارة الطلاب — لوحة تحكم HN-AI" },
      { property: "og:description", content: "ملفات الطلاب وتقدّمهم وإدارة حساباتهم." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <UsersPanel mode="students" title="إدارة الطلاب" desc="ملفات الطلاب، تقدّمهم، إعادة تعيين الحسابات والحظر." />,
});
