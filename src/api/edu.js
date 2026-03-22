/**
 * 📚 교육 진행률 API
 * Phase 0: Supabase 직접 쿼리 → 훅에서 api/ 경유
 *
 * ⚠️ public/edu/progress-tracker.js는 SPA 외부 vanilla JS
 *    Phase 2에서 NestJS API 엔드포인트 호출로 별도 교체 필요
 *
 * 🔄 Phase 1 이관 우선순위:
 *    A (쉬움): useEduProgress.js (SELECT 1개)
 *    B (보통): EduProgressStats.jsx (전체 통계)
 *    C (복잡): useEduHtmlContent.js (XSS 필터링 + 감사 로그 포함)
 */
import { client } from './_client';

// ── edu_progress ──

/** 특정 유저의 전체 진행률 조회 */
export const getEduProgress = (userId) =>
  client
    .from('edu_progress')
    .select('technique_id, chapter_id, level')
    .eq('user_id', userId);

/**
 * 수료 기록 저장 (중복 무시)
 * supabase-js v2: ignoreDuplicates:true → ON CONFLICT DO NOTHING
 */
export const upsertEduProgress = (payload) =>
  client.from('edu_progress').upsert(payload, { ignoreDuplicates: true });

/** 관리자: 전체 진행률 통계 조회 */
export const getAllEduProgress = () =>
  client.from('edu_progress').select('*');

// ── guided_progress (유도 학습 챕터 완료 기록) ──
// edu_progress 테이블 재사용: chapter_id = 'guided_ch{N}', level = 'guided'

/** 유도 학습 챕터 완료 저장 */
export const upsertGuidedProgress = (userId, techniqueId, chapterId) =>
  client.from('edu_progress').upsert(
    {
      user_id: userId,
      technique_id: techniqueId,
      chapter_id: `guided_ch${chapterId}`,
      level: 'guided',
    },
    { ignoreDuplicates: true }
  );

/** 유도 학습 진행률 조회 (특정 기법) */
export const getGuidedProgress = (userId, techniqueId) =>
  client
    .from('edu_progress')
    .select('chapter_id')
    .eq('user_id', userId)
    .eq('technique_id', techniqueId)
    .eq('level', 'guided');

// ── edu_html_content ──

/**
 * 실습 HTML 콘텐츠 로드
 * ✅ 검증 완료: page_id 컬럼 기준, content+updated_at만 선택
 */
export const getEduHtmlContent = (pageId) =>
  client
    .from('edu_html_content')
    .select('content, updated_at')
    .eq('page_id', pageId)
    .single();

/**
 * 실습 HTML 콘텐츠 저장 (upsert)
 * ✅ 검증 완료: onConflict 'page_id' 추가
 */
export const upsertEduHtmlContent = (payload) =>
  client
    .from('edu_html_content')
    .upsert(payload, { onConflict: 'page_id' });

/**
 * 실습 HTML 콘텐츠 삭제 (원본 복원)
 * ✅ 검증 완료: useEduHtmlContent.js deleteContent와 일치
 */
export const deleteEduHtmlContent = (pageId) =>
  client
    .from('edu_html_content')
    .delete()
    .eq('page_id', pageId);
