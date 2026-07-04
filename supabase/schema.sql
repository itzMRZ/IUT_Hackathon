-- Office Monitor Dashboard schema
-- 15 devices: 3 rooms x (2 fans + 3 lights)

create table if not exists devices (
  id            text primary key,
  type          text not null check (type in ('fan', 'light')),
  room          text not null check (room in ('drawing', 'workroom1', 'workroom2')),
  label         text not null,
  status        text not null default 'off' check (status in ('on', 'off')),
  wattage       numeric not null default 0 check (wattage >= 0),
  last_changed  timestamptz not null default now(),
  on_since      timestamptz null,
  constraint wattage_matches_status check (
    (status = 'off' and wattage = 0) or
    (status = 'on' and wattage > 0)
  )
);

create index if not exists devices_room_idx on devices (room);

create table if not exists alerts (
  id          uuid primary key default gen_random_uuid(),
  message     text not null,
  severity    text not null default 'warning' check (severity in ('info', 'warning')),
  room        text null check (room is null or room in ('drawing', 'workroom1', 'workroom2')),
  rule_type   text not null check (rule_type in ('after_hours', 'room_stuck')),
  created_at  timestamptz not null default now()
);

create index if not exists alerts_created_at_idx on alerts (created_at desc);

alter publication supabase_realtime add table devices;
alter publication supabase_realtime add table alerts;

alter table devices enable row level security;
alter table alerts enable row level security;

create policy "anon read devices" on devices for select using (true);
create policy "anon read alerts" on alerts for select using (true);
