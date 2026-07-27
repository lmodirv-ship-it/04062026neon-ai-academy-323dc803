-- helper: content editors
CREATE OR REPLACE FUNCTION public.can_edit_content(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id,'admin') OR public.has_role(_user_id,'editor');
$$;
REVOKE ALL ON FUNCTION public.can_edit_content(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.can_edit_content(uuid) TO authenticated, service_role;

DO $$ BEGIN
  CREATE TYPE public.content_status AS ENUM ('draft','published');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  order_index int NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  level_number int NOT NULL DEFAULT 1,
  title text NOT NULL,
  description text,
  order_index int NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id uuid NOT NULL REFERENCES public.levels(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'Sparkles',
  color text NOT NULL DEFAULT 'neon-purple',
  difficulty text NOT NULL DEFAULT 'Beginner',
  order_index int NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index int NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index int NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  duration_minutes int NOT NULL DEFAULT 10,
  xp_reward int NOT NULL DEFAULT 50,
  order_index int NOT NULL DEFAULT 0,
  status public.content_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.lesson_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'text',
  content text NOT NULL DEFAULT '',
  language text,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'mcq',
  prompt text NOT NULL,
  explanation text,
  xp int NOT NULL DEFAULT 10,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  label text NOT NULL,
  is_correct boolean NOT NULL DEFAULT false,
  order_index int NOT NULL DEFAULT 0
);

CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'in_progress',
  score int NOT NULL DEFAULT 0,
  accuracy numeric NOT NULL DEFAULT 0,
  attempts int NOT NULL DEFAULT 0,
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE public.question_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  option_id uuid,
  is_correct boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ON public.levels(program_id);
CREATE INDEX ON public.courses(level_id);
CREATE INDEX ON public.chapters(course_id);
CREATE INDEX ON public.units(chapter_id);
CREATE INDEX ON public.lessons(unit_id);
CREATE INDEX ON public.lesson_blocks(lesson_id);
CREATE INDEX ON public.questions(lesson_id);
CREATE INDEX ON public.question_options(question_id);
CREATE INDEX ON public.lesson_progress(user_id);
CREATE INDEX ON public.question_attempts(user_id);

-- grants
GRANT SELECT ON public.programs, public.levels, public.courses, public.chapters, public.units, public.lessons, public.lesson_blocks, public.questions, public.question_options TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs, public.levels, public.courses, public.chapters, public.units, public.lessons, public.lesson_blocks, public.questions, public.question_options, public.lesson_progress, public.question_attempts TO authenticated;
GRANT ALL ON public.programs, public.levels, public.courses, public.chapters, public.units, public.lessons, public.lesson_blocks, public.questions, public.question_options, public.lesson_progress, public.question_attempts TO service_role;

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

-- content read/write policies
CREATE POLICY programs_read ON public.programs FOR SELECT USING (status = 'published' OR public.can_edit_content(auth.uid()));
CREATE POLICY programs_write ON public.programs FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY levels_read ON public.levels FOR SELECT USING (status = 'published' OR public.can_edit_content(auth.uid()));
CREATE POLICY levels_write ON public.levels FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY courses_read ON public.courses FOR SELECT USING (status = 'published' OR public.can_edit_content(auth.uid()));
CREATE POLICY courses_write ON public.courses FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY chapters_read ON public.chapters FOR SELECT USING (status = 'published' OR public.can_edit_content(auth.uid()));
CREATE POLICY chapters_write ON public.chapters FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY units_read ON public.units FOR SELECT USING (status = 'published' OR public.can_edit_content(auth.uid()));
CREATE POLICY units_write ON public.units FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY lessons_read ON public.lessons FOR SELECT USING (status = 'published' OR public.can_edit_content(auth.uid()));
CREATE POLICY lessons_write ON public.lessons FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY lesson_blocks_read ON public.lesson_blocks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lessons l WHERE l.id = lesson_id AND (l.status = 'published' OR public.can_edit_content(auth.uid())))
);
CREATE POLICY lesson_blocks_write ON public.lesson_blocks FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY questions_read ON public.questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lessons l WHERE l.id = lesson_id AND (l.status = 'published' OR public.can_edit_content(auth.uid())))
);
CREATE POLICY questions_write ON public.questions FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

CREATE POLICY question_options_read ON public.question_options FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.questions q JOIN public.lessons l ON l.id = q.lesson_id WHERE q.id = question_id AND (l.status = 'published' OR public.can_edit_content(auth.uid())))
);
CREATE POLICY question_options_write ON public.question_options FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

-- progress policies (own data only)
CREATE POLICY lesson_progress_own ON public.lesson_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY question_attempts_own ON public.question_attempts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at triggers
CREATE TRIGGER t_programs_updated BEFORE UPDATE ON public.programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_levels_updated BEFORE UPDATE ON public.levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_chapters_updated BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_units_updated BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_lessons_updated BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER t_lesson_progress_updated BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();