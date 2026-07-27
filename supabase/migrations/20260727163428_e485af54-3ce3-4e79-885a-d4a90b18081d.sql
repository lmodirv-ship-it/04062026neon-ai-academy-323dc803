CREATE TABLE public.post_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  order_index int not null default 0,
  created_at timestamptz not null default now()
);
GRANT SELECT ON public.post_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.post_categories TO authenticated;
GRANT ALL ON public.post_categories TO service_role;
ALTER TABLE public.post_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY post_categories_read ON public.post_categories FOR SELECT USING (true);
CREATE POLICY post_categories_write ON public.post_categories FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

CREATE TABLE public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  cover_url text,
  tags text[] not null default '{}',
  category_id uuid references public.post_categories(id) on delete set null,
  author_id uuid,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  views int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT ON public.posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_read ON public.posts FOR SELECT USING (status = 'published' OR public.can_edit_content(auth.uid()));
CREATE POLICY posts_write ON public.posts FOR ALL TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX posts_status_published_idx ON public.posts (status, published_at DESC);

CREATE TABLE public.page_views (
  id bigserial primary key,
  path text not null,
  session_id text,
  referrer text,
  country text,
  created_at timestamptz not null default now()
);
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY page_views_admin_read ON public.page_views FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE INDEX page_views_created_idx ON public.page_views (created_at DESC);

CREATE TABLE public.daily_stats (
  day date primary key,
  views int not null default 0,
  visitors int not null default 0
);
GRANT SELECT ON public.daily_stats TO anon, authenticated;
GRANT ALL ON public.daily_stats TO service_role;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY daily_stats_read ON public.daily_stats FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.track_page_view(_path text, _session text, _referrer text default null, _country text default null)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE is_new boolean;
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM public.page_views
    WHERE session_id = _session AND created_at::date = current_date
  ) INTO is_new;

  INSERT INTO public.page_views (path, session_id, referrer, country)
  VALUES (left(_path, 300), left(coalesce(_session,''), 64), left(coalesce(_referrer,''), 300), left(coalesce(_country,''), 8));

  INSERT INTO public.daily_stats (day, views, visitors)
  VALUES (current_date, 1, CASE WHEN is_new THEN 1 ELSE 0 END)
  ON CONFLICT (day) DO UPDATE
  SET views = public.daily_stats.views + 1,
      visitors = public.daily_stats.visitors + CASE WHEN is_new THEN 1 ELSE 0 END;
END; $$;
GRANT EXECUTE ON FUNCTION public.track_page_view(text, text, text, text) TO anon, authenticated, service_role;