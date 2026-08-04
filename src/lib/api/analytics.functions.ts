import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { publicClient } from "./public-client.server";

/** Anonymous page-view tracking (no personal data). */
export const trackView = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    z.object({
      path: z.string().max(300),
      session: z.string().max(64),
      referrer: z.string().max(300).optional().nullable(),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const db = publicClient();
    await db.rpc("track_page_view", {
      _path: data.path,
      _session: data.session,
      _referrer: data.referrer ?? undefined,
      _country: undefined,
    });

    return { ok: true };
  });

/** Public totals shown in the footer. */
export const getPublicStats = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const [{ data }, allTime] = await Promise.all([
    db.from("daily_stats").select("day, views, visitors").order("day", { ascending: false }).limit(30),
    db.from("daily_stats").select("views, visitors"),
  ]);
  const rows = data ?? [];
  const all = allTime.data ?? [];
  return {
    today: rows[0] ?? { day: new Date().toISOString().slice(0, 10), views: 0, visitors: 0 },
    totalViews: all.reduce((s, r) => s + r.views, 0),
    totalVisitors: all.reduce((s, r) => s + r.visitors, 0),
    series: [...rows].reverse(),
  };
});

/** Detailed analytics — admins only. */
export const getAdminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("صلاحية المدير مطلوبة.");

    const [daily, views, users, progress] = await Promise.all([
      context.supabase.from("daily_stats").select("*").order("day", { ascending: false }).limit(30),
      context.supabase.from("page_views").select("path").order("created_at", { ascending: false }).limit(1000),
      context.supabase.from("user_stats").select("user_id, xp, lessons_completed"),
      context.supabase.from("lesson_progress").select("lesson_id, status"),
    ]);

    const pathCounts: Record<string, number> = {};
    for (const v of views.data ?? []) pathCounts[v.path] = (pathCounts[v.path] ?? 0) + 1;
    const topPaths = Object.entries(pathCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([path, count]) => ({ path, count }));

    const lessonCounts: Record<string, number> = {};
    for (const p of progress.data ?? []) if (p.status === "completed") lessonCounts[p.lesson_id] = (lessonCounts[p.lesson_id] ?? 0) + 1;

    return {
      daily: (daily.data ?? []).reverse(),
      topPaths,
      totalUsers: (users.data ?? []).length,
      totalLessonsCompleted: (users.data ?? []).reduce((s, u) => s + (u.lessons_completed ?? 0), 0),
      topLessons: Object.entries(lessonCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)
        .map(([lesson_id, count]) => ({ lesson_id, count })),
    };
  });
