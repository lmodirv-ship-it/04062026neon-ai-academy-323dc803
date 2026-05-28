import { createFileRoute } from "@tanstack/react-router";
import { aiTools } from "@/lib/data/mockData";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/tools")({
  head: () => ({ meta: [{ title: "AI Tools — HN-AI" }, { name: "description", content: "Hand-picked AI tools to power your daily work." }] }),
  component: Tools,
});

function Tools() {
  const cats = ["All", ...Array.from(new Set(aiTools.map((t) => t.category)))];
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? aiTools : aiTools.filter((t) => t.category === cat);
  return (
    <div className="space-y-6">
      <header className="glass-strong rounded-3xl p-6 border-neon-blue/30">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">AI Tools Directory</h1>
        <p className="text-muted-foreground mt-2">The most useful AI tools, hand-picked for builders.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
              cat === c ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50 glow-cyan" : "border-border/40 text-muted-foreground hover:text-foreground hover:border-neon-cyan/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((t) => (
          <a key={t.id} href={t.url} target="_blank" rel="noreferrer" className="glass rounded-2xl p-5 hover:border-neon-purple/50 hover:glow-purple transition flex items-start gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-neon-purple/20 to-neon-blue/20 border border-neon-purple/40 grid place-items-center text-2xl">{t.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold">{t.name}</h3>
                <ExternalLink className="size-3 text-muted-foreground" />
              </div>
              <div className="text-[10px] uppercase tracking-wider text-neon-cyan font-semibold mt-0.5">{t.category}</div>
              <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
