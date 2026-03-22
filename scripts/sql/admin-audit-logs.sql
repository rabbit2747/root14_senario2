-- ============================================================
-- 관리자 감사 로그 테이블 (admin_audit_logs)
-- 관리자 작업 추적: IP, 타임스탬프, 액션, 상세 정보
-- ============================================================

-- 1. 테이블 생성
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email       TEXT,
  ip          TEXT,
  action      TEXT NOT NULL,           -- 'edu_html_save', 'edu_html_delete', etc.
  page_id     TEXT,                     -- 대상 페이지 ID
  detail      JSONB DEFAULT NULL,      -- 추가 메타데이터 (XSS 경고 등)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. 인덱스 (조회 성능)
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_id    ON admin_audit_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_action     ON admin_audit_logs (action);

-- 3. RLS 활성화
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- 읽기: admin만
CREATE POLICY "audit_admin_read" ON admin_audit_logs
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 쓰기: admin만 (INSERT)
CREATE POLICY "audit_admin_write" ON admin_audit_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 삭제/수정 불가 (감사 로그 불변성)
-- UPDATE, DELETE 정책 없음 → 감사 로그는 수정/삭제 불가

-- 4. Realtime 활성화 (감사 로그 실시간 알림용)
ALTER PUBLICATION supabase_realtime ADD TABLE admin_audit_logs;

-- ============================================================
-- 실행 방법: Supabase SQL Editor에서 이 스크립트를 실행하세요
-- ============================================================
