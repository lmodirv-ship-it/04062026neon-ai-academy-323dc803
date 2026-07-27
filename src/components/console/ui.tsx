import { Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { ReactNode } from "react";

export function Stat({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="glass rounded-2xl p-4">
      <div className="text-2xl font-display font-extrabold text-gold">
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      {hint && <div className="text-[11px] text-muted-foreground/70 mt-0.5">{hint}</div>}
    </div>
  );
}

export function exportCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return toast.error("لا توجد بيانات للتصدير");
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [keys.join(","), ...rows.map((r) => keys.map((k) => esc(r[k])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("تم التصدير");
}

export function ExportButton({ name, rows }: { name: string; rows: Record<string, unknown>[] }) {
  return (
    <button onClick={() => exportCsv(name, rows)} className="px-3 py-2 rounded-lg glass text-sm inline-flex items-center gap-2">
      <Download className="size-4" /> تصدير CSV
    </button>
  );
}

export function Bars({ data }: { data: { day: string; views: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.views));
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.day} title={`${d.day}: ${d.views}`}
          className="flex-1 bg-gradient-to-t from-neon-purple/40 to-neon-cyan/70 rounded-t"
          style={{ height: `${(d.views / max) * 100}%`, minHeight: 2 }} />
      ))}
      {data.length === 0 && <div className="text-sm text-muted-foreground">لا توجد بيانات بعد.</div>}
    </div>
  );
}

export const fmt = (s?: string | null) =>
  s ? new Date(s).toLocaleString("ar", { dateStyle: "short", timeStyle: "short" }) : "—";

export function PanelHeader({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="font-display text-xl font-bold">{title}</h2>
        {desc && <p className="text-xs text-muted-foreground mt-1 max-w-xl">{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function Loading() {
  return <div className="py-12 text-center text-muted-foreground">جارٍ التحميل…</div>;
}

export function ErrorBox({ error }: { error: unknown }) {
  return <div className="py-12 text-center text-neon-pink">{(error as Error)?.message ?? "خطأ"}</div>;
}

/** Consistent empty-state for modules whose backend is not wired yet. */
export function Upcoming({ title, desc, bullets }: { title: string; desc: string; bullets: string[] }) {
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Sparkles className="size-5 text-neon-cyan" />
        <div>
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <p className="text-xs text-muted-foreground mt-1">{desc}</p>
        </div>
      </div>
      <ul className="grid sm:grid-cols-2 gap-2 text-sm">
        {bullets.map((b) => (
          <li key={b} className="glass rounded-xl px-3 py-2 text-muted-foreground">{b}</li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground/70">
        هذه الوحدة جاهزة في الواجهة، وتحتاج تفعيل الجداول/بوابة الدفع لتعمل بالبيانات الحقيقية.
      </p>
    </div>
  );
}
