import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const TABLES = ["programs", "levels", "courses", "chapters", "units", "lessons"] as const;
type TableName = (typeof TABLES)[number];

async function assertEditor(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("can_edit_content", { _user_id: context.userId });
  if (error || !data) throw new Error("ليست لديك صلاحية تحرير المحتوى.");
}

/** Whole content tree including drafts — editors/admins only. */
export const getStudioTree = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertEditor(context as any);
    const db = context.supabase;
    const [programs, levels, courses, chapters, units, lessons] = await Promise.all([
      db.from("programs").select("*").order("order_index"),
      db.from("levels").select("*").order("order_index"),
      db.from("courses").select("*").order("order_index"),
      db.from("chapters").select("*").order("order_index"),
      db.from("units").select("*").order("order_index"),
      db.from("lessons").select("*").order("order_index"),
    ]);
    return {
      programs: programs.data ?? [],
      levels: levels.data ?? [],
      courses: courses.data ?? [],
      chapters: chapters.data ?? [],
      units: units.data ?? [],
      lessons: lessons.data ?? [],
    };
  });

const NodeInput = z.object({
  table: z.enum(TABLES),
  values: z.record(z.string(), z.any()),
});

export const upsertNode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => NodeInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertEditor(context as any);
    const { data: row, error } = await context.supabase
      .from(data.table as TableName)
      .upsert(data.values as any)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteNode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ table: z.enum(TABLES), id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertEditor(context as any);
    const { error } = await context.supabase.from(data.table as TableName).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const LessonContent = z.object({
  lessonId: z.string().uuid(),
  blocks: z.array(z.object({ kind: z.string(), content: z.string(), language: z.string().nullable().optional() })),
  questions: z.array(
    z.object({
      prompt: z.string(),
      explanation: z.string().nullable().optional(),
      xp: z.number().int().min(1).max(200).default(10),
      options: z.array(z.object({ label: z.string(), is_correct: z.boolean() })).min(2).max(6),
    }),
  ),
});

/** Replace a lesson's reading blocks and questions in one shot. */
export const saveLessonContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => LessonContent.parse(i))
  .handler(async ({ data, context }) => {
    await assertEditor(context as any);
    const db = context.supabase;
    await db.from("lesson_blocks").delete().eq("lesson_id", data.lessonId);
    await db.from("questions").delete().eq("lesson_id", data.lessonId);

    if (data.blocks.length) {
      const { error } = await db.from("lesson_blocks").insert(
        data.blocks.map((b, idx) => ({
          lesson_id: data.lessonId,
          kind: b.kind,
          content: b.content,
          language: b.language ?? null,
          order_index: idx,
        })),
      );
      if (error) throw new Error(error.message);
    }

    for (const [idx, q] of data.questions.entries()) {
      const { data: created, error } = await db
        .from("questions")
        .insert({
          lesson_id: data.lessonId,
          kind: "mcq",
          prompt: q.prompt,
          explanation: q.explanation ?? null,
          xp: q.xp,
          order_index: idx,
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      const { error: optErr } = await db.from("question_options").insert(
        q.options.map((o, oi) => ({
          question_id: created.id,
          label: o.label,
          is_correct: o.is_correct,
          order_index: oi,
        })),
      );
      if (optErr) throw new Error(optErr.message);
    }
    return { ok: true, blocks: data.blocks.length, questions: data.questions.length };
  });

/** Full lesson content for the editor (drafts included). */
export const getLessonForEdit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ lessonId: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertEditor(context as any);
    const db = context.supabase;
    const [blocks, questions] = await Promise.all([
      db.from("lesson_blocks").select("*").eq("lesson_id", data.lessonId).order("order_index"),
      db.from("questions").select("*").eq("lesson_id", data.lessonId).order("order_index"),
    ]);
    const ids = (questions.data ?? []).map((q: any) => q.id);
    const options = ids.length
      ? (await db.from("question_options").select("*").in("question_id", ids).order("order_index")).data ?? []
      : [];
    return {
      blocks: blocks.data ?? [],
      questions: (questions.data ?? []).map((q: any) => ({
        ...q,
        options: options.filter((o: any) => o.question_id === q.id),
      })),
    };
  });

const AIInput = z.object({
  topic: z.string().min(3).max(300),
  level: z.string().min(2).max(40).default("Beginner"),
  language: z.enum(["ar", "en"]).default("ar"),
});

const AI_SYSTEM = `You are HN-AI's curriculum author. Produce ONE micro-lesson (10 minutes) about the requested topic.
Return STRICT JSON only, no markdown fences, with this exact shape:
{"title":string,"summary":string,"duration_minutes":number,"xp_reward":number,
 "blocks":[{"kind":"text"|"code"|"note","content":string,"language":string|null}],
 "questions":[{"prompt":string,"explanation":string,"xp":number,
   "options":[{"label":string,"is_correct":boolean}]}]}
Rules: 4-7 blocks, short readable paragraphs. 3-5 questions, each with exactly 4 options and exactly one correct.
Write everything in the requested language.`;

/** Draft a full lesson with Gemini Flash (uses the dedicated lesson-generation key). */
export const generateLessonDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => AIInput.parse(i))
  .handler(async ({ data, context }) => {
    await assertEditor(context as any);
    const apiKey = process.env.geminiflash ?? process.env.gemini ?? process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing Gemini Flash API key");

    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: AI_SYSTEM }] },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Topic: ${data.topic}\nLearner level: ${data.level}\nLanguage: ${data.language === "ar" ? "Arabic" : "English"}`,
                },
              ],
            },
          ],
          generationConfig: { temperature: 0.8, maxOutputTokens: 4096, responseMimeType: "application/json" },
        }),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("تم تجاوز حد الاستخدام مؤقتًا. حاول بعد قليل.");
      throw new Error(`Gemini request failed [${res.status}]: ${body.slice(0, 300)}`);
    }

    const json = (await res.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const raw = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
    const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try {
      return JSON.parse(cleaned) as {
        title: string;
        summary: string;
        duration_minutes: number;
        xp_reward: number;
        blocks: { kind: string; content: string; language: string | null }[];
        questions: { prompt: string; explanation: string; xp: number; options: { label: string; is_correct: boolean }[] }[];
      };
    } catch {
      throw new Error("تعذّر تحليل رد النموذج. أعد المحاولة.");
    }
  });
