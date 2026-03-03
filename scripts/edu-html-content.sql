-- ============================================================
-- edu_html_content: 실습 HTML 콘텐츠 관리 테이블
-- 관리자가 AdminPage에서 편집한 교육 HTML을 저장
-- 유저 실행 필요: Supabase SQL Editor에서 실행
-- ============================================================

-- 1) 테이블 생성
CREATE TABLE IF NOT EXISTS edu_html_content (
  page_id    TEXT PRIMARY KEY,              -- ex: 't1078-002-domain-accounts'
  content    TEXT NOT NULL DEFAULT '',       -- 전체 HTML 문서 (<!DOCTYPE html> ~ </html>)
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) RLS 활성화
ALTER TABLE edu_html_content ENABLE ROW LEVEL SECURITY;

-- 3) 읽기: 누구나 가능 (교육 페이지 동적 로딩용, anon key 포함)
CREATE POLICY "edu_html_public_read"
  ON edu_html_content
  FOR SELECT
  USING (true);

-- 4) 쓰기: admin만 가능 (INSERT, UPDATE, DELETE)
CREATE POLICY "edu_html_admin_write"
  ON edu_html_content
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5) updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION fn_edu_html_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_edu_html_updated_at
  BEFORE UPDATE ON edu_html_content
  FOR EACH ROW
  EXECUTE FUNCTION fn_edu_html_updated_at();
