import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Every published lesson id that belongs to a course. */
async function courseLessonIds(db: ReturnType<typeof publicClient>, courseId: string) {
  const { data: chapters } = await db.from("chapters").select("id").eq("course_id", courseId);
  const chIds = (chapters ?? []).map((c) => c.id);
  if (!chIds.length) return [] as string[];
  const { data: units } = await db.from("units").select("id").in("chapter_id", chIds);
  const uIds = (units ?? []).map((u) => u.id);
  if (!uIds.length) return [] as string[];
  const { data: lessons } = await db.from("lessons").select("id").in("unit_id", uIds).eq("status", "published");
  return (lessons ?? []).map((l) => l.id);
}

export interface EnrollmentRow {
  id: string;
  course_id: string;
  course_slug: string;
  course_title: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  completed_at: string | null;
}

/** Enroll the signed-in user in a course (idempotent). */
export const enrollInCourse = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ courseId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("enrollments")
      .upsert({ user_id: userId, course_id: data.courseId }, { onConflict: "user_id,course_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** All courses the signed-in user joined, with live progress. */
export const myEnrollments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EnrollmentRow[]> => {
    const { supabase, userId } = context;
    const { data: rows } = await supabase
      .from("enrollments")
      .select("id, course_id, progress, completed_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!rows?.length) return [];

    const db = publicClient();
    const { data: courses } = await db
      .from("courses")
      .select("id, slug, title")
      .in("id", rows.map((r) => r.course_id));
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", userId)
      .eq("status", "completed");
    const doneIds = new Set((progress ?? []).map((p) => p.lesson_id));

    const out: EnrollmentRow[] = [];
    for (const r of rows) {
      const ids = await courseLessonIds(db, r.course_id);
      const done = ids.filter((id) => doneIds.has(id)).length;
      const course = (courses ?? []).find((c) => c.id === r.course_id);
      out.push({
        id: r.id,
        course_id: r.course_id,
        course_slug: course?.slug ?? "",
        course_title: course?.title ?? "",
        total_lessons: ids.length,
        completed_lessons: done,
        progress: ids.length ? Math.round((done / ids.length) * 100) : 0,
        completed_at: r.completed_at,
      });
    }
    return out;
  });

export interface CertificateRow {
  id: string; code: string; course_title: string; holder_name: string;
  score: number; issued_at: string;
}

/** Issue a certificate once every published lesson of the course is completed. */
export const issueCertificate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ courseId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }): Promise<CertificateRow> => {
    const { supabase, userId } = context;
    const db = publicClient();

    const { data: existing } = await supabase
      .from("certificates")
      .select("id, code, course_title, holder_name, score, issued_at")
      .eq("user_id", userId)
      .eq("course_id", data.courseId)
      .maybeSingle();
    if (existing) return existing as CertificateRow;

    const ids = await courseLessonIds(db, data.courseId);
    if (!ids.length) throw new Error("لا توجد دروس منشورة في هذه الدورة.");

    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id, accuracy")
      .eq("user_id", userId)
      .eq("status", "completed")
      .in("lesson_id", ids);
    const done = progress ?? [];
    if (done.length < ids.length) throw new Error("أكمل جميع دروس الدورة أولًا للحصول على الشهادة.");

    const score = Math.round(done.reduce((s, p) => s + Number(p.accuracy ?? 0), 0) / done.length);
    const { data: course } = await db.from("courses").select("title").eq("id", data.courseId).maybeSingle();
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", userId).maybeSingle();

    const code = `HNAI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { data: inserted, error } = await supabase
      .from("certificates")
      .insert({
        code,
        user_id: userId,
        course_id: data.courseId,
        course_title: course?.title ?? "",
        holder_name: profile?.display_name ?? "متعلّم HN-AI",
        score,
      })
      .select("id, code, course_title, holder_name, score, issued_at")
      .single();
    if (error) throw new Error(error.message);
    return inserted as CertificateRow;
  });

/** Certificates owned by the signed-in user. */
export const myCertificates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CertificateRow[]> => {
    const { data } = await context.supabase
      .from("certificates")
      .select("id, code, course_title, holder_name, score, issued_at")
      .eq("user_id", context.userId)
      .order("issued_at", { ascending: false });
    return (data ?? []) as CertificateRow[];
  });

/** Public certificate verification by code. */
export const verifyCertificate = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ code: z.string().min(4).max(64) }).parse(i))
  .handler(async ({ data }): Promise<CertificateRow | null> => {
    const db = publicClient();
    const { data: row } = await db
      .from("certificates")
      .select("id, code, course_title, holder_name, score, issued_at")
      .eq("code", data.code.toUpperCase())
      .maybeSingle();
    return (row ?? null) as CertificateRow | null;
  });

export interface SubmissionRow {
  id: string; project_slug: string; project_title: string;
  repo_url: string | null; demo_url: string | null; notes: string | null;
  status: string; score: number; review_notes: string | null; created_at: string;
}

/** Submit (or resubmit) a mini project for review. */
export const submitProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      projectSlug: z.string().min(1).max(120),
      projectTitle: z.string().min(1).max(200),
      repoUrl: z.string().url().max(500).optional().or(z.literal("")),
      demoUrl: z.string().url().max(500).optional().or(z.literal("")),
      notes: z.string().max(2000).optional(),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const payload = {
      user_id: userId,
      project_slug: data.projectSlug,
      project_title: data.projectTitle,
      repo_url: data.repoUrl || null,
      demo_url: data.demoUrl || null,
      notes: data.notes ?? null,
      status: "submitted",
    };
    const { data: existing } = await supabase
      .from("project_submissions")
      .select("id")
      .eq("user_id", userId)
      .eq("project_slug", data.projectSlug)
      .maybeSingle();

    const q = existing
      ? supabase.from("project_submissions").update(payload).eq("id", existing.id)
      : supabase.from("project_submissions").insert(payload);
    const { error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Project submissions belonging to the signed-in user. */
export const mySubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SubmissionRow[]> => {
    const { data } = await context.supabase
      .from("project_submissions")
      .select("id, project_slug, project_title, repo_url, demo_url, notes, status, score, review_notes, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return (data ?? []) as SubmissionRow[];
  });
