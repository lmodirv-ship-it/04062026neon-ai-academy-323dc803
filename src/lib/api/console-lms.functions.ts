import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertStaff(context: { supabase: any; userId: string }) {
  const { data: ok } = await context.supabase.rpc("can_edit_content", { _user_id: context.userId });
  if (!ok) throw new Error("صلاحية الإدارة مطلوبة.");
}

/** Aggregated LMS structure counts + per-course breakdown. */
export const getLmsOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const [programs, levels, courses, chapters, units, lessons, blocks, questions, options] = await Promise.all([
      context.supabase.from("programs").select("id, title, status"),
      context.supabase.from("levels").select("id, program_id, title, status"),
      context.supabase.from("courses").select("id, level_id, title, slug, difficulty, status"),
      context.supabase.from("chapters").select("id, course_id, title, status"),
      context.supabase.from("units").select("id, chapter_id, title, status"),
      context.supabase.from("lessons").select("id, unit_id, title, slug, status, xp_reward, duration_minutes"),
      context.supabase.from("lesson_blocks").select("id, lesson_id, kind"),
      context.supabase.from("questions").select("id, lesson_id, prompt, kind, xp"),
      context.supabase.from("question_options").select("id, question_id, is_correct"),
    ]);

    const L = lessons.data ?? [];
    const U = units.data ?? [];
    const C = chapters.data ?? [];
    const CO = courses.data ?? [];
    const Q = questions.data ?? [];
    const B = blocks.data ?? [];
    const O = options.data ?? [];

    const unitToChapter = new Map(U.map((u: any) => [u.id, u.chapter_id]));
    const chapterToCourse = new Map(C.map((c: any) => [c.id, c.course_id]));
    const lessonCourse = (lessonId: string) => {
      const l = L.find((x: any) => x.id === lessonId);
      if (!l) return null;
      return chapterToCourse.get(unitToChapter.get(l.unit_id) as string) ?? null;
    };

    const coursesDetailed = CO.map((c: any) => {
      const chs = C.filter((x: any) => x.course_id === c.id);
      const uns = U.filter((x: any) => chs.some((ch: any) => ch.id === x.chapter_id));
      const lss = L.filter((x: any) => uns.some((u: any) => u.id === x.unit_id));
      return {
        id: c.id,
        title: c.title,
        slug: c.slug,
        difficulty: c.difficulty,
        status: c.status,
        chapters: chs.length,
        units: uns.length,
        lessons: lss.length,
        published: lss.filter((x: any) => x.status === "published").length,
        xp: lss.reduce((s: number, x: any) => s + (x.xp_reward ?? 0), 0),
      };
    });

    const lessonsDetailed = L.map((l: any) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      status: l.status,
      xp: l.xp_reward,
      minutes: l.duration_minutes,
      blocks: B.filter((b: any) => b.lesson_id === l.id).length,
      questions: Q.filter((q: any) => q.lesson_id === l.id).length,
      courseId: lessonCourse(l.id),
    }));

    const quizzes = L.filter((l: any) => Q.some((q: any) => q.lesson_id === l.id)).map((l: any) => {
      const qs = Q.filter((q: any) => q.lesson_id === l.id);
      return {
        lessonId: l.id,
        lesson: l.title,
        slug: l.slug,
        status: l.status,
        questions: qs.length,
        options: O.filter((o: any) => qs.some((q: any) => q.id === o.question_id)).length,
        xp: qs.reduce((s: number, q: any) => s + (q.xp ?? 0), 0),
      };
    });

    return {
      counts: {
        programs: (programs.data ?? []).length,
        levels: (levels.data ?? []).length,
        courses: CO.length,
        chapters: C.length,
        units: U.length,
        lessons: L.length,
        lessonsPublished: L.filter((l: any) => l.status === "published").length,
        blocks: B.length,
        questions: Q.length,
        quizzes: quizzes.length,
      },
      courses: coursesDetailed,
      lessons: lessonsDetailed,
      quizzes,
    };
  });

/** Learning analytics: completion, accuracy, hardest lessons, certificates-eligible learners. */
export const getLearningAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context);
    const [progress, lessons, attempts, questions, stats, profiles] = await Promise.all([
      context.supabase.from("lesson_progress").select("user_id, lesson_id, status, score, accuracy, updated_at"),
      context.supabase.from("lessons").select("id, title, slug, status"),
      context.supabase.from("question_attempts").select("question_id, is_correct"),
      context.supabase.from("questions").select("id, lesson_id, prompt"),
      context.supabase.from("user_stats").select("user_id, xp, lessons_completed, correct_answers, total_answers, streak"),
      context.supabase.from("profiles").select("id, display_name"),
    ]);

    const P = progress.data ?? [];
    const L = lessons.data ?? [];
    const A = attempts.data ?? [];
    const Q = questions.data ?? [];
    const S = stats.data ?? [];
    const names = new Map((profiles.data ?? []).map((p: any) => [p.id, p.display_name]));

    const perLesson = L.map((l: any) => {
      const rows = P.filter((p: any) => p.lesson_id === l.id);
      const done = rows.filter((r: any) => r.status === "completed").length;
      const acc = rows.length ? rows.reduce((s: number, r: any) => s + Number(r.accuracy ?? 0), 0) / rows.length : 0;
      return {
        id: l.id,
        title: l.title,
        slug: l.slug,
        starts: rows.length,
        completions: done,
        completionRate: rows.length ? Math.round((done / rows.length) * 100) : 0,
        accuracy: Math.round(acc),
      };
    }).sort((a, b) => b.starts - a.starts);

    const perQuestion = Q.map((q: any) => {
      const rows = A.filter((a: any) => a.question_id === q.id);
      const correct = rows.filter((a: any) => a.is_correct).length;
      return {
        id: q.id,
        prompt: q.prompt,
        lesson: L.find((l: any) => l.id === q.lesson_id)?.title ?? "—",
        attempts: rows.length,
        successRate: rows.length ? Math.round((correct / rows.length) * 100) : 0,
      };
    }).filter((q) => q.attempts > 0).sort((a, b) => a.successRate - b.successRate).slice(0, 12);

    const learners = S.map((s: any) => ({
      userId: s.user_id,
      name: names.get(s.user_id) ?? "—",
      xp: s.xp,
      completed: s.lessons_completed,
      streak: s.streak,
      accuracy: s.total_answers ? Math.round((s.correct_answers / s.total_answers) * 100) : 0,
    })).sort((a, b) => b.completed - a.completed);

    const totalStarts = P.length;
    const totalDone = P.filter((p: any) => p.status === "completed").length;

    return {
      kpis: {
        totalStarts,
        totalDone,
        globalCompletion: totalStarts ? Math.round((totalDone / totalStarts) * 100) : 0,
        avgAccuracy: A.length ? Math.round((A.filter((a: any) => a.is_correct).length / A.length) * 100) : 0,
        attempts: A.length,
        learners: S.length,
      },
      perLesson,
      hardestQuestions: perQuestion,
      learners,
    };
  });
