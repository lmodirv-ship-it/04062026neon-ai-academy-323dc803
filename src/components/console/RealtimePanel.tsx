import { useQuery } from "@tanstack/react-query";
import { Activity, Cpu, Database, Radio, RefreshCw, Users } from "lucide-react";
import { getRealtimePulse } from "@/lib/api/console.functions";
import { ErrorBox, Loading, PanelHeader, Stat, fmt } from "./ui";

function Health({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <span className={`size-2.5 rounded-full ${ok ? "bg-neon-cyan animate-pulse" : "bg-neon-pink"}`} />
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{label}</div>
        <div className="text-xs text-muted-foreground truncate">{value}</div>
      </div>
    </div>
  );
}

export function RealtimePanel() {
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ["console-pulse"],
    queryFn: () => getRealtimePulse(),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!data) return null;

  const { live, users, health, topPaths, recent } = data;

  return (
    <div className="space-y-4">
      <PanelHeader
        title="المراقبة اللحظية"
        desc="مؤشرات حيّة تُحدَّث تلقائيًا كل 15 ثانية: الجلسات النشطة، المستخدمون، وصحة النظام."
        action={
          <button onClick={() => refetch()} className="px-3 py-2 rounded-lg glass text-sm inline-flex items-center gap-2">
            <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} /> تحديث
          </button>
        }
      />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Radio className="size-4 text-neon-cyan animate-pulse" />
        مباشر — آخر تحديث {fmt(data.at)}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="جلسات نشطة الآن" value={live.sessions5} hint="آخر 5 دقائق" />
        <Stat label="جلسات آخر 30 دقيقة" value={live.sessions30} />
        <Stat label="متعلّمون نشطون" value={live.learners15} hint="آخر 15 دقيقة" />
        <Stat label="مشاهدات آخر 5 دقائق" value={live.views5} />
      </div>

      <h3 className="font-display font-bold text-sm flex items-center gap-2 pt-2">
        <Users className="size-4 text-neon-purple" /> مؤشرات المستخدمين
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <Stat label="إجمالي المستخدمين" value={users.total} />
        <Stat label="تسجيلات اليوم" value={users.newToday} />
        <Stat label="تسجيلات 7 أيام" value={users.new7d} />
        <Stat label="سلاسل نشطة" value={users.activeStreaks} />
        <Stat label="مجموع النقاط" value={users.totalXp} />
      </div>

      <h3 className="font-display font-bold text-sm flex items-center gap-2 pt-2">
        <Cpu className="size-4 text-neon-cyan" /> صحة النظام
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Health ok={health.dbOk} label="قاعدة البيانات" value={health.dbOk ? "متصلة وتعمل" : "تعذّر الاتصال"} />
        <Health
          ok={health.dbLatencyMs < 800}
          label="زمن الاستجابة"
          value={`${health.dbLatencyMs} ms`}
        />
        <Health ok={health.unreadAlerts === 0} label="تنبيهات غير مقروءة" value={`${health.unreadAlerts} تنبيه`} />
        <Health
          ok={health.publishedLessons > 0}
          label="حالة المحتوى"
          value={`${health.publishedLessons} منشور · ${health.draftLessons} مسودة`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 pt-2">
        <div className="glass rounded-2xl p-4">
          <div className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Database className="size-4 text-neon-purple" /> الصفحات الأكثر زيارة (30 دقيقة)
          </div>
          {topPaths.length ? (
            <ul className="space-y-2 text-xs">
              {topPaths.map((p) => (
                <li key={p.path} className="flex items-center justify-between gap-3">
                  <span className="truncate text-muted-foreground">{p.path}</span>
                  <span className="text-gold font-semibold">{p.hits}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">لا توجد زيارات في آخر 30 دقيقة.</p>
          )}
        </div>

        <div className="glass rounded-2xl p-4">
          <div className="font-semibold text-sm flex items-center gap-2 mb-3">
            <Activity className="size-4 text-neon-cyan" /> آخر الأنشطة الإدارية
          </div>
          {recent.length ? (
            <ul className="space-y-2 text-xs">
              {recent.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                  <span className="truncate">
                    <span className="text-foreground">{r.actor_name ?? "—"}</span>{" "}
                    <span className="text-muted-foreground">{r.action} · {r.entity}</span>
                  </span>
                  <span className="text-muted-foreground/70 shrink-0">{fmt(r.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">لا توجد أنشطة مسجّلة بعد.</p>
          )}
        </div>
      </div>
    </div>
  );
}
