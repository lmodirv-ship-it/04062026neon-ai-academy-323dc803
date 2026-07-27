import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { listUsers } from "@/lib/api/admin.functions";
import { Loading, PanelHeader, Stat } from "./ui";

export function SecurityPanel() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => listUsers() });
  const counts = useMemo(() => {
    const u = data ?? [];
    return {
      admins: u.filter((x) => x.role === "admin").length,
      editors: u.filter((x) => x.role === "editor").length,
      students: u.filter((x) => x.role === "student").length,
      banned: u.filter((x) => x.banned).length,
    };
  }, [data]);

  return (
    <div className="space-y-4">
      <PanelHeader title="الأمان والصلاحيات" desc="توزيع الأدوار وقواعد الحماية المعتمدة في المنصة." />
      {isLoading ? <Loading /> : (
        <div className="grid sm:grid-cols-4 gap-3">
          <Stat label="مديرون" value={counts.admins} />
          <Stat label="محرّرون" value={counts.editors} />
          <Stat label="طلاب" value={counts.students} />
          <Stat label="حسابات محظورة" value={counts.banned} />
        </div>
      )}

      <div className="glass rounded-2xl p-4 text-sm space-y-2">
        <div className="font-semibold">قواعد الصلاحيات</div>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <span className="text-neon-cyan">مدير</span>: كل الصلاحيات — المستخدمون، الإعدادات، المحتوى، السجلات.</li>
          <li>• <span className="text-neon-cyan">محرّر</span>: إنشاء وتحرير المحتوى التعليمي والمقالات فقط.</li>
          <li>• <span className="text-neon-cyan">طالب</span>: الوصول للدروس وتتبّع تقدّمه الشخصي فقط.</li>
          <li>• الأدوار محفوظة في جدول منفصل ومحمية بسياسات صارمة على مستوى الصف.</li>
          <li>• كل إجراء إداري يُسجَّل في سجل الأنشطة.</li>
        </ul>
      </div>
    </div>
  );
}

export function ProfilePanel() {
  const { user, role, signOut } = useAuth();
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");

  const saveName = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
    error ? toast.error(error.message) : toast.success("تم تحديث الاسم");
  };
  const savePw = async () => {
    if (pw.length < 8) return toast.error("كلمة السر يجب أن تكون 8 أحرف على الأقل");
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) return toast.error(error.message);
    setPw("");
    toast.success("تم تغيير كلمة السر");
  };

  return (
    <div className="space-y-4">
      <PanelHeader title="الملف الشخصي" desc="إعدادات حسابك كمسؤول وتغيير كلمة المرور." />
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="text-xs text-muted-foreground">البريد: <span className="text-foreground">{user?.email ?? "—"}</span></div>
          <div className="text-xs text-muted-foreground">الدور: <span className="text-neon-cyan">{role ?? "—"}</span></div>
          <label className="block text-xs text-muted-foreground">الاسم المعروض</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك الجديد"
            className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
          <button onClick={saveName} disabled={!name} className="px-4 py-2 rounded-lg glass border-neon-purple/50 text-sm inline-flex items-center gap-2 disabled:opacity-50">
            <Save className="size-4" /> حفظ الاسم
          </button>
        </div>

        <div className="glass rounded-2xl p-4 space-y-3 self-start">
          <label className="block text-xs text-muted-foreground">كلمة مرور جديدة</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••"
            className="w-full glass rounded-lg px-3 py-2 text-sm bg-transparent outline-none" />
          <button onClick={savePw} className="px-4 py-2 rounded-lg glass border-neon-purple/50 text-sm inline-flex items-center gap-2">
            <Save className="size-4" /> تغيير كلمة المرور
          </button>
          <div className="pt-3 border-t border-border/40">
            <button onClick={() => signOut()} className="px-4 py-2 rounded-lg glass text-sm inline-flex items-center gap-2 text-neon-pink">
              <LogOut className="size-4" /> تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
