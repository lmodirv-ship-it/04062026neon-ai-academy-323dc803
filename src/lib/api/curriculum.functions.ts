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

export interface LessonBlockMeta {
  url?: string;
  poster?: string;
  caption?: string;
  duration?: number;
}
export interface LessonBlock {
  id: string;
  kind: string;
  content: string;
  language: string | null;
  order_index: number;
  meta: LessonBlockMeta;
}
export interface LessonQuestion {
  id: string; prompt: string; explanation: string | null; xp: number; order_index: number;
  options: { id: string; label: string; order_index: number }[];
}
export interface LessonDetail {
  id: string; slug: string; title: string; summary: string | null;
  duration_minutes: number; xp_reward: number;
  blocks: LessonBlock[]; questions: LessonQuestion[];
  next_slug: string | null;
  next_title: string | null;
  prev_slug: string | null;
  unit_title: string | null;
  course_title: string | null;
  course_slug: string | null;
  course_id: string | null;
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

    const [blocks, questions, siblings, unit] = await Promise.all([
      db.from("lesson_blocks").select("id, kind, content, language, order_index, meta").eq("lesson_id", lesson.id).order("order_index"),
      db.from("questions").select("id, prompt, explanation, xp, order_index").eq("lesson_id", lesson.id).order("order_index"),
      db.from("lessons").select("slug, title, order_index").eq("unit_id", lesson.unit_id).eq("status", "published").order("order_index"),
      db.from("units").select("id, title, chapter_id").eq("id", lesson.unit_id).maybeSingle(),
    ]);

    let courseTitle: string | null = null;
    let courseSlug: string | null = null;
    let courseId: string | null = null;
    if (unit.data?.chapter_id) {
      const { data: chapter } = await db.from("chapters").select("course_id").eq("id", unit.data.chapter_id).maybeSingle();
      if (chapter?.course_id) {
        const { data: course } = await db.from("courses").select("id, slug, title").eq("id", chapter.course_id).maybeSingle();
        courseTitle = course?.title ?? null;
        courseSlug = course?.slug ?? null;
        courseId = course?.id ?? null;
      }
    }

    const qIds = (questions.data ?? []).map((q) => q.id);
    const options = qIds.length
      ? (await db.from("question_options").select("id, question_id, label, order_index").in("question_id", qIds).order("order_index")).data ?? []
      : [];

    const ordered = siblings.data ?? [];
    const next = ordered.find((s) => s.order_index > lesson.order_index) ?? null;
    const prev = [...ordered].reverse().find((s) => s.order_index < lesson.order_index) ?? null;

    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title,
      summary: lesson.summary,
      duration_minutes: lesson.duration_minutes,
      xp_reward: lesson.xp_reward,
      blocks: (blocks.data ?? []).map((b) => ({ ...b, meta: (b.meta ?? {}) as LessonBlockMeta })),
      questions: (questions.data ?? []).map((q) => ({
        ...q,
        options: options.filter((o) => o.question_id === q.id).map(({ id, label, order_index }) => ({ id, label, order_index })),
      })),
      next_slug: next?.slug ?? null,
      next_title: next?.title ?? null,
      prev_slug: prev?.slug ?? null,
      unit_title: unit.data?.title ?? null,
      course_title: courseTitle,
      course_slug: courseSlug,
      course_id: courseId,
    };
  });

export interface CourseCard {
  id: string; slug: string; title: string; description: string | null;
  icon: string; color: string; difficulty: string;
  level_title: string | null; lessons_count: number; minutes: number;
}

/** Public catalogue of published courses with lesson counts. */
export const listCourses = createServerFn({ method: "GET" }).handler(async (): Promise<CourseCard[]> => {
  const db = publicClient();
  const [courses, levels, chapters, units, lessons] = await Promise.all([
    db.from("courses").select("id, level_id, slug, title, description, icon, color, difficulty, order_index").eq("status", "published").order("order_index"),
    db.from("levels").select("id, title").eq("status", "published"),
    db.from("chapters").select("id, course_id").eq("status", "published"),
    db.from("units").select("id, chapter_id").eq("status", "published"),
    db.from("lessons").select("id, unit_id, duration_minutes").eq("status", "published"),
  ]);
  const U = units.data ?? [];
  const C = chapters.data ?? [];
  const L = lessons.data ?? [];
  return (courses.data ?? []).map((c) => {
    const chIds = C.filter((ch) => ch.course_id === c.id).map((ch) => ch.id);
    const uIds = U.filter((u) => chIds.includes(u.chapter_id)).map((u) => u.id);
    const ls = L.filter((l) => uIds.includes(l.unit_id));
    return {
      id: c.id, slug: c.slug, title: c.title, description: c.description,
      icon: c.icon, color: c.color, difficulty: c.difficulty,
      level_title: (levels.data ?? []).find((lv) => lv.id === c.level_id)?.title ?? null,
      lessons_count: ls.length,
      minutes: ls.reduce((s, l) => s + (l.duration_minutes ?? 0), 0),
    };
  });
});

export interface CourseDetail extends CourseCard {
  chapters: { id: string; title: string; units: { id: string; title: string; lessons: CurriculumLesson[] }[] }[];
}

/** One published course with its full chapter/unit/lesson tree. */
export const getCourse = createServerFn({ method: "GET" })
  .inputValidator((i: unknown) => z.object({ slug: z.string().min(1) }).parse(i))
  .handler(async ({ data }): Promise<CourseDetail | null> => {
    const db = publicClient();
    const { data: course } = await db
      .from("courses")
      .select("id, level_id, slug, title, description, icon, color, difficulty")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (!course) return null;

    const { data: chapters } = await db
      .from("chapters").select("id, title, order_index").eq("course_id", course.id).eq("status", "published").order("order_index");
    const chIds = (chapters ?? []).map((c) => c.id);
    const units = chIds.length
      ? (await db.from("units").select("id, chapter_id, title, order_index").in("chapter_id", chIds).eq("status", "published").order("order_index")).data ?? []
      : [];
    const uIds = units.map((u) => u.id);
    const lessons = uIds.length
      ? (await db.from("lessons").select("id, unit_id, slug, title, summary, duration_minutes, xp_reward, order_index").in("unit_id", uIds).eq("status", "published").order("order_index")).data ?? []
      : [];
    const { data: level } = await db.from("levels").select("title").eq("id", course.level_id).maybeSingle();

    return {
      id: course.id, slug: course.slug, title: course.title, description: course.description,
      icon: course.icon, color: course.color, difficulty: course.difficulty,
      level_title: level?.title ?? null,
      lessons_count: lessons.length,
      minutes: lessons.reduce((s, l) => s + (l.duration_minutes ?? 0), 0),
      chapters: (chapters ?? []).map((ch) => ({
        id: ch.id,
        title: ch.title,
        units: units.filter((u) => u.chapter_id === ch.id).map((u) => ({
          id: u.id,
          title: u.title,
          lessons: lessons.filter((l) => l.unit_id === u.id) as CurriculumLesson[],
        })),
      })),
    };
  });

