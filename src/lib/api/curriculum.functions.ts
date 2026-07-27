import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
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

export interface CurriculumLesson {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  duration_minutes: number;
  xp_reward: number;
  order_index: number;
}
export interface CurriculumUnit { id: string; title: string; order_index: number; lessons: CurriculumLesson[] }
export interface CurriculumChapter { id: string; title: string; order_index: number; units: CurriculumUnit[] }
export interface CurriculumCourse {
  id: string; slug: string; title: string; description: string | null;
  icon: string; color: string; difficulty: string; order_index: number; chapters: CurriculumChapter[];
}
export interface CurriculumLevel {
  id: string; level_number: number; title: string; description: string | null; order_index: number; courses: CurriculumCourse[];
}
export interface CurriculumProgram {
  id: string; slug: string; title: string; description: string | null; levels: CurriculumLevel[];
}

/** Full published curriculum tree (public, SSR-safe). */
export const getCurriculum = createServerFn({ method: "GET" }).handler(async (): Promise<CurriculumProgram[]> => {
  const db = publicClient();
  const [programs, levels, courses, chapters, units, lessons] = await Promise.all([
    db.from("programs").select("id, slug, title, description, order_index").eq("status", "published").order("order_index"),
    db.from("levels").select("id, program_id, level_number, title, description, order_index").eq("status", "published").order("order_index"),
    db.from("courses").select("id, level_id, slug, title, description, icon, color, difficulty, order_index").eq("status", "published").order("order_index"),
    db.from("chapters").select("id, course_id, title, order_index").eq("status", "published").order("order_index"),
    db.from("units").select("id, chapter_id, title, order_index").eq("status", "published").order("order_index"),
    db.from("lessons").select("id, unit_id, slug, title, summary, duration_minutes, xp_reward, order_index").eq("status", "published").order("order_index"),
  ]);

  const L = lessons.data ?? [];
  const U = (units.data ?? []).map((u) => ({ ...u, lessons: L.filter((l) => l.unit_id === u.id) }));
  const C = (chapters.data ?? []).map((c) => ({ ...c, units: U.filter((u) => u.chapter_id === c.id) }));
  const Co = (courses.data ?? []).map((c) => ({ ...c, chapters: C.filter((ch) => ch.course_id === c.id) }));
  const Lv = (levels.data ?? []).map((l) => ({ ...l, courses: Co.filter((c) => c.level_id === l.id) }));
  return (programs.data ?? []).map((p) => ({ ...p, levels: Lv.filter((l) => l.program_id === p.id) })) as CurriculumProgram[];
});

export interface LessonBlock { id: string; kind: string; content: string; language: string | null; order_index: number }
export interface LessonQuestion {
  id: string; prompt: string; explanation: string | null; xp: number; order_index: number;
  options: { id: string; label: string; order_index: number }[];
}
export interface LessonDetail {
  id: string; slug: string; title: string; summary: string | null;
  duration_minutes: number; xp_reward: number;
  blocks: LessonBlock[]; questions: LessonQuestion[];
  next_slug: string | null;
}

/** One published lesson with its reading blocks and questions (answers stripped). */
export const getLesson = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ slug: z.string().min(1) }).parse(i))
  .handler(async ({ data }): Promise<LessonDetail | null> => {
    const db = publicClient();
    const { data: lesson } = await db
      .from("lessons")
      .select("id, unit_id, slug, title, summary, duration_minutes, xp_reward, order_index")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!lesson) return null;

    const [blocks, questions, siblings] = await Promise.all([
      db.from("lesson_blocks").select("id, kind, content, language, order_index").eq("lesson_id", lesson.id).order("order_index"),
      db.from("questions").select("id, prompt, explanation, xp, order_index").eq("lesson_id", lesson.id).order("order_index"),
      db.from("lessons").select("slug, order_index").eq("unit_id", lesson.unit_id).eq("status", "published").order("order_index"),
    ]);

    const qIds = (questions.data ?? []).map((q) => q.id);
    const options = qIds.length
      ? (await db.from("question_options").select("id, question_id, label, order_index").in("question_id", qIds).order("order_index")).data ?? []
      : [];

    const next = (siblings.data ?? []).find((s) => s.order_index > lesson.order_index)?.slug ?? null;

    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary,
      duration_minutes: lesson.duration_minutes,
      xp_reward: lesson.xp_reward,
      blocks: blocks.data ?? [],
      questions: (questions.data ?? []).map((q) => ({
        ...q,
        options: options.filter((o) => o.question_id === q.id).map(({ id, label, order_index }) => ({ id, label, order_index })),
      })),
      next_slug: next,
    };
  });
