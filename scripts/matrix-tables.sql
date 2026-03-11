-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Phase 3: 매트릭스 구조 관리 테이블 (Supabase SQL Editor에서 실행)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 1) matrix_tactics
CREATE TABLE IF NOT EXISTS matrix_tactics (
  id TEXT PRIMARY KEY,                          -- 't1'~'t14'
  title TEXT NOT NULL,                          -- 영문명 'Reconnaissance'
  sort_order INT NOT NULL DEFAULT 0,
  translations JSONB DEFAULT '{}',              -- {"ko":"정찰","zh":"侦察","hi":"टोह","ja":"偵察"}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2) matrix_techniques
CREATE TABLE IF NOT EXISTS matrix_techniques (
  id SERIAL PRIMARY KEY,
  tactic_id TEXT NOT NULL REFERENCES matrix_tactics(id) ON DELETE CASCADE,
  tid TEXT NOT NULL UNIQUE,                     -- 'T1595'
  name TEXT NOT NULL,                           -- 'Active Scanning'
  is_critical BOOLEAN DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  translations JSONB DEFAULT '{}',              -- {"ko":"능동 스캐닝",...}
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3) matrix_sub_techniques
CREATE TABLE IF NOT EXISTS matrix_sub_techniques (
  id SERIAL PRIMARY KEY,
  technique_tid TEXT NOT NULL REFERENCES matrix_techniques(tid) ON DELETE CASCADE,
  sid TEXT NOT NULL UNIQUE,                     -- 'T1595.001'
  name TEXT NOT NULL,                           -- 'Scanning IP Blocks'
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_mt_tactic ON matrix_techniques(tactic_id);
CREATE INDEX IF NOT EXISTS idx_mst_technique ON matrix_sub_techniques(technique_tid);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RLS: 읽기 = 누구나, 쓰기 = admin만
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ALTER TABLE matrix_tactics ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE matrix_sub_techniques ENABLE ROW LEVEL SECURITY;

-- 읽기 정책 (anon + authenticated)
CREATE POLICY "matrix_tactics_read" ON matrix_tactics
  FOR SELECT USING (true);
CREATE POLICY "matrix_techniques_read" ON matrix_techniques
  FOR SELECT USING (true);
CREATE POLICY "matrix_sub_techniques_read" ON matrix_sub_techniques
  FOR SELECT USING (true);

-- 쓰기 정책 (admin만)
CREATE POLICY "matrix_tactics_admin_write" ON matrix_tactics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "matrix_techniques_admin_write" ON matrix_techniques
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "matrix_sub_techniques_admin_write" ON matrix_sub_techniques
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
