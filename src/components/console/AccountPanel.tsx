import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Camera, LogOut, Mail, Save, ShieldCheck } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { PanelHeader } from "./ui";

const ROLE_LABEL: Record<string, string> = {
  owner: "المالك", admin: "مدير", editor: "محرّر", student: "طالب",
};

export function AccountPanel() {
  const { user, role, roles } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email ?? "");
    let active = true;
    supabase.from("profiles").select("display_name, avatar_url").eq("id", user.id).maybeSingle()
      .then(async ({ data }) => {
        if (!active || !data) return;
        setName(data.display_name ?? "");
        if (data.avatar_url) {
          if (data.avatar_url.startsWith("http")) setAvatar(data.avatar_url);
          else {
            const { data: s } = await supabase.storage.from("avatars").createSignedUrl(data.avatar_url, 3600);
            if (active) setAvatar(s?.signedUrl ?? null);
          }
        }
      });
    return () => { active = false; };
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    if (name.trim().length < 2) return toast.error("الاسم قصير جدًا");
    setBusy(true);
    const { error } = await supabase.from("profiles").update({ display_name: name.trim() }).eq("id", user.id);
    setBusy(false);
    if (error) return toast.error(error.message);
    qc.invalidateQueries();
    toast.success("تم حفظ الاسم");
  };

  const saveEmail = async () => {
    const v = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) return toast.error("بريد غير صالح");
    if (v === user?.email) return toast.info("البريد لم يتغيّر");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email: v });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("تم إرسال رسالة تأكيد إلى بريدك الجديد");
  };

  const savePassword = async () => {
    if (pw.length < 8) return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return toast.error(error.message);
    setPw("");
    toast.success("تم تغيير كلمة المرور");
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) return toast.error("الملف يجب أن يكون صورة");
    if (file.size > 2 * 1024 * 1024) return toast.error("الحجم الأقصى 2 ميغابايت");
    setBusy(true);
    const path = `${user.id}/avatar-${Date.now()}.${file.name.split(".").pop() ?? "jpg"}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { setBusy(false); return toast.error(error.message); }
    await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
    const { data: s } = await supabase.storage.from("avatars").createSignedUrl(path, 3600);
    setAvatar(s?.signedUrl ?? null);
    setBusy(false);
    toast.success("تم تحديث الصورة");
  };

  const handleSignOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="space-y-4">
      <PanelHeader title="إعدادات الحساب" desc="عدّل اسمك وبريدك وصورتك الشخصية، أو سجّل الخروج من الجلسة الحالية." />

      <div className="grid lg:grid-cols-[300px_minmax(0,1fr)] gap-4">
        <div className="glass rounded-2xl p-5 text-center space-y-3 self-start">
          <div className="relative mx-auto w-fit">
            {avatar ? (
              <img src={avatar} alt="صورة الملف الشخصي" className="size-28 rounded-3xl object-cover" />
            ) : (
              <div className="grid size-28 place-items-center rounded-3xl bg-gradient-to-br from-neon-purple to-neon-blue text-3xl font-bold text-white">
                {(name || user?.email || "A").slice(0, 1).toUpperCase()}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -end-2 grid size-9 place-items-center rounded-xl bg-white/10 backdrop-blur hover:bg-white/20"
              aria-label="تغيير الصورة"
            >
              <Camera className="size-4" />
            </button>
            <input
              ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }}
            />
          </div>
          <div className="font-display font-bold">{name || user?.email?.split("@")[0]}</div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs text-neon-cyan">
            <ShieldCheck className="size-3.5" /> {ROLE_LABEL[role ?? "student"] ?? role}
          </div>
          {roles.length > 1 && (
            <div className="text-[11px] text-muted-foreground">
              الأدوار: {roles.map((r) => ROLE_LABEL[r] ?? r).join("، ")}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground/70">PNG أو JPG بحد أقصى 2 ميغابايت.</p>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-4 space-y-3">
            <label className="block text-xs text-muted-foreground">الاسم المعروض</label>
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80}
              className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" placeholder="اسمك" />
            <button onClick={saveProfile} disabled={busy}
              className="px-4 py-2 rounded-lg glass border-neon-purple/50 text-sm inline-flex items-center gap-2 disabled:opacity-50">
              <Save className="size-4" /> حفظ الاسم
            </button>
          </div>

          <div className="glass rounded-2xl p-4 space-y-3">
            <label className="block text-xs text-muted-foreground">البريد الإلكتروني</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" maxLength={255}
              className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" placeholder="you@example.com" />
            <button onClick={saveEmail} disabled={busy}
              className="px-4 py-2 rounded-lg glass border-neon-purple/50 text-sm inline-flex items-center gap-2 disabled:opacity-50">
              <Mail className="size-4" /> تحديث البريد
            </button>
            <p className="text-[11px] text-muted-foreground/70">سيصلك بريد تأكيد قبل اعتماد العنوان الجديد.</p>
          </div>

          <div className="glass rounded-2xl p-4 space-y-3">
            <label className="block text-xs text-muted-foreground">كلمة مرور جديدة</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••"
              className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
            <button onClick={savePassword} disabled={busy}
              className="px-4 py-2 rounded-lg glass border-neon-purple/50 text-sm inline-flex items-center gap-2 disabled:opacity-50">
              <Save className="size-4" /> تغيير كلمة المرور
            </button>
          </div>

          <div className="glass rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">إنهاء الجلسة على هذا الجهاز.</div>
            <button onClick={handleSignOut}
              className="px-4 py-2 rounded-lg glass text-sm inline-flex items-center gap-2 text-neon-pink">
              <LogOut className="size-4" /> تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
