-- Demo: after-hours device left on
update devices set
  status = 'on',
  wattage = 60,
  on_since = now() - interval '30 minutes',
  last_changed = now() - interval '30 minutes'
where id = 'drawing-fan-2';

insert into alerts (message, severity, room, rule_type, created_at)
select
  'Drawing Room Fan 2 is on outside office hours (9 AM - 5 PM)',
  'warning',
  'drawing',
  'after_hours',
  now()
where not exists (
  select 1 from alerts
  where rule_type = 'after_hours' and room = 'drawing'
    and created_at > now() - interval '1 hour'
);
