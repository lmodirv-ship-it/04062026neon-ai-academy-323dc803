import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const MODEL_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

async function assertEditor(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("can_edit_content", { _user_id: context.userId });
  if (error || !data) throw new Error("ليست لديك صلاحية تحرير المحتوى.");
}

async function callGemini(system: string, user: string) {
  const apiKey = process.env.geminiflash ?? process.env.gemini ?? process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("مفتاح Gemini غير متوفر.");

  const res = await fetch(MODEL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("تم تجاوز حد الاستخدام مؤقتًا. حاول بعد قليل.");
    throw new Error(`فشل طلب النموذج [${res.status}]: ${body.slice(0, 300)}`);
  }

  const json = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const raw = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
  return raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
}

/** Call the model, parse + validate; one automatic retry on failure. */
async function generateJson<T>(system: string, user: string, schema: z.ZodType<T>): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const text = await callGemini(
        system,
        attempt === 0 ? user : `${user}\n\nIMPORTANT: your previous answer was invalid JSON or broke the rules. Follow the schema exactly.`,
      );
      return schema.parse(JSON.parse(text));
    } catch (e) {
      lastErr = e;
      if (e instanceof Error && e.message.includes("حد الاستخدام")) throw e;
    }
  }
  throw new Error(`تعذّر توليد محتوى صالح: ${(lastErr as Error)?.message ?? "خطأ غير معروف"}`);
}

const slugify = (s: string, fallback: string) => {
  const base = s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || fallback;
};

/* ------------------------------------------------------------------ */
/* 1) Curriculum outline                                               */
/* ------------------------------------------------------------------ */

const OutlineSchema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().default(""),
  icon: z.string().default("Sparkles"),
  color: z.string().default("neon-purple"),
  difficulty: z.string().default("Beginner"),
  chapters: z
    .array(
      z.object({
        title: z.string().min(2),
        description: z.string().default(""),
        units: z
          .array(
            z.object({
              title: z.string().min(2),
              description: z.string().default(""),
              lessons: z
                .array(
                  z.object({
                    title: z.string().min(2),
                    summary: z.string().default(""),
                    duration_minutes: z.number().int().min(3).max(60).default(10),
                    xp_reward: z.number().int().min(5).max(500).default(50),
                  }),
                )
                .min(1),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});

export type CourseOutline = z.infer<typeof OutlineSchema>;

const OUTLINE_SYSTEM = `You are HN-AI's head of curriculum. Design a structured micro-learning course
(each lesson is a 10-minute daily session). Return STRICT JSON only, no markdown fences, exactly:
{"title":string,"slug":string,"description":string,"icon":string,"color":string,"difficulty":string,
 "chapters":[{"title":string,"description":string,
   "units":[{"title":string,"description":string,
     "lessons":[{"title":string,"summary":string,"duration_minutes":number,"xp_reward":number}]}]}]}
Rules: slug is lowercase english-kebab-case. icon is one lucide icon name. color is one of
neon-purple, neon-blue, neon-cyan, neon-pink, gold. Lesson titles must be unique, concrete and progressive
(no "Lesson 1"). Write title/description/summary in the requested language.`;

export const generateCourseOutline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        topic: z.string().min(3).max(300),
        level: z.string().min(2).max(40).default("Beginner"),
        language: z.enum(["ar", "en"]).default("ar"),
        chapters: z.number().int().min(1).max(8).default(3),
        unitsPerChapter: z.number().int().min(1).max(6).default(2),
        lessonsPerUnit: z.number().int().min(1).max(8).default(4),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertEditor(context as any);
    const outline = await generateJson(
      OUTLINE_SYSTEM,
      `Topic: ${data.topic}
Learner level: ${data.level}
Language: ${data.language === "ar" ? "Arabic" : "English"}
Produce exactly ${data.chapters} chapters, ${data.unitsPerChapter} units per chapter, ${data.lessonsPerUnit} lessons per unit.`,
      OutlineSchema,
    );
    return outline;
  });

/* ------------------------------------------------------------------ */
/* 2) Persist the outline as drafts                                    */
/* ------------------------------------------------------------------ */

export const saveCourseOutline = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ levelId: z.string().uuid(), outline: OutlineSchema }).parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertEditor(context as any);
    const db = context.supabase;
    const o = data.outline;

    const { data: siblings } = await db
      .from("courses")
      .select("order_index, slug")
      .eq("level_id", data.levelId);
    const nextIndex = (siblings ?? []).reduce((m: number, r: any) => Math.max(m, r.order_index + 1), 0);

    let slug = slugify(o.slug || o.title, `course-${Date.now()}`);
    const { data: taken } = await db.from("courses").select("slug").eq("slug", slug).maybeSingle();
    if (taken) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

    const { data: course, error: cErr } = await db
      .from("courses")
      .insert({
        level_id: data.levelId,
        slug,
        title: o.title,
        description: o.description,
        icon: o.icon,
        color: o.color,
        difficulty: o.difficulty,
        order_index: nextIndex,
        status: "draft",
      })
      .select("id, slug, title")
      .single();
    if (cErr) throw new Error(cErr.message);

    const seen = new Set<string>();
    let lessonCount = 0;
    const lessonIds: string[] = [];

    for (const [ci, ch] of o.chapters.entries()) {
      const { data: chapter, error: chErr } = await db
        .from("chapters")
        .insert({
          course_id: course.id,
          title: ch.title,
          description: ch.description,
          order_index: ci,
          status: "draft",
        })
        .select("id")
        .single();
      if (chErr) throw new Error(chErr.message);

      for (const [ui, un] of ch.units.entries()) {
        const { data: unit, error: uErr } = await db
          .from("units")
          .insert({
            chapter_id: chapter.id,
            title: un.title,
            description: un.description,
            order_index: ui,
            status: "draft",
          })
          .select("id")
          .single();
        if (uErr) throw new Error(uErr.message);

        const rows = un.lessons
          .filter((l) => {
            const key = l.title.trim().toLowerCase();
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          })
          .map((l, li) => ({
            unit_id: unit.id,
            slug: `${slug}-${slugify(l.title, `l${ci}${ui}${li}`)}`.slice(0, 90),
            title: l.title,
            summary: l.summary,
            duration_minutes: l.duration_minutes,
            xp_reward: l.xp_reward,
            order_index: li,
            status: "draft",
          }));

        if (rows.length) {
          const { data: created, error: lErr } = await db.from("lessons").insert(rows).select("id");
          if (lErr) throw new Error(lErr.message);
          lessonCount += created.length;
          lessonIds.push(...created.map((r: any) => r.id));
        }
      }
    }

    await db.rpc("log_action", {
      _action: "generate_outline",
      _entity: "courses",
      _entity_id: course.id,
      _details: { title: course.title, lessons: lessonCount },
    });

    return { courseId: course.id, slug: course.slug, title: course.title, lessons: lessonCount, lessonIds };
  });

/* ------------------------------------------------------------------ */
/* 3) Lesson content generation                                        */
/* ------------------------------------------------------------------ */

const LessonSchema = z.object({
  blocks: z
    .array(
      z.object({
        kind: z.enum(["text", "code", "note"]).catch("text"),
        content: z.string().min(1),
        language: z.string().nullable().optional(),
      }),
    )
    .min(3)
    .max(10),
  questions: z
    .array(
      z.object({
        prompt: z.string().min(3),
        explanation: z.string().default(""),
        xp: z.number().int().min(1).max(100).default(10),
        options: z
          .array(z.object({ label: z.string().min(1), is_correct: z.boolean() }))
          .length(4)
          .refine((opts) => opts.filter((o) => o.is_correct).length === 1, {
            message: "exactly one correct option required",
          }),
      }),
    )
    .min(3)
    .max(5),
});

const LESSON_SYSTEM = `You are HN-AI's curriculum author. Write ONE micro-lesson (10 minutes).
Return STRICT JSON only, no markdown fences, exactly:
{"blocks":[{"kind":"text"|"code"|"note","content":string,"language":string|null}],
 "questions":[{"prompt":string,"explanation":string,"xp":number,
   "options":[{"label":string,"is_correct":boolean}]}]}
Rules: 4-7 blocks, short readable paragraphs, at least one concrete example.
Exactly 3-5 questions, each with exactly 4 options and exactly ONE correct option.
Do not repeat material covered by the sibling lessons listed by the user.
Write everything in the requested language.`;

/** Generate a lesson's blocks + questions with full curriculum context, then save them. */
export const generateLessonContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        lessonId: z.string().uuid(),
        language: z.enum(["ar", "en"]).default("ar"),
        overwrite: z.boolean().default(true),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertEditor(context as any);
    const db = context.supabase;

    const { data: lesson, error } = await db
      .from("lessons")
      .select("id, title, summary, unit_id, units(title, chapter_id, chapters(title, course_id, courses(title, difficulty)))")
      .eq("id", data.lessonId)
      .single();
    if (error || !lesson) throw new Error("الدرس غير موجود.");

    if (!data.overwrite) {
      const { count } = await db
        .from("lesson_blocks")
        .select("id", { count: "exact", head: true })
        .eq("lesson_id", data.lessonId);
      if ((count ?? 0) > 0) return { ok: true, skipped: true, blocks: 0, questions: 0 };
    }

    const unit: any = (lesson as any).units;
    const chapter: any = unit?.chapters;
    const course: any = chapter?.courses;

    const { data: siblings } = await db
      .from("lessons")
      .select("title")
      .eq("unit_id", (lesson as any).unit_id)
      .neq("id", data.lessonId)
      .order("order_index");

    const content = await generateJson(
      LESSON_SYSTEM,
      `Course: ${course?.title ?? "-"} (${course?.difficulty ?? "Beginner"})
Chapter: ${chapter?.title ?? "-"}
Unit: ${unit?.title ?? "-"}
Lesson title: ${(lesson as any).title}
Lesson summary: ${(lesson as any).summary ?? "-"}
Sibling lessons (do not duplicate): ${(siblings ?? []).map((s: any) => s.title).join(" | ") || "none"}
Language: ${data.language === "ar" ? "Arabic" : "English"}`,
      LessonSchema,
    );

    await db.from("lesson_blocks").delete().eq("lesson_id", data.lessonId);
    await db.from("questions").delete().eq("lesson_id", data.lessonId);

    const { error: bErr } = await db.from("lesson_blocks").insert(
      content.blocks.map((b, idx) => ({
        lesson_id: data.lessonId,
        kind: b.kind,
        content: b.content,
        language: b.language ?? null,
        order_index: idx,
      })),
    );
    if (bErr) throw new Error(bErr.message);

    for (const [idx, q] of content.questions.entries()) {
      const { data: created, error: qErr } = await db
        .from("questions")
        .insert({
          lesson_id: data.lessonId,
          kind: "mcq",
          prompt: q.prompt,
          explanation: q.explanation,
          xp: q.xp,
          order_index: idx,
        })
        .select("id")
        .single();
      if (qErr) throw new Error(qErr.message);
      const { error: oErr } = await db.from("question_options").insert(
        q.options.map((o, oi) => ({
          question_id: created.id,
          label: o.label,
          is_correct: o.is_correct,
          order_index: oi,
        })),
      );
      if (oErr) throw new Error(oErr.message);
    }

    await db.rpc("log_action", {
      _action: "generate_lesson",
      _entity: "lessons",
      _entity_id: data.lessonId,
      _details: { blocks: content.blocks.length, questions: content.questions.length },
    });

    return { ok: true, skipped: false, blocks: content.blocks.length, questions: content.questions.length };
  });

/* ------------------------------------------------------------------ */
/* 4) Queue + publishing helpers                                       */
/* ------------------------------------------------------------------ */

/** Lessons of a course with a completeness indicator, ordered for the generation queue. */
export const getCourseQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ courseId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertEditor(context as any);
    const db = context.supabase;

    const { data: chapters } = await db
      .from("chapters")
      .select("id, title, order_index")
      .eq("course_id", data.courseId)
      .order("order_index");
    const chapterIds = (chapters ?? []).map((c: any) => c.id);
    const { data: units } = chapterIds.length
      ? await db.from("units").select("id, title, chapter_id, order_index").in("chapter_id", chapterIds).order("order_index")
      : { data: [] as any[] };
    const unitIds = (units ?? []).map((u: any) => u.id);
    const { data: lessons } = unitIds.length
      ? await db.from("lessons").select("id, title, unit_id, status, order_index").in("unit_id", unitIds).order("order_index")
      : { data: [] as any[] };
    const lessonIds = (lessons ?? []).map((l: any) => l.id);
    const { data: blocks } = lessonIds.length
      ? await db.from("lesson_blocks").select("lesson_id").in("lesson_id", lessonIds)
      : { data: [] as any[] };
    const { data: questions } = lessonIds.length
      ? await db.from("questions").select("lesson_id").in("lesson_id", lessonIds)
      : { data: [] as any[] };

    const unitById = new Map((units ?? []).map((u: any) => [u.id, u]));
    const chapterById = new Map((chapters ?? []).map((c: any) => [c.id, c]));

    return (lessons ?? []).map((l: any) => {
      const u = unitById.get(l.unit_id);
      const c = u ? chapterById.get(u.chapter_id) : null;
      return {
        id: l.id,
        title: l.title,
        status: l.status,
        unitTitle: (u as any)?.title ?? "",
        chapterTitle: (c as any)?.title ?? "",
        blocks: (blocks ?? []).filter((b: any) => b.lesson_id === l.id).length,
        questions: (questions ?? []).filter((q: any) => q.lesson_id === l.id).length,
      };
    });
  });

/** Publish (or unpublish) a whole subtree of the curriculum. */
export const setSubtreeStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z
      .object({
        table: z.enum(["courses", "chapters", "units", "lessons"]),
        id: z.string().uuid(),
        status: z.enum(["draft", "published"]),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertEditor(context as any);
    const db = context.supabase;
    const status = data.status;

    const setLessons = async (unitIds: string[]) => {
      if (unitIds.length) await db.from("lessons").update({ status }).in("unit_id", unitIds);
    };
    const setUnits = async (chapterIds: string[]) => {
      if (!chapterIds.length) return;
      await db.from("units").update({ status }).in("chapter_id", chapterIds);
      const { data: units } = await db.from("units").select("id").in("chapter_id", chapterIds);
      await setLessons((units ?? []).map((u: any) => u.id));
    };

    if (data.table === "lessons") {
      await db.from("lessons").update({ status }).eq("id", data.id);
    } else if (data.table === "units") {
      await db.from("units").update({ status }).eq("id", data.id);
      await setLessons([data.id]);
    } else if (data.table === "chapters") {
      await db.from("chapters").update({ status }).eq("id", data.id);
      await setUnits([data.id]);
    } else {
      await db.from("courses").update({ status }).eq("id", data.id);
      await db.from("chapters").update({ status }).eq("course_id", data.id);
      const { data: chapters } = await db.from("chapters").select("id").eq("course_id", data.id);
      await setUnits((chapters ?? []).map((c: any) => c.id));
    }

    await db.rpc("log_action", {
      _action: status === "published" ? "publish_subtree" : "unpublish_subtree",
      _entity: data.table,
      _entity_id: data.id,
      _details: {},
    });

    return { ok: true };
  });

/** Levels available as parents for a generated course. */
export const getGeneratorTargets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertEditor(context as any);
    const db = context.supabase;
    const [{ data: programs }, { data: levels }, { data: courses }] = await Promise.all([
      db.from("programs").select("id, title").order("order_index"),
      db.from("levels").select("id, title, program_id, level_number").order("order_index"),
      db.from("courses").select("id, title, level_id, status").order("order_index"),
    ]);
    return {
      programs: programs ?? [],
      levels: levels ?? [],
      courses: courses ?? [],
    };
  });
