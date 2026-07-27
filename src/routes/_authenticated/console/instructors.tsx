import { createFileRoute } from "@tanstack/react-router";
import { UsersPanel } from '@/components/console/UsersPanel';

export const Route = createFileRoute("/_authenticated/console/instructors")({
  head: () => ({
    meta: [
      { title: "المدربون والمساعدون — لوحة تحكم HN-AI" },
      { name: "description", content: "حسابات المديرين والمحرّرين المسؤولين عن المحتوى." },
      { property: "og:title", content: "المدربون والمساعدون — لوحة تحكم HN-AI" },
      { property: "og:description", content: "حسابات المديرين والمحرّرين المسؤولين عن المحتوى." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <UsersPanel mode="staff" title="المدربون والمساعدون" desc="حسابات المديرين والمحرّرين المسؤولين عن المحتوى." />,
});
