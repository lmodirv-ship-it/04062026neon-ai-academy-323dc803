GRANT EXECUTE ON FUNCTION public.can_edit_content(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;