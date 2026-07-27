import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { KeyRound, Shield, ShieldOff } from "lucide-react";
import { listUsers, setUserRole } from "@/lib/api/admin.functions";
import { adminUserAction } from "@/lib/api/console.functions";
import { ErrorBox, ExportButton, Loading, PanelHeader, fmt } from "./ui";

type Mode = "all" | "students" | "staff";

export function UsersPanel({ mode = "all", title, desc }: { mode?: Mode; title: string; desc?: string }) {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["admin-users"], queryFn: () => listUsers() });
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sort, setSort] = useState("recent");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-users"] });
  const roleMut = useMutation({
    mutationFn: (v: { userId: string; role: "admin" | "editor" | "student" }) => setUserRole({ data: v }),
    onSuccess: () => { invalidate(); toast.success("تم تحديث الدور"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const actionMut = useMutation({
    mutationFn: (v: { userId: string; action: "ban" | "unban" | "reset_password" | "rename"; value?: string }) =>
      adminUserAction({ data: v }),
    onSuccess: () => { invalidate(); toast.success("تم تنفيذ الإجراء"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = useMemo(() => {
    let r = (data ?? []).filter((u) => `${u.display_name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
    if (mode === "students") r = r.filter((u) => u.role === "student");
    if (mode === "staff") r = r.filter((u) => u.role === "admin" || u.role === "editor");
    if (roleFilter !== "all") r = r.filter((u) => u.role === roleFilter);
    if (sort === "xp") r = [...r].sort((a, b) => b.xp - a.xp);
    if (sort === "name") r = [...r].sort((a, b) => a.display_name.localeCompare(b.display_name));
    return r;
  }, [data, q, roleFilter, sort, mode]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <div className="space-y-3">
      <PanelHeader title={title} desc={desc} action={<ExportButton name="users" rows={rows as unknown as Record<string, unknown>[]} />} />

      <div className="flex flex-wrap gap-2 items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث بالاسم أو البريد…"
          className="glass rounded-xl px-3 py-2 text-sm w-full max-w-xs bg-transparent outline-none" />
        {mode === "all" && (
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="glass rounded-xl px-3 py-2 text-sm bg-transparent">
            <option value="all">كل الأدوار</option>
            <option value="admin">مدير</option>
            <option value="editor">محرّر</option>
            <option value="student">طالب</option>
          </select>
        )}
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="glass rounded-xl px-3 py-2 text-sm bg-transparent">
          <option value="recent">الأحدث</option>
          <option value="xp">الأعلى XP</option>
          <option value="name">الاسم</option>
        </select>
        <span className="text-xs text-muted-foreground">{rows.length} حساب</span>
      </div>

      <div className="glass rounded-2xl divide-y divide-border/40 overflow-hidden">
        {rows.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center gap-3 p-4">
            <div className="flex-1 min-w-[200px]">
              <div className="font-semibold flex items-center gap-2">
                {u.display_name}
                {u.banned && <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-pink/20 text-neon-pink">محظور</span>}
              </div>
              <div className="text-xs text-muted-foreground">{u.email} · {u.xp} XP · {u.lessons_completed} درس · دقة {u.accuracy}%</div>
              <div className="text-[11px] text-muted-foreground/70">آخر دخول: {fmt(u.last_sign_in_at)}</div>
            </div>

            <select value={u.role}
              onChange={(e) => roleMut.mutate({ userId: u.id, role: e.target.value as "admin" | "editor" | "student" })}
              className="glass rounded-lg px-2 py-1.5 text-sm bg-transparent">
              <option value="student">طالب</option>
              <option value="editor">محرّر</option>
              <option value="admin">مدير</option>
            </select>

            <button title="إعادة تعيين كلمة السر"
              onClick={() => {
                const v = window.prompt("كلمة سر جديدة (8 أحرف على الأقل):");
                if (v) actionMut.mutate({ userId: u.id, action: "reset_password", value: v });
              }}
              className="p-2 rounded-lg glass text-muted-foreground hover:text-neon-cyan"><KeyRound className="size-4" /></button>

            <button title={u.banned ? "رفع الحظر" : "حظر الحساب"}
              onClick={() => actionMut.mutate({ userId: u.id, action: u.banned ? "unban" : "ban" })}
              className={`p-2 rounded-lg glass ${u.banned ? "text-neon-cyan" : "text-muted-foreground hover:text-neon-pink"}`}>
              {u.banned ? <Shield className="size-4" /> : <ShieldOff className="size-4" />}
            </button>
          </div>
        ))}
        {rows.length === 0 && <div className="p-6 text-center text-muted-foreground text-sm">لا توجد حسابات مطابقة.</div>}
      </div>
    </div>
  );
}
