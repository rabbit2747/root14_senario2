-- ═══════════════════════════════════════════════════════
-- community-upgrade.sql
-- 대댓글(Threading) + 좋아요(Likes) + 관리자 알림(Notifications)
-- Supabase SQL Editor에서 실행
-- ═══════════════════════════════════════════════════════

BEGIN;

-- ──────────────────────────────────
-- 1) feedback_comments에 parent_id 추가 (대댓글)
-- ──────────────────────────────────
ALTER TABLE feedback_comments
  ADD COLUMN IF NOT EXISTS parent_id BIGINT
  REFERENCES feedback_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_feedback_parent
  ON feedback_comments (parent_id)
  WHERE parent_id IS NOT NULL;

-- ──────────────────────────────────
-- 2) feedback_likes 테이블 (좋아요)
-- ──────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback_likes (
  id          BIGSERIAL PRIMARY KEY,
  comment_id  BIGINT NOT NULL REFERENCES feedback_comments(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_feedback_likes_comment
  ON feedback_likes (comment_id);

-- RLS
ALTER TABLE feedback_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "likes_select" ON feedback_likes
  FOR SELECT USING (true);

CREATE POLICY "likes_insert" ON feedback_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "likes_delete" ON feedback_likes
  FOR DELETE USING (auth.uid() = user_id);

-- ──────────────────────────────────
-- 3) admin_notifications 테이블
-- ──────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_notifications (
  id          BIGSERIAL PRIMARY KEY,
  type        TEXT NOT NULL DEFAULT 'new_comment'
              CHECK (type IN ('new_comment', 'new_user', 'new_announcement')),
  message     TEXT NOT NULL,
  data        JSONB DEFAULT '{}',
  is_read     BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_notif_unread
  ON admin_notifications (is_read, created_at DESC)
  WHERE is_read = false;

-- RLS: admin만 접근
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_notif_select" ON admin_notifications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_notif_update" ON admin_notifications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "admin_notif_delete" ON admin_notifications
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ──────────────────────────────────
-- 4) DB Trigger: 새 댓글 → 관리자 알림 자동 생성
-- ──────────────────────────────────
CREATE OR REPLACE FUNCTION fn_notify_admin_new_comment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_notifications (type, message, data)
  VALUES (
    'new_comment',
    COALESCE(NEW.author_name, '익명') || '님이 새 피드백을 남겼습니다',
    jsonb_build_object(
      'comment_id', NEW.id,
      'author_id', NEW.author_id,
      'author_name', COALESCE(NEW.author_name, ''),
      'content_preview', LEFT(NEW.content, 100),
      'parent_id', NEW.parent_id
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_comment_notify ON feedback_comments;
CREATE TRIGGER trg_new_comment_notify
  AFTER INSERT ON feedback_comments
  FOR EACH ROW
  EXECUTE FUNCTION fn_notify_admin_new_comment();

-- ──────────────────────────────────
-- 5) Supabase Realtime replication 활성화
-- ──────────────────────────────────
-- 이미 추가된 테이블은 무시됨 (에러 시 개별 실행)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE announcements;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE feedback_comments;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE feedback_likes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE admin_notifications;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
