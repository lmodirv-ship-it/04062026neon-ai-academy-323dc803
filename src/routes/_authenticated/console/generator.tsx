import { createFileRoute } from "@tanstack/react-router";
import { GeneratorPanel } from "@/components/console/GeneratorPanel";

export const Route = createFileRoute("/_authenticated/console/generator")({
  head: () => ({
    meta: [
      { title: "مولّد الدروس — لوحة تحكم HN-AI" },
      { name: "description", content: "توليد مناهج ودروس تفاعلية تلقائيًا بالذكاء الاصطناعي داخل أكاديمية HN-AI." },
      { property: "og:title", content: "مولّد الدروس — لوحة تحكم HN-AI" },
      { property: "og:description", content: "توليد دورة كاملة من الفصول والوحدات والدروس والأسئلة ثم مراجعتها ونشرها." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <GeneratorPanel />,
});
