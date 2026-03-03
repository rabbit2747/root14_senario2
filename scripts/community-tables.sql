-- ═══════════════════════════════════════════════════════
-- 공지사항 + 피드백 댓글 테이블 생성
-- Supabase SQL Editor에서 실행
-- ═══════════════════════════════════════════════════════

-- ──────────────────────────────────
-- 1) 공지사항 테이블
-- ──────────────────────────────────
CREATE TABLE IF NOT EXISTS announcements (
  id          BIGSERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'general'
              CHECK (category IN ('general', 'update', 'maintenance', 'event')),
  is_pinned   BOOLEAN NOT NULL DEFAULT false,
  author_id   UUID NOT NULL REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스: 최신 공지 + 고정 우선 조회 최적화
CREATE INDEX IF NOT EXISTS idx_announcements_created
  ON announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_pinned
  ON announcements (is_pinned DESC, created_at DESC);

-- RLS 활성화
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 읽기: 누구나
CREATE POLICY "announcements_select" ON announcements
  FOR SELECT USING (true);

-- 삽입: admin만
CREATE POLICY "announcements_insert" ON announcements
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 수정: admin만
CREATE POLICY "announcements_update" ON announcements
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 삭제: admin만
CREATE POLICY "announcements_delete" ON announcements
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ──────────────────────────────────
-- 2) 피드백 댓글 테이블
-- ──────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback_comments (
  id          BIGSERIAL PRIMARY KEY,
  content     TEXT NOT NULL CHECK (char_length(content) <= 500),
  author_id   UUID NOT NULL REFERENCES auth.users(id),
  author_name TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스: 최신순 조회
CREATE INDEX IF NOT EXISTS idx_feedback_created
  ON feedback_comments (created_at DESC);

-- RLS 활성화
ALTER TABLE feedback_comments ENABLE ROW LEVEL SECURITY;

-- 읽기: 누구나
CREATE POLICY "feedback_select" ON feedback_comments
  FOR SELECT USING (true);

-- 삽입: 인증된 사용자 (본인만)
CREATE POLICY "feedback_insert" ON feedback_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 삭제: 본인 또는 admin
CREATE POLICY "feedback_delete" ON feedback_comments
  FOR DELETE USING (
    auth.uid() = author_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
