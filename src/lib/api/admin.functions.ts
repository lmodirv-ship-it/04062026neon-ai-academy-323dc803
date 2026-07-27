import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { publicClient } from "./public-client.server";

export interface LeaderRow {
  user_id: string; display_name: string; avatar_url: string | null;
  xp: number; streak: number; lessons_completed: number;
}

/** Public leaderboard built from real user stats. */
export const getLeaderboard = createServerFn({ method: "GET" }).handler(async (): Promise<LeaderRow[]> => {
  const db = publicClient();
  const { data: stats } = await db
    .from("user_stats")
    .select("user_id, xp, streak, lessons_completed")
    .order("xp", { ascending: false })
    .limit(50);
  const ids = (stats ?? []).map((s) => s.user_id);
  const { data: profiles } = ids.length
    ? await db.from("profiles").select("id, display_name, avatar_url").in("id", ids)
    : { data: [] as { id: string; display_name: string | null; avatar_url: string | null }[] };

  return (stats ?? []).map((s) => {
    const p = (profiles ?? []).find((x) => x.id === s.user_id);
    return {
      user_id: s.user_id,
      display_name: p?.display_name ?? "متعلّم",
      avatar_url: p?.avatar_url ?? null,
      xp: s.xp,
      streak: s.streak,
      lessons_completed: s.lessons_completed,
    };
  });
});

/** All users with roles and stats — admins only. */
export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("صلاحية المدير مطلوبة.");

    const [profiles, stats, roles] = await Promise.all([
      context.supabase.from("profiles").select("id, display_name, avatar_url, created_at").order("created_at", { ascending: false }),
      context.supabase.from("user_stats").select("user_id, xp, streak, lessons_completed, correct_answers, total_answers"),
      context.supabase.from("user_roles").select("user_id, role"),
    ]);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const authUsers = authList?.users ?? [];

    return (profiles.data ?? []).map((p) => {
      const s = (stats.data ?? []).find((x) => x.user_id === p.id);
      const rs = (roles.data ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as string);
      const au = authUsers.find((u) => u.id === p.id);
      return {
        id: p.id,
        display_name: p.display_name ?? "—",
        email: au?.email ?? "—",
        banned: Boolean((au as { banned_until?: string } | undefined)?.banned_until && new Date((au as any).banned_until) > new Date()),
        last_sign_in_at: au?.last_sign_in_at ?? null,
        avatar_url: p.avatar_url,
        created_at: p.created_at,
        xp: s?.xp ?? 0,
        streak: s?.streak ?? 0,
        lessons_completed: s?.lessons_completed ?? 0,
        accuracy: s && s.total_answers > 0 ? Math.round((s.correct_answers / s.total_answers) * 100) : 0,
        role: rs.includes("admin") ? "admin" : rs.includes("editor") ? "editor" : "student",
      };
    });
  });


/** Change a user's role — admins only. */
export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ userId: z.string().uuid(), role: z.enum(["admin", "editor", "student"]) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("صلاحية المدير مطلوبة.");

    await context.supabase.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await context.supabase.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
