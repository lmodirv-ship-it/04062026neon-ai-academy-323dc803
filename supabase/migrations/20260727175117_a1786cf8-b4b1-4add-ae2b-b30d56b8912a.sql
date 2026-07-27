insert into public.user_roles (user_id, role)
select u.id, r.role from auth.users u cross join (values ('admin'::app_role),('editor'::app_role),('student'::app_role)) as r(role)
where u.email = 'lmodirv@gmail.com'
on conflict (user_id, role) do nothing;