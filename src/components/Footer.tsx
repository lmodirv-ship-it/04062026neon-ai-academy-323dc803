import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Crown, Download, Eye, Github, Shield } from "lucide-react";
import { getPublicStats } from "@/lib/api/analytics.functions";

export function Footer() {
  const year = new Date().getFullYear();
  const { data: stats } = useQuery({ queryKey: ["public-stats"], queryFn: () => getPublicStats(), staleTime: 60_000 });

  return (
    <footer className="mt-12 border-t border-border/40 glass-strong">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-6 md:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center glow-purple">
              <Crown className="size-4 text-white" />
            </div>
            <span className="font-display font-bold text-base text-gold">HN-AI</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            Learn AI in 10 minutes a day. A HN-Group product — built for the next generation of AI-native learners.
          </p>
        </div>

        <div>
          <div className="font-semibold mb-2 text-foreground">Platform</div>
          <ul className="space-y-1.5 text-muted-foreground">
            <li><Link to="/missions" className="hover:text-neon-cyan">Daily Mission</Link></li>
            <li><Link to="/paths" className="hover:text-neon-cyan">Learning Paths</Link></li>
            <li><Link to="/playground" className="hover:text-neon-cyan">AI Playground</Link></li>
            <li><Link to="/projects" className="hover:text-neon-cyan">Mini Projects</Link></li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-2 text-foreground">App</div>
          <ul className="space-y-1.5 text-muted-foreground">
            <li>
              <Link to="/download" className="inline-flex items-center gap-1.5 hover:text-neon-cyan">
                <Download className="size-3.5" /> Download the app
              </Link>
            </li>
            <li className="inline-flex items-center gap-1.5"><Shield className="size-3.5" /> PWA · Offline · Installable</li>
            <li className="inline-flex items-center gap-1.5"><Github className="size-3.5" /> APK build coming soon</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/40 px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-muted-foreground"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
        <span dir="rtl" className="block">
          © {year} <span className="text-gold font-semibold">HN-Group</span> — جميع الحقوق محفوظة
          <span className="text-gold"> مولاي إسماعيل الحسني</span>
        </span>
        <span className="block opacity-70 mt-1">All rights reserved · Built with ♥ for the AI generation</span>
      </div>
    </footer>
  );
}
