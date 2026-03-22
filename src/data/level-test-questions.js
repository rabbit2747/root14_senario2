/**
 * 레벨 테스트 메타데이터 (UI 전용)
 * ⚠️ 문제은행(QUESTION_BANK)은 v1.2.0부터 서버 API에서만 제공
 *    → GET  /api/level-test/questions (정답 제외)
 *    → POST /api/level-test/check     (서버사이드 채점)
 *    빌드에 문제+정답이 포함되지 않음!
 */

export const CATEGORIES = ['네트워크/OS', '보안기초', 'ATT&CK 전술', '위협 탐지', '심화/CTI'];

// 레이더 차트 라벨 다국어 (CATEGORIES 순서와 1:1 대응)
export const CATEGORIES_I18N = {
  ko: ['네트워크/OS', '보안기초', 'ATT&CK 전술', '위협 탐지', '심화/CTI'],
  en: ['Network/OS', 'Security Basics', 'ATT&CK Tactics', 'Threat Detection', 'Advanced/CTI'],
  ja: ['ネットワーク/OS', 'セキュリティ基礎', 'ATT&CK戦術', '脅威検知', '高度/CTI'],
  zh: ['网络/OS', '安全基础', 'ATT&CK战术', '威胁检测', '高级/CTI'],
  hi: ['नेटवर्क/OS', 'सुरक्षा मूल', 'ATT&CK रणनीति', 'खतरा पहचान', 'उन्नत/CTI'],
};

export const LEVEL_NAMES = {
  1: { ko: '비기너', en: 'Beginner', ja: 'ビギナー', zh: '入门', hi: 'शुरुआती', key: 'beginner' },
  2: { ko: '초급', en: 'Junior', ja: '初級', zh: '初级', hi: 'जूनियर', key: 'junior' },
  3: { ko: '중급', en: 'Intermediate', ja: '中級', zh: '中级', hi: 'मध्यम', key: 'intermediate' },
  4: { ko: '고급', en: 'Advanced', ja: '上級', zh: '高级', hi: 'उन्नत', key: 'advanced' },
  5: { ko: '전문가', en: 'Expert', ja: 'エキスパート', zh: '专家', hi: 'विशेषज्ञ', key: 'expert' },
};

export const LEVEL_COLORS = {
  1: '#22c55e',
  2: '#3b82f6',
  3: '#a855f7',
  4: '#f97316',
  5: '#ef4444',
};

// 하위 호환: 빈 객체 (서버 API로 대체됨)
export const QUESTION_BANK = {};
export default QUESTION_BANK;
