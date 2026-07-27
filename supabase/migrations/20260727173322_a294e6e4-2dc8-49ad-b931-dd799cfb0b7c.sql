CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_name text,
  action text NOT NULL,
  entity text NOT NULL DEFAULT '',
  entity_id text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_admin_read ON public.audit_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_public boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY app_settings_read ON public.app_settings FOR SELECT USING (is_public OR public.has_role(auth.uid(),'admin'));
CREATE POLICY app_settings_write ON public.app_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER app_settings_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  body text,
  link text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.admin_notifications TO authenticated;
GRANT ALL ON public.admin_notifications TO service_role;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY admin_notifications_read ON public.admin_notifications FOR SELECT TO authenticated USING (public.can_edit_content(auth.uid()));
CREATE POLICY admin_notifications_update ON public.admin_notifications FOR UPDATE TO authenticated USING (public.can_edit_content(auth.uid())) WITH CHECK (public.can_edit_content(auth.uid()));

CREATE OR REPLACE FUNCTION public.log_action(_action text, _entity text, _entity_id text DEFAULT NULL, _details jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_logs (actor_id, actor_name, action, entity, entity_id, details)
  VALUES (auth.uid(), (SELECT display_name FROM public.profiles WHERE id = auth.uid()), left(_action,80), left(coalesce(_entity,''),80), left(_entity_id,120), coalesce(_details,'{}'::jsonb));
END; $$;
GRANT EXECUTE ON FUNCTION public.log_action(text,text,text,jsonb) TO authenticated;

INSERT INTO public.app_settings (key, value, is_public) VALUES
  ('site', '{"name":"HN-AI","tagline":"Learn AI in 10 Minutes a Day","logo_url":"","locale":"ar","theme":"dark"}'::jsonb, true),
  ('features', '{"blog":true,"leaderboard":true,"playground":true,"registration":true}'::jsonb, true);