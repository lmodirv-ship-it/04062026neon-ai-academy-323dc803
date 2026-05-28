import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Wand2, Image as ImageIcon, Code2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/playground")({
  head: () => ({ meta: [{ title: "AI Playground — HN-AI" }, { name: "description", content: "Experiment with prompts, generate ideas, and try mini AI tools." }] }),
  component: Playground,
});

const presets = [
  { icon: Wand2, label: "Brainstorm", prompt: "Brainstorm 5 creative startup ideas about " },
  { icon: ImageIcon, label: "Image Prompt", prompt: "Write an art-directed image prompt for " },
  { icon: Code2, label: "Code Helper", prompt: "Explain in 3 bullet points how to " },
  { icon: Sparkles, label: "Hook Writer", prompt: "Write a 60-second YouTube hook about " },
];

const fakeOutputs = [
  "✨ Here's a draft for you:\n\n1. The neon era of AI is just beginning.\n2. Most people are still using AI like a calculator — you can use it like an architect.\n3. Pick ONE workflow this week and let an AI agent handle 80%.\n\n— HN-AI Engine",
  "🎯 Try this CRISP-style rewrite:\n\n[Context] You're building a side project.\n[Role] Senior product strategist.\n[Instruction] Suggest the MVP feature list.\n[Specifics] 5 features, ranked.\n[Polish] Punchy and confident.",
  "🧠 Concept sketch:\nA neon throne room where the user 'levels up' as they learn. Cinematic, dark navy, electric blue rim light, 35mm cinematic, ultra-detailed.",
];

function Playground() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOutput("");
    setTimeout(() => {
      setOutput(fakeOutputs[Math.floor(Math.random() * fakeOutputs.length)]);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <header className="glass-strong rounded-3xl p-6 border-neon-cyan/30 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 size-60 rounded-full bg-neon-cyan/20 blur-3xl pointer-events-none" />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan text-xs font-semibold mb-3">
          <Sparkles className="size-3.5" /> Realtime AI Sandbox
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl tracking-tight">AI Playground</h1>
        <p className="text-muted-foreground mt-2 max-w-xl">Write a prompt, hit generate, and watch ideas appear. Wire this up to HN-DB later for real model calls.</p>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {presets.map((p) => {
          const Icon = p.icon;
          return (
            <button key={p.label} onClick={() => setPrompt(p.prompt)} className="glass rounded-xl p-3 text-left hover:border-neon-purple/50 hover:glow-purple transition">
              <Icon className="size-4 text-neon-purple mb-1" />
              <div className="font-semibold text-sm">{p.label}</div>
            </button>
          );
        })}
      </div>

      <div className="glass-strong rounded-2xl p-4 border-neon-purple/30">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          placeholder="Type your prompt… e.g. 'Act as an AI tutor. Explain reinforcement learning in 3 bullets for a beginner.'"
          className="w-full bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground">{prompt.length} chars</div>
          <button onClick={run} disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-purple to-neon-blue text-white font-semibold glow-purple hover:scale-105 transition disabled:opacity-60">
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {loading ? "Thinking…" : "Generate"}
          </button>
        </div>
      </div>

      {(output || loading) && (
        <div className="glass rounded-2xl p-5 border-neon-cyan/40 glow-cyan">
          <div className="text-xs uppercase tracking-wider text-neon-cyan mb-2 font-semibold">AI Response</div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 rounded shimmer bg-neon-cyan/10" />
              <div className="h-3 rounded shimmer bg-neon-cyan/10 w-4/5" />
              <div className="h-3 rounded shimmer bg-neon-cyan/10 w-2/3" />
            </div>
          ) : (
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{output}</pre>
          )}
        </div>
      )}
    </div>
  );
}
