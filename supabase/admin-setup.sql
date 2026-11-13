-- Run once in Supabase -> SQL Editor (after schema.sql).
-- Gives the admin user (already created in Authentication -> Users) access to the admin panel,
-- and sets where new-enquiry emails are sent.

insert into admin_whitelist (user_id)
select id from auth.users where email = 'agriversellp7@gmail.com'
on conflict do nothing;

insert into settings (admin_email)
select 'agriversellp7@gmail.com'
where not exists (select 1 from settings);

-- Check: should return 1 row for the admin and 1 row for settings
select 'admin' as what, u.email from admin_whitelist w join auth.users u on u.id = w.user_id
union all
select 'settings', admin_email from settings;
