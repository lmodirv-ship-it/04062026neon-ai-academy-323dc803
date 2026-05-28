import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download, Apple, Smartphone, Monitor, Share, Plus, Crown, CheckCircle2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download HN-AI — Install the app" },
      { name: "description", content: "Install HN-AI as a phone app. PWA for Android, iPhone, and Desktop. APK build coming soon." },
      { property: "og:title", content: "Download HN-AI" },
      { property: "og:description", content: "Install HN-AI on Android, iPhone, or Desktop. APK build coming soon." },
    ],
  }),
  component: DownloadPage,
});

type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function DownloadPage() {
  const [evt, setEvt] = useState<BIP | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else if (/android/.test(ua)) setPlatform("android");
    else setPlatform("desktop");

    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as BIP); };
    const onInstalled = () => { setInstalled(true); setEvt(null); };
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone;
    if (isStandalone) setInstalled(true);

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!evt) return;
    await evt.prompt();
    const c = await evt.userChoice;
    if (c.outcome === "accepted") setEvt(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl glass-strong border border-neon-purple/30 p-8 sm:p-12 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(124,77,255,0.25),transparent_60%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/40 text-neon-cyan text-xs font-semibold mb-4">
            <Sparkles className="size-3.5" /> Install HN-AI
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-gold text-gold-glow mb-3">
            Download the App
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Install HN-AI on your phone or desktop and learn AI in 10 minutes a day — even offline.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {installed ? (
              <span className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 font-semibold">
                <CheckCircle2 className="size-5" /> App installed
              </span>
            ) : evt ? (
              <button
                onClick={install}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold glow-purple hover:opacity-90"
              >
                <Download className="size-5" /> Install HN-AI
              </button>
            ) : (
              <a
                href="#guide"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold glow-purple hover:opacity-90"
              >
                <Download className="size-5" /> How to install
              </a>
            )}
            <a href="#apk"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border border-neon-orange/40 text-neon-orange font-bold hover:bg-neon-orange/10">
              <Crown className="size-5" /> APK coming soon
            </a>
          </div>
        </div>
      </section>

      {/* Guides */}
      <section id="guide" className="grid gap-4 md:grid-cols-3">
        <Guide
          active={platform === "android"}
          icon={<Smartphone className="size-5 text-neon-cyan" />}
          title="Android"
          steps={[
            "Open this site in Chrome.",
            "Tap the menu (⋮) in the top-right.",
            'Choose "Install app" or "Add to Home screen".',
            "Launch HN-AI from your home screen.",
          ]}
        />
        <Guide
          active={platform === "ios"}
          icon={<Apple className="size-5 text-neon-pink" />}
          title="iPhone / iPad"
          steps={[
            "Open this site in Safari (not Chrome).",
            <>Tap the <Share className="inline size-4 align-text-bottom" /> Share button.</>,
            <>Choose <b>Add to Home Screen</b> <Plus className="inline size-4 align-text-bottom" />.</>,
            'Tap "Add" — launch HN-AI from your home screen.',
          ]}
        />
        <Guide
          active={platform === "desktop"}
          icon={<Monitor className="size-5 text-neon-purple" />}
          title="Desktop"
          steps={[
            "Open this site in Chrome, Edge, or Brave.",
            "Click the install icon (⊕) in the address bar.",
            'Or open the menu and choose "Install HN-AI".',
            "Launch the app from your Dock / Start menu.",
          ]}
        />
      </section>

      {/* APK */}
      <section id="apk" className="rounded-3xl glass-strong border border-neon-orange/40 p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-neon-orange to-neon-pink grid place-items-center glow-orange shrink-0">
            <Crown className="size-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold">Native APK — coming soon</h2>
            <p className="text-sm text-muted-foreground mt-1">
              The official HN-AI Android APK is being prepared via Capacitor / Bubblewrap. It will be available on Google Play and as a direct download. See <code className="px-1.5 py-0.5 rounded bg-muted/30 text-xs">ANDROID_BUILD.md</code> in the repo for the full build pipeline.
            </p>
            <ul className="text-xs text-muted-foreground mt-3 grid sm:grid-cols-2 gap-1.5">
              <li>• Package: <span className="text-neon-cyan">com.hngroup.hnai</span></li>
              <li>• App name: <span className="text-neon-cyan">HN-AI</span></li>
              <li>• Theme color: <span className="text-neon-cyan">#0b0a1f</span></li>
              <li>• Display: <span className="text-neon-cyan">standalone</span></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Guide({ active, icon, title, steps }: { active: boolean; icon: React.ReactNode; title: string; steps: React.ReactNode[] }) {
  return (
    <div className={`rounded-2xl p-5 glass border transition ${active ? "border-neon-cyan/60 glow-cyan" : "border-border/40"}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="size-9 rounded-xl glass grid place-items-center">{icon}</div>
        <div className="font-display font-bold">{title}</div>
        {active && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/40">Your device</span>}
      </div>
      <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-5">
        {steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </div>
  );
}
