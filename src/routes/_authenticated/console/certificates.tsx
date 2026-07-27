import { createFileRoute } from "@tanstack/react-router";
import { CertificatesPanel } from '@/components/console/LmsPanels';

export const Route = createFileRoute("/_authenticated/console/certificates")({
  head: () => ({
    meta: [
      { title: "الشهادات — لوحة تحكم HN-AI" },
      { name: "description", content: "المتعلمون المؤهلون لشهادات إتمام دورات HN-AI." },
      { property: "og:title", content: "الشهادات — لوحة تحكم HN-AI" },
      { property: "og:description", content: "المتعلمون المؤهلون لشهادات إتمام دورات HN-AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <CertificatesPanel />,
});
