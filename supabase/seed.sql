-- Seed 15 devices with varied initial state
insert into devices (id, type, room, label, status, wattage, last_changed, on_since) values
  ('drawing-fan-1', 'fan', 'drawing', 'Fan 1', 'on', 60, now() - interval '20 minutes', now() - interval '20 minutes'),
  ('drawing-fan-2', 'fan', 'drawing', 'Fan 2', 'off', 0, now() - interval '1 hour', null),
  ('drawing-light-1', 'light', 'drawing', 'Light 1', 'on', 15, now() - interval '45 minutes', now() - interval '45 minutes'),
  ('drawing-light-2', 'light', 'drawing', 'Light 2', 'on', 15, now() - interval '30 minutes', now() - interval '30 minutes'),
  ('drawing-light-3', 'light', 'drawing', 'Light 3', 'off', 0, now() - interval '2 hours', null),
  ('workroom1-fan-1', 'fan', 'workroom1', 'Fan 1', 'off', 0, now() - interval '3 hours', null),
  ('workroom1-fan-2', 'fan', 'workroom1', 'Fan 2', 'off', 0, now() - interval '3 hours', null),
  ('workroom1-light-1', 'light', 'workroom1', 'Light 1', 'off', 0, now() - interval '4 hours', null),
  ('workroom1-light-2', 'light', 'workroom1', 'Light 2', 'off', 0, now() - interval '4 hours', null),
  ('workroom1-light-3', 'light', 'workroom1', 'Light 3', 'off', 0, now() - interval '4 hours', null),
  ('workroom2-fan-1', 'fan', 'workroom2', 'Fan 1', 'on', 60, now() - interval '15 minutes', now() - interval '15 minutes'),
  ('workroom2-fan-2', 'fan', 'workroom2', 'Fan 2', 'on', 60, now() - interval '10 minutes', now() - interval '10 minutes'),
  ('workroom2-light-1', 'light', 'workroom2', 'Light 1', 'on', 15, now() - interval '25 minutes', now() - interval '25 minutes'),
  ('workroom2-light-2', 'light', 'workroom2', 'Light 2', 'on', 15, now() - interval '25 minutes', now() - interval '25 minutes'),
  ('workroom2-light-3', 'light', 'workroom2', 'Light 3', 'on', 15, now() - interval '25 minutes', now() - interval '25 minutes')
on conflict (id) do update set
  status = excluded.status,
  wattage = excluded.wattage,
  last_changed = excluded.last_changed,
  on_since = excluded.on_since;
