-- Return only ranking-safe aggregate data to student clients.
create or replace function public.get_volunteer_ranking(period text default 'all_time')
returns table (
  user_id uuid,
  display_name text,
  stamp_count bigint,
  point_total bigint,
  activity_hours numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    u.id,
    case u.ranking_display_type
      when 'nickname' then coalesce(nullif(trim(u.nickname), ''), u.name)
      when 'anonymous' then '匿名'
      else u.name
    end as display_name,
    count(p.id) as stamp_count,
    coalesce(sum(p.points), 0)::bigint as point_total,
    coalesce(sum(p.activity_hours), 0) as activity_hours
  from public.users u
  join public.participations p on p.user_id = u.id
  where u.role = 'student'
    and u.account_status = 'active'
    and u.ranking_participation
    and p.status = 'awarded'
    and (
      period = 'all_time'
      or (period = 'monthly' and p.awarded_at >= date_trunc('month', now()))
      or (period = 'yearly' and p.awarded_at >= date_trunc('year', now()))
    )
  group by u.id, u.name, u.nickname, u.ranking_display_type
  order by count(p.id) desc, coalesce(sum(p.points), 0) desc, coalesce(sum(p.activity_hours), 0) desc, u.id;
$$;

revoke execute on function public.get_volunteer_ranking(text) from public;
grant execute on function public.get_volunteer_ranking(text) to authenticated;