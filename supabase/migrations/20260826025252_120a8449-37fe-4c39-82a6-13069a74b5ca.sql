create table public.talent_applications (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    full_name text not null,
    email text not null,
    phone text,
    role text not null,
    linkedin_url text,
    resume_text text,
    notes text,
    status text not null default 'new',
    constraint status_check check (status in ('new', 'reviewed', 'contacted', 'hired', 'passed'))
);

grant select, insert on public.talent_applications to anon;
grant select, insert, update, delete on public.talent_applications to authenticated;
grant all on public.talent_applications to service_role;

alter table public.talent_applications enable row level security;

create policy "Anyone can submit a talent application"
on public.talent_applications
for insert
to anon, authenticated
with check (true);

create policy "Authenticated users can read applications"
on public.talent_applications
for select
to authenticated
using (true);