import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/** Grade one answer server-side and record the attempt. */
export const answerQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ questionId: z.string().uuid(), optionId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: q } = await supabase
      .from("questions")
      .select("id, explanation, xp")
      .eq("id", data.questionId)
      .maybeSingle();
    if (!q) throw new Error("Question not found");

    const { data: opt } = await supabase
      .from("question_options")
      .select("id, is_correct")
      .eq("id", data.optionId)
      .eq("question_id", data.questionId)
      .maybeSingle();
    if (!opt) throw new Error("Invalid option");

    await supabase.from("question_attempts").insert({
      user_id: userId,
      question_id: q.id,
      option_id: opt.id,
      is_correct: opt.is_correct,
    });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: stats } = await supabaseAdmin
      .from("user_stats")
      .select("correct_answers, total_answers")
      .eq("user_id", userId)
      .maybeSingle();
    await supabaseAdmin.from("user_stats").upsert({
      user_id: userId,
      correct_answers: (stats?.correct_answers ?? 0) + (opt.is_correct ? 1 : 0),
      total_answers: (stats?.total_answers ?? 0) + 1,
    });

    return { correct: opt.is_correct, explanation: q.explanation, xp: opt.is_correct ? q.xp : 0 };
  });

/** Finish a lesson: store progress, award XP, update the daily streak. */
export const completeLesson = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({
      lessonId: z.string().uuid(),
      correct: z.number().int().min(0),
      total: z.number().int().min(0),
    }).parse(i),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: lesson } = await supabase
      .from("lessons")
      .select("id, xp_reward")
      .eq("id", data.lessonId)
      .maybeSingle();
    if (!lesson) throw new Error("Lesson not found");

    const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 100;
    const earned = Math.max(10, Math.round((lesson.xp_reward * accuracy) / 100));

    const { data: prev } = await supabase
      .from("lesson_progress")
      .select("id, status, attempts")
      .eq("user_id", userId)
      .eq("lesson_id", lesson.id)
      .maybeSingle();
    const firstCompletion = prev?.status !== "completed";

    await supabase.from("lesson_progress").upsert(
      {
        user_id: userId,
        lesson_id: lesson.id,
        status: "completed",
        score: earned,
        accuracy,
        attempts: (prev?.attempts ?? 0) + 1,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: stats } = await supabaseAdmin
      .from("user_stats")
      .select("xp, streak, best_streak, last_active_date, lessons_completed")
      .eq("user_id", userId)
      .maybeSingle();

    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const last = stats?.last_active_date ?? null;
    const streak = last === today ? (stats?.streak ?? 1) : last === yesterday ? (stats?.streak ?? 0) + 1 : 1;
    const xp = (stats?.xp ?? 0) + (firstCompletion ? earned : Math.round(earned / 4));

    await supabaseAdmin.from("user_stats").upsert({
      user_id: userId,
      xp,
      streak,
      best_streak: Math.max(streak, stats?.best_streak ?? 0),
      last_active_date: today,
      lessons_completed: (stats?.lessons_completed ?? 0) + (firstCompletion ? 1 : 0),
    });

    return { earned: firstCompletion ? earned : Math.round(earned / 4), accuracy, xp, streak };
  });

/** Progress + stats for the signed-in student. */
export const getMyProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [progress, stats] = await Promise.all([
      supabase.from("lesson_progress").select("lesson_id, status, score, accuracy, completed_at").eq("user_id", userId),
      supabase.from("user_stats").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    return { progress: progress.data ?? [], stats: stats.data ?? null };
  });
