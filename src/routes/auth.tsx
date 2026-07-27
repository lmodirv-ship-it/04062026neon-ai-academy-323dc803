import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Crown, Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — HN-AI Academy" },
      { name: "description", content: "Create your HN-AI account to track XP, streaks and your learning path." },
      { property: "og:title", content: "Sign in — HN-AI Academy" },
      { property: "og:description", content: "Create your HN-AI account to track XP, streaks and your learning path." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! تحقق من بريدك إن طُلب التأكيد.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      const { data } = await supabase.auth.getSession();
      if (data.session) navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="text-center mb-8">
        <div className="size-14 rounded-2xl mx-auto bg-gradient-to-br from-neon-purple to-neon-blue grid place-items-center glow-purple mb-4">
          <Crown className="size-7 text-white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gold">HN-AI Academy</h1>
        <p className="text-sm text-muted-foreground mt-2">Learn AI in 10 minutes a day</p>
      </div>

      <div className="glass-strong rounded-3xl p-6 border border-border/40">
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 rounded-xl bg-muted/20">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`py-2 rounded-lg text-sm font-semibold transition ${
                mode === m ? "bg-gradient-to-r from-neon-purple to-neon-blue text-white" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "تسجيل الدخول" : "حساب جديد"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "signup" && (
            <Field icon={UserIcon} placeholder="الاسم" value={name} onChange={setName} />
          )}
          <Field icon={Mail} type="email" placeholder="البريد الإلكتروني" value={email} onChange={setEmail} required />
          <Field icon={Lock} type="password" placeholder="كلمة السر" value={password} onChange={setPassword} required />
          <button
            disabled={busy}
            className="w-full rounded-xl py-3 font-semibold bg-gradient-to-r from-neon-purple to-neon-blue text-white glow-purple disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "signin" ? "دخول" : "إنشاء الحساب"}
          </button>
        </form>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-6">
        <Link to="/" className="hover:text-foreground">العودة للرئيسية</Link>
      </p>
    </div>
  );
}

function Field({
  icon: Icon, type = "text", placeholder, value, onChange, required,
}: {
  icon: React.ElementType; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean;
}) {
  return (
    <div className="relative">
      <Icon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-muted/20 border border-border/40 py-3 pl-10 pr-3 text-sm outline-none focus:border-neon-purple/60"
      />
    </div>
  );
}
