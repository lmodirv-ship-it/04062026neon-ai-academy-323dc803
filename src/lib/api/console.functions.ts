import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { publicClient } from "./public-client.server";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (!isAdmin) throw new Error("صلاحية المدير مطلوبة.");
}

/* ---------------- Overview KPIs ---------------- */

export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const [daily, users, roles, posts, lessons, progress, logs] = await Promise.all([
      context.supabase.from("daily_stats").select("day, views, visitors").order("day", { ascending: false }).limit(30),
      context.supabase.from("user_stats").select("user_id, xp, lessons_completed, streak"),
      context.supabase.from("user_roles").select("role"),
      context.supabase.from("posts").select("id, status, views"),
      context.supabase.from("lessons").select("id, status"),
      context.supabase.from("lesson_progress").select("status, updated_at"),
      context.supabase.from("audit_logs").select("id, actor_name, action, entity, created_at").order("created_at", { ascending: false }).limit(8),
    ]);

    const d = (daily.data ?? []).slice().reverse();
    const us = users.data ?? [];
    const since = Date.now() - 7 * 864e5;
    return {
      series: d,
      kpis: {
        visitorsToday: d.at(-1)?.visitors ?? 0,
        viewsToday: d.at(-1)?.views ?? 0,
        views30: d.reduce((s, r) => s + r.views, 0),
        users: us.length,
        admins: (roles.data ?? []).filter((r) => r.role === "admin").length,
        editors: (roles.data ?? []).filter((r) => r.role === "editor").length,
        totalXp: us.reduce((s, u) => s + (u.xp ?? 0), 0),
        activeStreaks: us.filter((u) => (u.streak ?? 0) > 0).length,
        lessonsPublished: (lessons.data ?? []).filter((l) => l.status === "published").length,
        lessonsDraft: (lessons.data ?? []).filter((l) => l.status !== "published").length,
        postsPublished: (posts.data ?? []).filter((p) => p.status === "published").length,
        postsDraft: (posts.data ?? []).filter((p) => p.status !== "published").length,
        completions: (progress.data ?? []).filter((p) => p.status === "completed").length,
        activeLearners7d: (progress.data ?? []).filter((p) => new Date(p.updated_at).getTime() > since).length,
      },
      recent: logs.data ?? [],
    };
  });

/* ---------------- Audit logs ---------------- */

export const listAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("audit_logs")
      .select("id, actor_name, action, entity, entity_id, details, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/* ---------------- Notifications ---------------- */

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("admin_notifications")
      .select("id, kind, title, body, link, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const markNotificationRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid(), read: z.boolean().default(true) }).parse(i))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("admin_notifications").update({ is_read: data.read }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ---------------- Settings ---------------- */

export const getSettings = createServerFn({ method: "GET" }).handler(async () => {
  const db = publicClient();
  const { data } = await db.from("app_settings").select("key, value").eq("is_public", true);
  const out: Record<string, any> = {};
  for (const r of data ?? []) out[r.key] = r.value;
  return out;
});

export const saveSetting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ key: z.string().min(1).max(60), value: z.record(z.string(), z.any()) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("app_settings")
      .upsert({ key: data.key, value: data.value, is_public: true }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    await context.supabase.rpc("log_action", {
      _action: "update_settings",
      _entity: "app_settings",
      _entity_id: data.key,
      _details: data.value,
    });
    return { ok: true };
  });

/* ---------------- User admin actions ---------------- */

export const adminUserAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      userId: z.string().uuid(),
      action: z.enum(["ban", "unban", "reset_password", "rename"]),
      value: z.string().max(120).optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    if (data.userId === context.userId && (data.action === "ban"))
      throw new Error("لا يمكنك حظر حسابك.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.action === "rename") {
      const name = (data.value ?? "").trim();
      if (name.length < 2) throw new Error("الاسم قصير جدًا.");
      const { error } = await supabaseAdmin.from("profiles").update({ display_name: name }).eq("id", data.userId);
      if (error) throw new Error(error.message);
    } else if (data.action === "ban" || data.action === "unban") {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, {
        ban_duration: data.action === "ban" ? "876000h" : "none",
      });
      if (error) throw new Error(error.message);
    } else {
      const pwd = data.value ?? "";
      if (pwd.length < 8) throw new Error("كلمة السر يجب أن تكون 8 أحرف على الأقل.");
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: pwd });
      if (error) throw new Error(error.message);
    }

    await context.supabase.rpc("log_action", {
      _action: data.action,
      _entity: "user",
      _entity_id: data.userId,
      _details: {},
    });
    return { ok: true };
  });
