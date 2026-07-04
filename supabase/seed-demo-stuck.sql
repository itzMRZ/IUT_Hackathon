-- Demo: room stuck on for 2+ hours (Work Room 2)
update devices set
  status = 'on',
  wattage = case type when 'fan' then 60 else 15 end,
  on_since = now() - interval '2 hours 15 minutes',
  last_changed = now() - interval '2 hours 15 minutes'
where room = 'workroom2';

insert into alerts (message, severity, room, rule_type, created_at)
select
  'Work Room 2 has been fully on for over 2 hours',
  'warning',
  'workroom2',
  'room_stuck',
  now()
where not exists (
  select 1 from alerts
  where rule_type = 'room_stuck' and room = 'workroom2'
    and created_at > now() - interval '1 hour'
);
