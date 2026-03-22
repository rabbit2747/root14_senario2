-- ═══════════════════════════════════════════════════════════════════════════
-- 🔧 Supabase 통합 정리 SQL — v1.0.1
-- 목적: 유저 삭제 차단 해제(FK CASCADE) + RLS 보안 패치
-- 실행: Supabase Dashboard → SQL Editor → 전체 붙여넣기 → Run
-- 안전: 모든 구문 IF EXISTS 방어 — 중복 실행 가능
-- 날짜: 2026-03-11
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- [PART A] FK CASCADE 수정 — 유저 삭제 차단 해제
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- 현재 상태:
-- ┌─────────────────────┬──────────────┬──────────────┬──────────────────┐
-- │ 테이블              │ FK 컬럼      │ 현재 CASCADE │ 삭제 시 동작     │
-- ├─────────────────────┼──────────────┼──────────────┼──────────────────┤
-- │ announcements       │ author_id    │ ❌ 없음      │ 🚫 삭제 차단!   │
-- │ feedback_comments   │ author_id    │ ❌ 없음      │ 🚫 삭제 차단!   │
-- │ feedback_likes      │ user_id      │ ✅ CASCADE   │ ✅ 함께 삭제    │
-- │ admin_audit_logs    │ user_id      │ ✅ SET NULL  │ ✅ NULL 처리    │
-- │ profiles            │ id           │ ❓ 미확인    │ ❓ 차단 가능    │
-- │ access_logs         │ user_id      │ ❓ 미확인    │ ❓ 차단 가능    │
-- │ edu_progress        │ user_id      │ ❓ 미확인    │ ❓ 차단 가능    │
-- └─────────────────────┴──────────────┴──────────────┴──────────────────┘
--
-- 전략:
--   CASCADE (함께 삭제)  → 유저 없으면 의미 없는 데이터: profiles, edu_progress, feedback_likes
--   SET NULL (보존+익명) → 콘텐츠/로그 보존 필요: announcements, feedback_comments, access_logs, admin_audit_logs


-- ── A1. announcements.author_id → ON DELETE SET NULL ──
-- 공지사항은 보존하되 작성자만 익명화
ALTER TABLE announcements
  DROP CONSTRAINT IF EXISTS announcements_author_id_fkey;
ALTER TABLE announcements
  ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE announcements
  ADD CONSTRAINT announcements_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;


-- ── A2. feedback_comments.author_id → ON DELETE SET NULL ──
-- 댓글은 보존하되 작성자만 익명화
ALTER TABLE feedback_comments
  DROP CONSTRAINT IF EXISTS feedback_comments_author_id_fkey;
ALTER TABLE feedback_comments
  ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE feedback_comments
  ADD CONSTRAINT feedback_comments_author_id_fkey
  FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE SET NULL;


-- ── A3. profiles.id → ON DELETE CASCADE ──
-- 프로필은 유저와 1:1 — 유저 삭제 시 함께 삭제
-- ★ profiles 테이블은 user_id가 아닌 "id" 컬럼이 auth.users(id) 참조
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- 실제 제약조건 이름을 동적으로 찾아서 삭제
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'profiles'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'id'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE profiles DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- ── A4. access_logs.user_id → ON DELETE SET NULL ──
-- 접속 로그는 보존하되 유저 식별만 제거
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'access_logs'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE access_logs DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

-- user_id가 NOT NULL이면 해제 (에러 무시)
DO $$
BEGIN
  ALTER TABLE access_logs ALTER COLUMN user_id DROP NOT NULL;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

ALTER TABLE access_logs
  ADD CONSTRAINT access_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


-- ── A5. edu_progress.user_id → ON DELETE CASCADE ──
-- 학습 진행률은 유저 종속 — 함께 삭제
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  SELECT tc.constraint_name INTO constraint_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'edu_progress'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE edu_progress DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE edu_progress
  ADD CONSTRAINT edu_progress_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- ── A6. feedback_likes.user_id — 이미 ON DELETE CASCADE (확인만) ──
-- community-upgrade.sql에서 이미 설정됨. 건드리지 않음.


-- ── A7. admin_audit_logs.user_id — 이미 ON DELETE SET NULL (확인만) ──
-- admin-audit-logs.sql에서 이미 설정됨. 건드리지 않음.


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- [PART B] RLS 보안 패치 — 미적용 테이블
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- ┌─────────────────────┬──────────────┬──────────────────────────────────┐
-- │ 테이블              │ 현재 RLS     │ 필요한 정책                      │
-- ├─────────────────────┼──────────────┼──────────────────────────────────┤
-- │ access_logs         │ ⚠️ 미적용   │ 본인 로그만 조회 가능            │
-- │ feedback_likes      │ ✅ 적용됨   │ 정책 보완 (insert 시 본인만)     │
-- │ announcements       │ ✅ 적용됨   │ 정책 보완 (인증 유저만 읽기)     │
-- │ wiki_terms          │ ⚠️ 미적용   │ 누구나 읽기, admin만 쓰기        │
-- │ level_test_questions│ ⚠️ 미확인   │ 누구나 읽기, admin만 쓰기        │
-- └─────────────────────┴──────────────┴──────────────────────────────────┘


-- ── B1. access_logs: 본인 로그만 조회 + 인증 유저만 삽입 ──
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "access_logs_own_only" ON access_logs;
CREATE POLICY "access_logs_own_only" ON access_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "access_logs_insert" ON access_logs;
CREATE POLICY "access_logs_insert" ON access_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 관리자는 전체 로그 조회 가능
DROP POLICY IF EXISTS "access_logs_admin_read" ON access_logs;
CREATE POLICY "access_logs_admin_read" ON access_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ── B2. wiki_terms: 누구나 읽기, admin만 쓰기 ──
ALTER TABLE wiki_terms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wiki_terms_public_read" ON wiki_terms;
CREATE POLICY "wiki_terms_public_read" ON wiki_terms
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "wiki_terms_admin_write" ON wiki_terms;
CREATE POLICY "wiki_terms_admin_write" ON wiki_terms
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ── B3. level_test_questions: 활성 문제만 읽기, admin만 쓰기 ──
ALTER TABLE level_test_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "level_test_public_read" ON level_test_questions;
CREATE POLICY "level_test_public_read" ON level_test_questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "level_test_admin_write" ON level_test_questions;
CREATE POLICY "level_test_admin_write" ON level_test_questions
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );


-- ── B4. announcements: 기존 public 읽기 → 인증 유저만 읽기로 변경 ──
DROP POLICY IF EXISTS "announcements_public_read" ON announcements;
DROP POLICY IF EXISTS "announcements_select" ON announcements;
DROP POLICY IF EXISTS "announcements_auth_read" ON announcements;
CREATE POLICY "announcements_auth_read" ON announcements
  FOR SELECT TO authenticated USING (true);


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- [PART C] 정리 완료 후 상태 검증 쿼리
-- 이 부분은 실행하지 않아도 됩니다. 확인용입니다.
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- 실행 후 FK 상태 확인 쿼리 (별도 실행):
/*
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
JOIN information_schema.referential_constraints rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_schema = 'auth'
  AND ccu.table_name = 'users'
ORDER BY tc.table_name;
*/

-- 실행 후 RLS 상태 확인 쿼리 (별도 실행):
/*
SELECT
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
*/

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- ✅ 실행 완료 후 체크리스트:
-- 1. Supabase Dashboard → Auth → Users → 테스트 계정 삭제 시도
-- 2. 삭제 성공하면 FK CASCADE 적용 완료
-- 3. 위 검증 쿼리(PART C)로 FK/RLS 상태 확인
-- ═══════════════════════════════════════════════════════════════════════════
