import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState, useEffect } from "react";
import { Bot, Send, Loader2, Sparkles, User as UserIcon } from "lucide-react";
import { runAI } from "@/lib/api/ai.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "HN AI Chat — مساعدك الذكي للتعلّم" },
      { name: "description", content: "تحدّث مع مرشد HN-AI: اسأل عن الذكاء الاصطناعي، البرمجة، Linux وقواعد البيانات واحصل على شرح مبسّط فورًا." },
      { property: "og:title", content: "HN AI Chat — مساعدك الذكي للتعلّم" },
      { property: "og:description", content: "مرشد ذكي يجيب على أسئلتك التعليمية بالعربية خطوة بخطوة." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "ai"; text: string };

const starters = [
  "اشرح لي ما هو الذكاء الاصطناعي التوليدي ببساطة",
  "كيف أبدأ تعلّم Python في 10 دقائق يوميًا؟",
  "ما الفرق بين SQL و NoSQL؟",
  "أعطني خطة أسبوع لتعلّم أساسيات الأمن السيبراني",
];

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const callAI = useServerFn(runAI);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setError("");
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await callAI({ data: { prompt: q, mode: "generate" } });
      setMessages((m) => [...m, { role: "ai", text: res.text }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-4" dir="rtl">
      <header className="glass-strong rounded-3xl p-6 border border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_-30%,oklch(0.7_0.2_290/0.35),transparent_60%)]" />
        <div className="relative flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center glow-purple">
            <Bot className="size-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">HN AI Chat</h1>
            <p className="text-sm text-muted-foreground">مرشدك الشخصي — اسأل أي شيء في التقنية والتعلّم.</p>
          </div>
        </div>
      </header>

      <div className="glass rounded-3xl border border-border/40 p-4 min-h-[45vh] flex flex-col gap-4">
        {messages.length === 0 && (
          <div className="flex-1 grid sm:grid-cols-2 gap-3 content-center">
            {starters.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-right rounded-2xl border border-border/40 p-4 text-sm hover:border-neon-purple/60 hover:bg-muted/20 transition"
              >
                <Sparkles className="size-4 text-neon-cyan mb-2" />
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div
              className={`size-9 shrink-0 rounded-xl grid place-items-center ${
                m.role === "user"
                  ? "bg-muted/40"
                  : "bg-gradient-to-br from-neon-purple to-neon-blue glow-purple"
              }`}
            >
              {m.role === "user" ? <UserIcon className="size-4" /> : <Bot className="size-4 text-white" />}
            </div>
            <div
              className={`rounded-2xl px-4 py-3 text-sm leading-7 whitespace-pre-wrap max-w-[85%] ${
                m.role === "user" ? "bg-muted/30" : "glass-strong border border-neon-purple/25"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-neon-cyan" /> المرشد يكتب…
          </div>
        )}
        {error && <div className="text-sm text-destructive">{error}</div>}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="glass-strong rounded-2xl border border-border/40 p-2 flex items-center gap-2 sticky bottom-24 lg:bottom-4"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب سؤالك هنا…"
          className="flex-1 bg-transparent px-3 py-2 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold text-sm glow-purple disabled:opacity-50 inline-flex items-center gap-2"
        >
          <Send className="size-4" /> إرسال
        </button>
      </form>
    </div>
  );
}
