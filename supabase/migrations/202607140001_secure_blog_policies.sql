alter table public.blogs enable row level security;

revoke all privileges on table public.blogs from anon, authenticated;
grant select on table public.blogs to anon;
grant select, insert, update, delete on table public.blogs to authenticated;

drop policy if exists "Allow public read" on public.blogs;
drop policy if exists "Allow public insert" on public.blogs;
drop policy if exists "Allow public update" on public.blogs;
drop policy if exists "Allow public delete" on public.blogs;

drop policy if exists "Public can read blogs" on public.blogs;
create policy "Public can read blogs"
on public.blogs
for select
to anon, authenticated
using (true);

drop policy if exists "Admins can insert blogs" on public.blogs;
create policy "Admins can insert blogs"
on public.blogs
for insert
to authenticated
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can update blogs" on public.blogs;
create policy "Admins can update blogs"
on public.blogs
for update
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin')
with check (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');

drop policy if exists "Admins can delete blogs" on public.blogs;
create policy "Admins can delete blogs"
on public.blogs
for delete
to authenticated
using (((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin');
