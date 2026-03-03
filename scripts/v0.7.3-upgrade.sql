-- ══════════════════════════════════════════
-- v0.7.3 업그레이드 SQL
-- Supabase Dashboard → SQL Editor에서 실행
-- ══════════════════════════════════════════

-- ──────────────────────────────────
-- 1) edu_progress 관리자 RLS 정책
--    관리자가 전체 교육 진행률을 조회 가능
-- ──────────────────────────────────
CREATE POLICY "Admins can view all progress"
  ON edu_progress FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ──────────────────────────────────
-- 2) new_user 트리거: 신규 가입 → 관리자 알림
--    profiles 테이블에 INSERT 시 자동 생성
-- ──────────────────────────────────
CREATE OR REPLACE FUNCTION fn_notify_admin_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_notifications (type, message, data)
  VALUES (
    'new_user',
    COALESCE(NEW.name, '알 수 없음') || '님이 새로 가입했습니다 (' || COALESCE(LEFT(NEW.email, 3) || '***', '') || ')',
    jsonb_build_object(
      'user_id', NEW.id,
      'email_prefix', LEFT(NEW.email, 3),
      'name', COALESCE(NEW.name, ''),
      'approved', COALESCE(NEW.approved, false)
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- 알림 실패가 가입 자체를 막지 않도록
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_user_notify ON profiles;
CREATE TRIGGER trg_new_user_notify
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION fn_notify_admin_new_user();


-- ──────────────────────────────────
-- 3) new_announcement 트리거: 공지 등록 → 관리자 알림
--    announcements 테이블에 INSERT 시 자동 생성
-- ──────────────────────────────────
CREATE OR REPLACE FUNCTION fn_notify_admin_new_announcement()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO admin_notifications (type, message, data)
  VALUES (
    'new_announcement',
    '새 공지사항: ' || LEFT(NEW.title, 50),
    jsonb_build_object(
      'announcement_id', NEW.id,
      'title', NEW.title,
      'category', NEW.category,
      'is_pinned', COALESCE(NEW.is_pinned, false),
      'author_id', NEW.author_id
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- 알림 실패가 공지 등록을 막지 않도록
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_new_announcement_notify ON announcements;
CREATE TRIGGER trg_new_announcement_notify
  AFTER INSERT ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION fn_notify_admin_new_announcement();


-- ──────────────────────────────────
-- 4) edu_progress 테이블 level 컬럼 (이미 없는 경우만)
-- ──────────────────────────────────
ALTER TABLE edu_progress ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'beginner';


-- ══════════════════════════════════════════
-- 완료!
-- 트리거 동작 테스트:
-- - 신규 사용자 가입 → admin_notifications에 new_user 레코드 확인
-- - 공지사항 등록 → admin_notifications에 new_announcement 레코드 확인
-- - 관리자 로그인 후 /admin → 📊 교육 통계 탭 확인
-- ══════════════════════════════════════════
