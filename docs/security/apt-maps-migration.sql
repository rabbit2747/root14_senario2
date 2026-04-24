-- APT 맵 메이커 — 2026-04-24
-- 관리자가 APT 시나리오 맵을 시각적으로 편집 → 학습자 게임에 반영

create table if not exists public.apt_maps (
  campaign_id text primary key,
  map_data    jsonb not null,
  updated_by  uuid references auth.users(id) on delete set null,
  updated_at  timestamptz not null default now()
);

alter table public.apt_maps enable row level security;

-- 인증 사용자: 읽기 가능 (게임에서 로드)
drop policy if exists apt_maps_read on public.apt_maps;
create policy apt_maps_read on public.apt_maps
  for select using (auth.role() = 'authenticated');

-- 관리자만 쓰기 (profiles.role='admin')
drop policy if exists apt_maps_admin_write on public.apt_maps;
create policy apt_maps_admin_write on public.apt_maps
  for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- 자동 updated_at
create or replace function public.apt_maps_touch()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_apt_maps_touch on public.apt_maps;
create trigger trg_apt_maps_touch before update on public.apt_maps
  for each row execute function public.apt_maps_touch();

-- map_data JSONB 스키마 (참고 — 검증은 프론트/백 레이어에서):
-- {
--   "width": 22, "height": 15, "tileSize": 16,
--   "floor":  [[frame, ...], ...],   -- width×height
--   "walls":  [[frame|null, ...], ...],
--   "objects":[{x, y, frame, collide:bool}],
--   "npcs":   [{x, y, spriteKey:"alex|amelia|bob", name, line}],
--   "missions":[{x, y}],
--   "start":  {x, y}
-- }
