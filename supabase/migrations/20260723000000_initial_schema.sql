-- TMC Volunteer initial schema
-- Run this file through the Supabase CLI migration flow or the SQL Editor.

create extension if not exists pgcrypto;

create type public.user_role as enum ('student', 'admin');
create type public.verification_status as enum ('unverified', 'verified', 'needs_review');
create type public.account_status as enum ('active', 'suspended', 'graduated', 'pending_deletion');
create type public.ranking_display_type as enum ('name', 'nickname', 'anonymous');
create type public.participation_status as enum ('awarded', 'revoked');
create type public.memo_visibility as enum ('private', 'pending', 'public', 'returned');
create type public.stamp_shape as enum ('round', 'square');
create type public.stamp_border_style as enum ('solid', 'dashed', 'double', 'none');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  student_number text unique,
  name text not null,
  nickname text,
  role public.user_role not null default 'student',
  verification_status public.verification_status not null default 'unverified',
  account_status public.account_status not null default 'active',
  ranking_display_type public.ranking_display_type not null default 'name',
  ranking_participation boolean not null default true,
  must_change_password boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  constraint student_number_required_for_students check (
    (role = 'admin' and student_number is null) or
    (role = 'student' and student_number is not null and length(trim(student_number)) > 0)
  )
);

create table public.stamps (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  display_text text not null,
  icon text not null default 'stamp',
  primary_color text not null default '#f97316',
  secondary_color text not null default '#fff7ed',
  shape public.stamp_shape not null default 'round',
  border_style public.stamp_border_style not null default 'dashed',
  year integer not null check (year between 2000 and 2100),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.volunteer_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  start_time time,
  end_time time,
  location text not null,
  organizer text,
  category text not null,
  description text,
  cautions text,
  belongings text,
  clothing text,
  staff_name text,
  activity_hours numeric(5,2) not null check (activity_hours > 0),
  points integer not null default 0 check (points >= 0),
  stamp_id uuid references public.stamps(id) on delete set null,
  is_published boolean not null default false,
  is_memo_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_time_order check (start_time is null or end_time is null or start_time < end_time)
);

create table public.participations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete restrict,
  volunteer_event_id uuid not null references public.volunteer_events(id) on delete restrict,
  awarded_at timestamptz not null default now(),
  awarded_by uuid not null references public.users(id) on delete restrict,
  activity_hours numeric(5,2) not null check (activity_hours > 0),
  points integer not null check (points >= 0),
  status public.participation_status not null default 'awarded',
  revoked_at timestamptz,
  revoked_by uuid references public.users(id) on delete restrict,
  revoke_reason text,
  constraint one_participation_per_event unique (user_id, volunteer_event_id),
  constraint valid_revocation check (
    (status = 'awarded' and revoked_at is null and revoked_by is null and revoke_reason is null) or
    (status = 'revoked' and revoked_at is not null and revoked_by is not null and length(trim(revoke_reason)) > 0)
  )
);

create table public.activity_memos (
  id uuid primary key default gen_random_uuid(),
  participation_id uuid not null unique references public.participations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete restrict,
  assigned_activity text,
  good_points text,
  difficult_points text,
  belongings text,
  clothing text,
  meeting_notes text,
  cautions text,
  advice text,
  free_memo text,
  visibility public.memo_visibility not null default 'private',
  admin_comment text,
  reviewed_by uuid references public.users(id) on delete set null,
  reviewed_at timestamptz,
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ranking_settings (
  id boolean primary key default true check (id),
  is_ranking_visible boolean not null default true,
  is_monthly_visible boolean not null default true,
  is_yearly_visible boolean not null default true,
  is_all_time_visible boolean not null default true,
  display_limit integer not null default 20 check (display_limit between 1 and 100),
  aggregation_start_date date,
  excluded_event_ids uuid[] not null default '{}',
  priority text not null default 'stamps_then_points' check (priority in ('stamps_then_points', 'points_then_stamps')),
  allow_anonymous boolean not null default true,
  allow_opt_out boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  required_stamp_count integer not null default 0 check (required_stamp_count >= 0),
  required_points integer not null default 0 check (required_points >= 0),
  target_year integer check (target_year between 2000 and 2100),
  badge_image_url text,
  prize_description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.award_recipients (
  id uuid primary key default gen_random_uuid(),
  award_id uuid not null references public.awards(id) on delete restrict,
  user_id uuid not null references public.users(id) on delete restrict,
  awarded_on date not null default current_date,
  prize_received_at timestamptz,
  created_at timestamptz not null default now(),
  unique (award_id, user_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  published_at timestamptz,
  expires_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint announcement_expiry_order check (expires_at is null or published_at is null or expires_at > published_at)
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.users(id) on delete restrict,
  action text not null,
  target_type text not null,
  target_id uuid,
  details jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index participations_user_id_awarded_at_idx on public.participations (user_id, awarded_at desc);
create index participations_event_id_idx on public.participations (volunteer_event_id);
create index activity_memos_visibility_created_at_idx on public.activity_memos (visibility, created_at desc);
create index volunteer_events_date_idx on public.volunteer_events (event_date desc);
create index audit_logs_created_at_idx on public.audit_logs (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and account_status = 'active'
  );
$$;

create or replace function public.protect_student_identity()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.is_admin() and (new.student_number is distinct from old.student_number or new.name is distinct from old.name or new.role is distinct from old.role or new.account_status is distinct from old.account_status or new.verification_status is distinct from old.verification_status) then
    raise exception 'Only an administrator can change student identity or account status';
  end if;
  return new;
end;
$$;

create or replace function public.protect_memo_review_fields()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.visibility not in ('private', 'pending')
      or new.admin_comment is not null
      or new.reviewed_by is not null
      or new.reviewed_at is not null
      or new.is_pinned then
      raise exception 'Only an administrator can approve, return, or pin an activity memo';
    end if;
  end if;
  return new;
end;
$$;

create trigger users_set_updated_at before update on public.users for each row execute function public.set_updated_at();
create trigger stamps_set_updated_at before update on public.stamps for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.volunteer_events for each row execute function public.set_updated_at();
create trigger memos_set_updated_at before update on public.activity_memos for each row execute function public.set_updated_at();
create trigger ranking_set_updated_at before update on public.ranking_settings for each row execute function public.set_updated_at();
create trigger awards_set_updated_at before update on public.awards for each row execute function public.set_updated_at();
create trigger announcements_set_updated_at before update on public.announcements for each row execute function public.set_updated_at();
create trigger users_protect_identity before update on public.users for each row execute function public.protect_student_identity();
create trigger memos_protect_review_fields before insert or update on public.activity_memos for each row execute function public.protect_memo_review_fields();

insert into public.ranking_settings (id) values (true) on conflict (id) do nothing;

alter table public.users enable row level security;
alter table public.stamps enable row level security;
alter table public.volunteer_events enable row level security;
alter table public.participations enable row level security;
alter table public.activity_memos enable row level security;
alter table public.ranking_settings enable row level security;
alter table public.awards enable row level security;
alter table public.award_recipients enable row level security;
alter table public.announcements enable row level security;
alter table public.audit_logs enable row level security;

create policy "users read own profile or admins read all" on public.users for select using (id = auth.uid() or public.is_admin());
create policy "users update own safe profile fields or admins update all" on public.users for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());
create policy "admins create profiles" on public.users for insert with check (public.is_admin());

create policy "authenticated users read stamps" on public.stamps for select to authenticated using (true);
create policy "admins manage stamps" on public.stamps for all using (public.is_admin()) with check (public.is_admin());
create policy "students read published events and admins read all" on public.volunteer_events for select to authenticated using (is_published or public.is_admin());
create policy "admins manage events" on public.volunteer_events for all using (public.is_admin()) with check (public.is_admin());
create policy "students read own participations and admins read all" on public.participations for select using (user_id = auth.uid() or public.is_admin());
create policy "admins manage participations" on public.participations for all using (public.is_admin()) with check (public.is_admin());
create policy "students read own and approved public memos" on public.activity_memos for select using (user_id = auth.uid() or visibility = 'public' or public.is_admin());
create policy "students create own memos" on public.activity_memos for insert with check (user_id = auth.uid() and exists (select 1 from public.participations p where p.id = participation_id and p.user_id = auth.uid() and p.status = 'awarded'));
create policy "students update own memos and admins manage all" on public.activity_memos for update using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "authenticated users read ranking settings" on public.ranking_settings for select to authenticated using (true);
create policy "admins manage ranking settings" on public.ranking_settings for all using (public.is_admin()) with check (public.is_admin());
create policy "authenticated users read active awards" on public.awards for select to authenticated using (is_active or public.is_admin());
create policy "admins manage awards" on public.awards for all using (public.is_admin()) with check (public.is_admin());
create policy "students read own award recipients and admins read all" on public.award_recipients for select using (user_id = auth.uid() or public.is_admin());
create policy "admins manage award recipients" on public.award_recipients for all using (public.is_admin()) with check (public.is_admin());
create policy "authenticated users read published announcements" on public.announcements for select to authenticated using ((is_published and (expires_at is null or expires_at > now())) or public.is_admin());
create policy "admins manage announcements" on public.announcements for all using (public.is_admin()) with check (public.is_admin());
create policy "admins read audit logs" on public.audit_logs for select using (public.is_admin());
create policy "admins insert audit logs" on public.audit_logs for insert with check (public.is_admin());

insert into storage.buckets (id, name, public) values ('stamp-assets', 'stamp-assets', true) on conflict (id) do nothing;
create policy "authenticated users read stamp assets" on storage.objects for select to authenticated using (bucket_id = 'stamp-assets');
create policy "admins manage stamp assets" on storage.objects for all using (bucket_id = 'stamp-assets' and public.is_admin()) with check (bucket_id = 'stamp-assets' and public.is_admin());