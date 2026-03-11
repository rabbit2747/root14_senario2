import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, RadialLinearScale, PointElement,
  LineElement, Filler, Tooltip,
} from 'chart.js';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { getQuestions } from '../api/levelTest';
import { getStoredLang } from '../components/LangToggle';
import { QUESTION_BANK, CATEGORIES, CATEGORIES_I18N, LEVEL_NAMES, LEVEL_COLORS } from '../data/level-test-questions';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

// ── 상수 ──
const TOTAL_QUESTIONS = 7;
const BASE_TIME = 15;
const LONG_Q_BONUS = 3;
const STORAGE_KEY = 'gotroot_level_test_result';

// ── 다국어 번역 ──
const levelTestT = {
  ko: {
    outsideTitle: 'MITRE ATT&CK 역량 진단',
    outsideDesc1: '내 실력에 맞춰 실시간으로 난이도가 조절되는',
    outsideDesc2: '총 7문제',
    outsideDesc3: '퀴즈입니다.',
    outsideDesc4: '정답 시 다음 문제는 더',
    outsideDesc5: '어려워지고',
    outsideDesc6: '오답 시',
    outsideDesc7: '쉬워집니다',
    outsideDesc8: '결과 화면에서 나의',
    outsideDesc9: '강점/약점 레이더 차트',
    outsideDesc10: '를 분석해 줍니다.',
    timerLabel: '1문항당 15초 제한 | 1회 응시',
    startBtn: '테스트 시작하기',
    backBtn: '← 메인으로 돌아가기',
    confirmBtn: '정답 확인',
    timeExtended: '지문이 길어 제한 시간이',
    timeExtendedSuffix: '초 연장되었습니다',
    correct: '정답',
    wrong: '오답',
    timeout: '시간 초과',
    levelUp: '난이도 상승',
    levelDown: '난이도 하락',
    levelKeep: '레벨 유지',
    levelMax: '최고 레벨 유지',
    yourLevel: '당신의 레벨:',
    scorePrefix: '종합 점수:',
    scoreSuffix: '점',
    signupBtn: '회원가입하고 학습 시작하기',
    loginLink: '이미 계정이 있으신가요? 로그인',
    reviewBtn: '상세 리포트 및 오답 확인',
    reviewBack: '← 결과로 돌아가기',
    reviewTitle: '상세 리포트',
    myChoice: '내 선택:',
    correctAnswer: '정답:',
    easterEggTitle: '만점 달성!\n갓루트의 총애를 받았습니다.',
    easterEggBtn: '결과 확인하기',
    currRecommend: '추천 코스',
  },
  en: {
    outsideTitle: 'MITRE ATT&CK Skill Assessment',
    outsideDesc1: 'An adaptive quiz with',
    outsideDesc2: '7 questions',
    outsideDesc3: 'that adjusts to your skill level in real-time.',
    outsideDesc4: 'Correct answers make the next question',
    outsideDesc5: 'harder',
    outsideDesc6: 'while wrong answers make it',
    outsideDesc7: 'easier',
    outsideDesc8: 'View your',
    outsideDesc9: 'strengths/weaknesses radar chart',
    outsideDesc10: 'on the results screen.',
    timerLabel: '15s per question | One attempt',
    startBtn: 'Start Test',
    backBtn: '← Back to Main',
    confirmBtn: 'Check Answer',
    timeExtended: 'Extended time by',
    timeExtendedSuffix: 's for long passage',
    correct: 'Correct',
    wrong: 'Wrong',
    timeout: 'Time Out',
    levelUp: 'Difficulty Up',
    levelDown: 'Difficulty Down',
    levelKeep: 'Level Maintained',
    levelMax: 'Max Level Maintained',
    yourLevel: 'Your Level:',
    scorePrefix: 'Score:',
    scoreSuffix: 'pts',
    signupBtn: 'Sign Up & Start Learning',
    loginLink: 'Already have an account? Log In',
    reviewBtn: 'Detailed Report & Review',
    reviewBack: '← Back to Results',
    reviewTitle: 'Detailed Report',
    myChoice: 'Your choice:',
    correctAnswer: 'Correct:',
    easterEggTitle: 'Perfect Score!\nYou have earned GODROOT\'s favor.',
    easterEggBtn: 'View Results',
    currRecommend: 'Recommended Course',
  },
  ja: {
    outsideTitle: 'MITRE ATT&CK スキル診断',
    outsideDesc1: 'リアルタイムで難易度が調整される',
    outsideDesc2: '全7問',
    outsideDesc3: 'のクイズです。',
    outsideDesc4: '正解すると次の問題は',
    outsideDesc5: '難しくなり',
    outsideDesc6: '不正解だと',
    outsideDesc7: '易しくなります',
    outsideDesc8: '結果画面で',
    outsideDesc9: '強み/弱みレーダーチャート',
    outsideDesc10: 'を分析します。',
    timerLabel: '1問15秒 | 1回のみ',
    startBtn: 'テスト開始',
    backBtn: '← メインに戻る',
    confirmBtn: '回答確認',
    timeExtended: '長文のため制限時間を',
    timeExtendedSuffix: '秒延長しました',
    correct: '正解',
    wrong: '不正解',
    timeout: '時間切れ',
    levelUp: '難易度上昇',
    levelDown: '難易度下降',
    levelKeep: 'レベル維持',
    levelMax: '最高レベル維持',
    yourLevel: 'あなたのレベル:',
    scorePrefix: '総合スコア:',
    scoreSuffix: '点',
    signupBtn: '会員登録して学習開始',
    loginLink: 'すでにアカウントをお持ちですか？ ログイン',
    reviewBtn: '詳細レポートと誤答確認',
    reviewBack: '← 結果に戻る',
    reviewTitle: '詳細レポート',
    myChoice: '選択:',
    correctAnswer: '正解:',
    easterEggTitle: '満点達成！\nGODROOTの寵愛を受けました。',
    easterEggBtn: '結果を確認',
    currRecommend: '推奨コース',
  },
  zh: {
    outsideTitle: 'MITRE ATT&CK 能力评估',
    outsideDesc1: '根据您的水平实时调整难度的',
    outsideDesc2: '共7道',
    outsideDesc3: '题目。',
    outsideDesc4: '答对后下一题将',
    outsideDesc5: '更难',
    outsideDesc6: '答错后将',
    outsideDesc7: '更简单',
    outsideDesc8: '在结果页面查看您的',
    outsideDesc9: '强弱项雷达图',
    outsideDesc10: '分析。',
    timerLabel: '每题15秒 | 仅一次机会',
    startBtn: '开始测试',
    backBtn: '← 返回主页',
    confirmBtn: '确认答案',
    timeExtended: '长文题目，时间延长',
    timeExtendedSuffix: '秒',
    correct: '正确',
    wrong: '错误',
    timeout: '超时',
    levelUp: '难度上升',
    levelDown: '难度下降',
    levelKeep: '等级保持',
    levelMax: '最高等级保持',
    yourLevel: '您的等级：',
    scorePrefix: '总分：',
    scoreSuffix: '分',
    signupBtn: '注册并开始学习',
    loginLink: '已有账号？立即登录',
    reviewBtn: '详细报告和错题确认',
    reviewBack: '← 返回结果',
    reviewTitle: '详细报告',
    myChoice: '我的选择：',
    correctAnswer: '正确答案：',
    easterEggTitle: '满分达成！\n获得了GODROOT的青睐。',
    easterEggBtn: '查看结果',
    currRecommend: '推荐课程',
  },
  hi: {
    outsideTitle: 'MITRE ATT&CK कौशल मूल्यांकन',
    outsideDesc1: 'आपके स्तर के अनुसार वास्तविक समय में कठिनाई समायोजित करने वाला',
    outsideDesc2: 'कुल 7 प्रश्न',
    outsideDesc3: 'का क्विज़।',
    outsideDesc4: 'सही उत्तर के बाद अगला प्रश्न',
    outsideDesc5: 'कठिन',
    outsideDesc6: 'गलत के बाद',
    outsideDesc7: 'आसान',
    outsideDesc8: 'परिणाम में अपना',
    outsideDesc9: 'शक्ति/कमजोरी रडार चार्ट',
    outsideDesc10: 'देखें।',
    timerLabel: 'प्रति प्रश्न 15 सेकंड | एक प्रयास',
    startBtn: 'परीक्षा शुरू करें',
    backBtn: '← मुख्य पृष्ठ पर वापस',
    confirmBtn: 'उत्तर जाँचें',
    timeExtended: 'लंबे प्रश्न के लिए समय',
    timeExtendedSuffix: 'सेकंड बढ़ा',
    correct: 'सही',
    wrong: 'गलत',
    timeout: 'समय समाप्त',
    levelUp: 'कठिनाई बढ़ी',
    levelDown: 'कठिनाई घटी',
    levelKeep: 'स्तर बरकरार',
    levelMax: 'अधिकतम स्तर बरकरार',
    yourLevel: 'आपका स्तर:',
    scorePrefix: 'कुल स्कोर:',
    scoreSuffix: 'अंक',
    signupBtn: 'साइन अप करें और सीखना शुरू करें',
    loginLink: 'पहले से खाता है? लॉगिन करें',
    reviewBtn: 'विस्तृत रिपोर्ट और समीक्षा',
    reviewBack: '← परिणाम पर वापस',
    reviewTitle: 'विस्तृत रिपोर्ट',
    myChoice: 'मेरा चयन:',
    correctAnswer: 'सही उत्तर:',
    easterEggTitle: 'पूर्ण अंक!\nGODROOT की कृपा प्राप्त हुई।',
    easterEggBtn: 'परिणाम देखें',
    currRecommend: 'अनुशंसित पाठ्यक्रम',
  },
};

// ── SVG 아이콘 ──
const SVG_ICONS = {
  expert: <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
  advanced: <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  intermediate: <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  junior: <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  beginner: <svg className="w-10 h-10 md:w-12 md:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" /></svg>,
  intro: <svg className="w-24 h-24 md:w-32 md:h-32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" /></svg>,
};

const ICON_WRAPPER_CLASSES = {
  5: 'bg-zinc-900 text-white border-zinc-700 dark:bg-white dark:text-zinc-900 dark:border-gray-200',
  4: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/50',
  3: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50',
  2: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
  1: 'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
};

const LEVEL_ICON_MAP = { 5: 'expert', 4: 'advanced', 3: 'intermediate', 2: 'junior', 1: 'beginner' };

// GODROOT zoo SVG
const ZooSvg = () => (
  <svg className="w-full h-full object-contain drop-shadow-2xl" viewBox="0 0 1000 800" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
    <rect width="1000" height="800" fill="#0078D7" rx="20"/>
    <circle cx="500" cy="500" r="350" fill="#ffffff" opacity="0.1"/>
    <g stroke="#1c1c1c" strokeWidth="6">
      <circle cx="200" cy="500" r="60" fill="#e67e22"/><circle cx="200" cy="500" r="40" fill="#f1c40f"/><circle cx="185" cy="490" r="6" fill="#1c1c1c"/><circle cx="215" cy="490" r="6" fill="#1c1c1c"/><ellipse cx="200" cy="505" rx="10" ry="6" fill="#e67e22"/>
      <circle cx="320" cy="450" r="45" fill="#e67e22"/><circle cx="305" cy="445" r="5" fill="#1c1c1c"/><circle cx="335" cy="445" r="5" fill="#1c1c1c"/><path d="M 320 410 L 320 430 M 290 440 L 300 450 M 350 440 L 340 450" stroke="#1c1c1c" strokeWidth="4"/>
      <polygon points="410,480 430,420 450,480" fill="#e74c3c"/><circle cx="430" cy="490" r="40" fill="#e74c3c"/><circle cx="418" cy="485" r="5" fill="#1c1c1c"/><circle cx="442" cy="485" r="5" fill="#1c1c1c"/>
      <circle cx="580" cy="480" r="45" fill="#ffb8c6"/><ellipse cx="580" cy="490" rx="15" ry="10" fill="#ff7690"/>
      <circle cx="670" cy="490" r="40" fill="#2ecc71"/><circle cx="655" cy="455" r="15" fill="#2ecc71"/><circle cx="685" cy="455" r="15" fill="#2ecc71"/><circle cx="655" cy="455" r="5" fill="#1c1c1c"/><circle cx="685" cy="455" r="5" fill="#1c1c1c"/>
      <ellipse cx="800" cy="520" rx="40" ry="50" fill="#2c3e50"/><ellipse cx="800" cy="530" rx="30" ry="40" fill="#ffffff"/><polygon points="790,520 810,520 800,535" fill="#f1c40f"/>
      <circle cx="880" cy="620" r="50" fill="#ffffff"/><circle cx="840" cy="600" r="30" fill="#ffffff"/><circle cx="920" cy="600" r="30" fill="#ffffff"/><circle cx="880" cy="630" r="35" fill="#f5d6c6"/><circle cx="865" cy="625" r="5" fill="#1c1c1c"/><circle cx="895" cy="625" r="5" fill="#1c1c1c"/>
    </g>
    <path d="M 500 50 C 500 50 430 -20 370 50 C 310 120 500 220 500 220 C 500 220 690 120 630 50 C 570 -20 500 50 500 50 Z" fill="#ffffff" stroke="#1c1c1c" strokeWidth="12" transform="scale(0.3) translate(1170, -20)"/>
    <path id="archPath" d="M 120 480 A 380 380 0 0 1 880 480" fill="none" stroke="#1c1c1c" strokeWidth="20"/>
    <path d="M 90 480 A 410 410 0 0 1 910 480" fill="none" stroke="#1c1c1c" strokeWidth="8"/>
    <text fontFamily="'Arial Black', Impact, sans-serif" fontSize="46" fill="#ffffff" fontWeight="900" letterSpacing="2">
      <textPath href="#archPath" startOffset="50%" textAnchor="middle" dominantBaseline="bottom">GODROOT EDUCATION</textPath>
    </text>
    <g stroke="#1c1c1c" strokeWidth="8" fill="#d35400">
      <rect x="60" y="480" width="130" height="320"/><rect x="810" y="480" width="130" height="320"/>
      <line x1="60" y1="540" x2="190" y2="540"/><line x1="60" y1="600" x2="190" y2="600"/><line x1="60" y1="660" x2="190" y2="660"/><line x1="60" y1="720" x2="190" y2="720"/>
      <line x1="810" y1="540" x2="940" y2="540"/><line x1="810" y1="600" x2="940" y2="600"/><line x1="810" y1="660" x2="940" y2="660"/><line x1="810" y1="720" x2="940" y2="720"/>
    </g>
    <g stroke="#1c1c1c" strokeWidth="6">
      <rect x="200" y="450" width="90" height="15" fill="#8d6e63" rx="5"/><ellipse cx="245" cy="510" rx="40" ry="35" fill="#a1887f"/><ellipse cx="245" cy="515" rx="30" ry="25" fill="#d7ccc8"/><circle cx="230" cy="510" r="5" fill="#1c1c1c"/><circle cx="260" cy="510" r="5" fill="#1c1c1c"/>
      <circle cx="750" cy="560" r="45" fill="#95a5a6"/><circle cx="700" cy="530" r="25" fill="#95a5a6"/><circle cx="800" cy="530" r="25" fill="#95a5a6"/><ellipse cx="750" cy="570" rx="15" ry="20" fill="#2c3e50"/>
    </g>
    <g stroke="#1c1c1c" strokeWidth="8">
      <path d="M 450 800 L 470 280 A 30 30 0 0 1 530 280 L 550 800 Z" fill="#f1c40f"/><circle cx="500" cy="250" r="45" fill="#f1c40f"/><circle cx="485" cy="245" r="6" fill="#1c1c1c"/><circle cx="515" cy="245" r="6" fill="#1c1c1c"/><circle cx="480" cy="380" r="15" fill="#d35400"/><circle cx="520" cy="480" r="20" fill="#d35400"/><circle cx="485" cy="580" r="15" fill="#d35400"/><circle cx="525" cy="680" r="22" fill="#d35400"/><line x1="480" y1="210" x2="470" y2="180" strokeLinecap="round"/><line x1="520" y1="210" x2="530" y2="180" strokeLinecap="round"/>
      <circle cx="680" cy="680" r="100" fill="#bdc3c7"/><circle cx="550" cy="650" r="60" fill="#bdc3c7"/><circle cx="810" cy="650" r="60" fill="#bdc3c7"/><path d="M 650 700 Q 680 800 650 800" fill="none" stroke="#bdc3c7" strokeWidth="30"/><circle cx="640" cy="650" r="8" fill="#1c1c1c"/><circle cx="720" cy="650" r="8" fill="#1c1c1c"/>
      <circle cx="320" cy="680" r="110" fill="#ffffff"/><circle cx="230" cy="590" r="35" fill="#ffffff"/><circle cx="410" cy="590" r="35" fill="#ffffff"/><circle cx="280" cy="660" r="10" fill="#1c1c1c"/><circle cx="360" cy="660" r="10" fill="#1c1c1c"/><ellipse cx="320" cy="710" rx="35" ry="25" fill="#f1f2f6"/><circle cx="320" cy="700" r="12" fill="#1c1c1c"/>
      <ellipse cx="880" cy="730" rx="80" ry="70" fill="#7f8c8d"/><ellipse cx="880" cy="760" rx="65" ry="45" fill="#e84393"/><circle cx="850" cy="740" r="12" fill="#ffffff"/><circle cx="910" cy="740" r="12" fill="#ffffff"/>
      <ellipse cx="470" cy="650" rx="15" ry="60" fill="#ffffff"/><ellipse cx="530" cy="650" rx="15" ry="60" fill="#ffffff"/><circle cx="500" cy="740" r="55" fill="#ffffff"/><circle cx="485" cy="730" r="7" fill="#1c1c1c"/><circle cx="515" cy="730" r="7" fill="#1c1c1c"/><ellipse cx="500" cy="745" rx="6" ry="4" fill="#ffb8c6"/>
      <ellipse cx="410" cy="740" rx="25" ry="60" fill="#e67e22"/><circle cx="410" cy="670" r="30" fill="#e67e22"/><circle cx="395" cy="665" r="5" fill="#1c1c1c"/><circle cx="425" cy="665" r="5" fill="#1c1c1c"/><circle cx="410" cy="675" r="4" fill="#1c1c1c"/>
    </g>
  </svg>
);

// 레벨→점수 매핑
const LEVEL_SCORE = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };

// 타이머 그라데이션 (파랑→주황→빨강)
function getTimerColor(timeLeft, totalTime) {
  const ratio = timeLeft / totalTime;
  let r, g, b;
  if (ratio > 0.5) {
    const n = (ratio - 0.5) * 2;
    r = Math.round(59 * n + 250 * (1 - n));
    g = Math.round(130 * n + 204 * (1 - n));
    b = Math.round(246 * n + 21 * (1 - n));
  } else {
    const n = ratio * 2;
    r = Math.round(250 * n + 239 * (1 - n));
    g = Math.round(204 * n + 68 * (1 - n));
    b = Math.round(21 * n + 68 * (1 - n));
  }
  return `rgb(${r}, ${g}, ${b})`;
}

// ── 적응형 알고리즘 ──
function pickQuestion(bank, level, usedIds) {
  const pool = bank[level]?.filter((_, i) => !usedIds.has(`${level}-${i}`)) || [];
  if (pool.length === 0) return null;
  const idx = Math.floor(Math.random() * pool.length);
  const q = pool[idx];
  const originalIdx = bank[level].indexOf(q);
  return { ...q, _id: `${level}-${originalIdx}` };
}

function determineFinalLevel(answers) {
  const avgLevel = answers.reduce((sum, a) => sum + (a.correct ? a.level + 0.5 : a.level - 0.5), 0) / answers.length;
  if (avgLevel <= 1.5) return 1;
  if (avgLevel <= 2.5) return 2;
  if (avgLevel <= 3.5) return 3;
  if (avgLevel <= 4.5) return 4;
  return 5;
}

function computeRadarScores(answers) {
  const catScores = {};
  CATEGORIES.forEach(c => { catScores[c] = { total: 0, correct: 0 }; });
  answers.forEach(a => {
    const cat = a.category || '보안기초';
    if (catScores[cat]) {
      catScores[cat].total += 1;
      if (a.correct) catScores[cat].correct += 1;
    }
  });
  return CATEGORIES.map(c => {
    const s = catScores[c];
    return s.total > 0 ? Math.round((s.correct / s.total) * 100) : 20;
  });
}

// ── 레벨별 커리큘럼 (간단한 한국어 기본값) ──
const CURRICULUM = {
  5: { titleKey: 'expert', items: ['AMSI/ETW 우회, Direct Syscalls 분석', 'MITRE Engage 활용 및 Purple Teaming 전략'], wrapClass: 'bg-gray-50 dark:bg-[#2a2a2a] border-gray-200 dark:border-gray-700' },
  4: { titleKey: 'advanced', items: ['Windows Event ID 및 Sysmon 로우 데이터 분석', 'AD 심화 공격(Kerberoasting 등) 탐지 방안'], wrapClass: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/30' },
  3: { titleKey: 'intermediate', items: ['EDR 로그를 활용한 Technique 탐지 및 Sigma Rule', 'Lateral Movement 주요 기법 파악'], wrapClass: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/30' },
  2: { titleKey: 'junior', items: ['ATT&CK Matrix 구조 해부 및 14대 Tactic 이해', '보안 알람을 ATT&CK 기법으로 분류해보기'], wrapClass: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-800/30' },
  1: { titleKey: 'beginner', items: ['네트워크 통신 기초 및 리눅스/윈도우 명령어', 'Cyber Kill Chain 프로세스 기초'], wrapClass: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' },
};

// ── 메인 컴포넌트 ──
export default function LevelTest() {
  const navigate = useNavigate();
  const { isLoggedIn, userLevel } = useAuth();

  // 이미 로그인 + 레벨 있는 사용자 → 차단
  useEffect(() => {
    if (isLoggedIn && userLevel) navigate('/', { replace: true });
  }, [isLoggedIn, userLevel, navigate]);

  // 이미 완료한 비로그인 사용자 → 결과 화면 직행
  const savedResult = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const [phase, setPhase] = useState(savedResult ? 'result' : 'intro');
  const [bank, setBank] = useState(QUESTION_BANK);
  const [currentLevel, setCurrentLevel] = useState(3);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [usedIds, setUsedIds] = useState(new Set());
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(BASE_TIME);
  const [totalTime, setTotalTime] = useState(BASE_TIME);
  const [finalLevel, setFinalLevel] = useState(savedResult?.levelNum || null);
  const [radarScores, setRadarScores] = useState(savedResult?.radarScores || []);
  const [isDark, setIsDark] = useState(false);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [levelAnim, setLevelAnim] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [lang] = useState(() => getStoredLang());
  const t = levelTestT[lang] || levelTestT.ko;
  const timerRef = useRef(null);

  // 다크모드 토글
  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return next;
    });
  };

  // 페이지 진입 시 기존 다크모드 상태 확인
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) setIsDark(true);
    return () => { /* 페이지 떠날 때 dark 클래스 정리 안 함 (전역 테마 유지) */ };
  }, []);

  // Supabase에서 문제 불러오기
  useEffect(() => {
    (async () => {
      try {
        const data = await getQuestions();
        if (data && data.length >= 20) {
          const grouped = {};
          data.forEach(q => {
            const lv = q.level;
            if (!grouped[lv]) grouped[lv] = [];
            grouped[lv].push({ level: lv, category: q.category, question: q.question, options: q.options });
          });
          if (Object.keys(grouped).length >= 3) setBank(grouped);
        }
      } catch { /* 폴백: 정적 데이터 */ }
    })();
  }, []);

  // 타이머
  useEffect(() => {
    if (phase !== 'quiz' || showFeedback || !currentQ) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleConfirm(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, showFeedback, currentQ]);

  // 퀴즈 시작
  const startQuiz = () => {
    setPhase('quiz');
    setCurrentLevel(3);
    setQuestionIdx(0);
    setAnswers([]);
    setUsedIds(new Set());
    setSelected(null);
    setShowFeedback(false);
    setLevelAnim(null);
    const q = pickQuestion(bank, 3, new Set());
    if (q) {
      setCurrentQ(q);
      setUsedIds(new Set([q._id]));
      const bonus = q.question.length > 80 ? LONG_Q_BONUS : 0;
      const time = BASE_TIME + bonus;
      setTimeLeft(time);
      setTotalTime(time);
    }
  };

  // 옵션 선택 (라디오 토글)
  const selectOption = (idx) => {
    if (showFeedback) return;
    setSelected(prev => prev === idx ? null : idx);
  };

  // 정답 확인 버튼
  const handleConfirm = useCallback((isTimeout = false) => {
    if (showFeedback) return;
    clearInterval(timerRef.current);

    const optionIdx = isTimeout ? null : selected;
    const isCorrect = optionIdx !== null && currentQ?.options[optionIdx]?.isCorrect;
    setShowFeedback(true);

    const newAnswer = {
      level: currentLevel,
      category: currentQ?.category || '보안기초',
      correct: !!isCorrect,
      question: currentQ?.question,
      selectedIndex: optionIdx,
      options: currentQ?.options,
      isTimeout,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // 난이도 조정 + 애니메이션
    let nextLevel = currentLevel;
    if (isCorrect) {
      if (currentLevel < 5) {
        nextLevel = currentLevel + 1;
        setLevelAnim({ type: 'up', level: nextLevel });
      } else {
        setLevelAnim({ type: 'max' });
      }
    } else {
      if (currentLevel > 1) {
        nextLevel = currentLevel - 1;
        setLevelAnim({ type: 'down', level: nextLevel });
      } else {
        setLevelAnim({ type: 'keep' });
      }
    }

    const nextIdx = questionIdx + 1;

    setTimeout(() => {
      setLevelAnim(null);
      if (nextIdx >= TOTAL_QUESTIONS) {
        finishQuiz(updatedAnswers);
      } else {
        setCurrentLevel(nextLevel);
        setQuestionIdx(nextIdx);
        setSelected(null);
        setShowFeedback(false);

        const newUsed = new Set([...usedIds, currentQ?._id]);
        setUsedIds(newUsed);
        const q = pickQuestion(bank, nextLevel, newUsed);
        if (q) {
          setCurrentQ(q);
          newUsed.add(q._id);
          setUsedIds(newUsed);
          const bonus = q.question.length > 80 ? LONG_Q_BONUS : 0;
          const time = BASE_TIME + bonus;
          setTimeLeft(time);
          setTotalTime(time);
        } else {
          finishQuiz(updatedAnswers);
        }
      }
    }, 1400);
  }, [showFeedback, selected, currentQ, currentLevel, answers, questionIdx, usedIds, bank]);

  // 퀴즈 완료
  const finishQuiz = (finalAnswers) => {
    const ans = finalAnswers || answers;
    const level = determineFinalLevel(ans);
    const scores = computeRadarScores(ans);
    setFinalLevel(level);
    setRadarScores(scores);
    setPhase('result');

    const result = {
      level: LEVEL_NAMES[level]?.key || 'intermediate',
      levelNum: level,
      radarScores: scores,
      correctCount: ans.filter(a => a.correct).length,
      totalQuestions: ans.length,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));

    // 만점 이스터에그
    if (ans.every(a => a.correct)) {
      setTimeout(() => {
        confetti({ particleCount: 300, spread: 120, origin: { y: 0.5 }, zIndex: 10000 });
        setShowEasterEgg(true);
      }, 500);
    }
  };

  // ── 공통 래퍼 ──
  const PageWrapper = ({ children, showOutsideText = false }) => (
    <div className={`min-h-[100dvh] flex flex-col justify-center items-center transition-colors duration-300 overflow-hidden ${isDark ? 'bg-[#1a1a1a]' : 'bg-[#F4F1EA]'}`}>
      {showOutsideText && (
        <div className="text-center mb-8 px-4 z-0 transition-all duration-500">
          <h1 className="text-3xl md:text-5xl font-black mb-4 text-gray-800 dark:text-gray-100 tracking-tight drop-shadow-sm">
            {t.outsideTitle}
          </h1>
          <p className="text-[15px] md:text-[18px] leading-relaxed break-keep font-medium text-gray-600 dark:text-gray-300">
            {t.outsideDesc1} <b className="text-blue-600 dark:text-blue-400">{t.outsideDesc2}</b> {t.outsideDesc3}<br />
            {t.outsideDesc4} <b className="text-red-500 dark:text-red-400">{t.outsideDesc5}</b>, {t.outsideDesc6} <b className="text-green-500 dark:text-green-400">{t.outsideDesc7}</b>.<br />
            {t.outsideDesc8} <b className="text-purple-600 dark:text-purple-400">{t.outsideDesc9}</b>{t.outsideDesc10}
          </p>
        </div>
      )}
      <div className={`w-[95%] max-w-[850px] max-h-[90dvh] flex flex-col rounded-xl z-10 transition-all duration-300 sm:w-[95%] ${isDark ? 'bg-[#242424] shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.05)_inset]' : 'bg-white shadow-[0_20px_40px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.1)_inset]'}`}
        style={{ animation: 'popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
        {/* 타이틀바 */}
        <div className={`h-12 flex-shrink-0 flex items-center px-5 relative border-b ${isDark ? 'bg-gradient-to-b from-[#3a3a3a] to-[#2b2b2b] border-[#111]' : 'bg-gradient-to-b from-[#f6f6f6] to-[#e0e0e0] border-[#d1d1d1]'}`}>
          <div className="flex gap-2">
            <div className="w-[13px] h-[13px] rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <div className="w-[13px] h-[13px] rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>
          <div className={`absolute w-full text-center left-0 text-sm font-semibold pointer-events-none ${isDark ? 'text-[#a1a1aa]' : 'text-[#4d4d4d]'}`}>
            Adaptive_Assessment.app
          </div>
          <button onClick={toggleTheme} className="ml-auto z-10 relative text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" title="다크 모드 전환">
            {isDark ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.32a1 1 0 011.415 0l.708.707a1 1 0 01-1.414 1.415l-.708-.708a1 1 0 010-1.414zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zm-1.32 4.22a1 1 0 010 1.415l-.707.708a1 1 0 01-1.415-1.414l.708-.708a1 1 0 011.414 0zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.22-1.32a1 1 0 01-1.415 0l-.708-.707a1 1 0 011.414-1.415l.708.708a1 1 0 010 1.414zM3 10a1 1 0 011-1h1a1 1 0 110 2H4a1 1 0 01-1-1zm1.32-4.22a1 1 0 010-1.415l.707-.708a1 1 0 011.415 1.414l-.708.708a1 1 0 01-1.414 0zM10 5a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            )}
          </button>
        </div>
        {/* 콘텐츠 영역 */}
        <div className="p-[30px_20px] sm:p-[50px_60px] min-h-[450px] sm:min-h-[550px] overflow-y-auto flex flex-col relative">
          {children}
        </div>
      </div>
    </div>
  );

  // ── 렌더링: 인트로 ──
  if (phase === 'intro') {
    return (
      <PageWrapper showOutsideText>
        <div className="text-center flex flex-col justify-center items-center h-full relative py-4" style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
          <div className="text-gray-800 dark:text-gray-200 drop-shadow-md mb-8">
            {SVG_ICONS.intro}
          </div>
          <span className="text-gray-600 dark:text-gray-400 font-semibold text-sm md:text-base bg-gray-100 dark:bg-gray-800 px-6 py-3 rounded-full mb-10 inline-flex items-center gap-2 border border-gray-200 dark:border-gray-700 shadow-sm tracking-wide">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {t.timerLabel}
          </span>
          <button onClick={startQuiz} className="group relative inline-flex items-center justify-center px-12 py-4 text-[16px] md:text-[18px] font-bold text-white transition-all duration-300 bg-[#1c1c1e] dark:bg-white dark:text-[#1c1c1e] rounded-full hover:bg-[#2c2c2e] dark:hover:bg-gray-200 shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] transform hover:-translate-y-0.5">
            <span>{t.startBtn}</span>
            <svg className="w-5 h-5 ml-2.5 transition-transform duration-200 group-hover:translate-x-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </PageWrapper>
    );
  }

  // ── 렌더링: 퀴즈 ──
  if (phase === 'quiz' && currentQ) {
    const correctIdx = currentQ.options.findIndex(o => o.isCorrect);
    const bonusTime = totalTime - BASE_TIME;
    const timerColor = getTimerColor(timeLeft, totalTime);
    const timerPct = (timeLeft / totalTime) * 100;

    const levelBadgeColor = currentLevel === 1 ? 'bg-gray-400' : currentLevel === 2 ? 'bg-green-500' : currentLevel === 3 ? 'bg-blue-500' : currentLevel === 4 ? 'bg-indigo-500' : 'bg-purple-600';

    return (
      <PageWrapper>
        <div className="flex flex-col h-full relative" style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
          {/* 난이도 애니메이션 */}
          {levelAnim && (
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 z-50">
              <span className="text-gray-700 dark:text-gray-200 bg-white/90 dark:bg-black/80 px-5 py-2.5 rounded-full shadow-md border border-gray-100 dark:border-gray-700 flex items-center gap-2 font-bold text-sm md:text-base whitespace-nowrap"
                style={{ animation: 'floatUp 1s ease-out forwards' }}>
                {levelAnim.type === 'up' && <><svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> {t.levelUp} (Lv.{levelAnim.level})</>}
                {levelAnim.type === 'down' && <><svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg> {t.levelDown} (Lv.{levelAnim.level})</>}
                {levelAnim.type === 'keep' && <><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg> {t.levelKeep}</>}
                {levelAnim.type === 'max' && <><svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" /></svg> {t.levelMax}</>}
              </span>
            </div>
          )}

          {/* 상단 헤더 */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <p className="text-sm md:text-base font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Q {questionIdx + 1} <span className="opacity-50">/ {TOTAL_QUESTIONS}</span>
              </p>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
                <div className={`w-2 h-2 rounded-full ${levelBadgeColor}`} />
                <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300 tracking-wide">Level {currentLevel}</span>
              </div>
              <span className="text-[11px] md:text-[12px] px-2.5 py-1 rounded-md border bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700 hidden sm:inline-block tracking-wide">
                {currentQ.category}
              </span>
            </div>
            <div className={`text-sm md:text-base font-medium flex items-center transition-colors ${timeLeft <= 3 ? 'text-red-500 font-bold animate-pulse' : 'text-gray-500 dark:text-gray-400'}`}>
              <svg className={`w-5 h-5 mr-1.5 ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {timeLeft}{lang === 'ko' || lang === 'ja' ? '초' : 's'}
            </div>
          </div>

          {/* 타이머 바 (그라데이션) */}
          <div className="w-full h-2 md:h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full mb-5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000 ease-linear" style={{ width: `${timerPct}%`, backgroundColor: timerColor }} />
          </div>

          {/* 보너스 타임 알림 */}
          {bonusTime > 0 && (
            <div className="text-[12px] md:text-[13px] text-orange-500 font-bold mb-4 flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 w-fit px-3 py-1.5 rounded">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {t.timeExtended} {bonusTime}{t.timeExtendedSuffix}
            </div>
          )}

          {/* 문제 */}
          <h2 className="text-[16px] md:text-[20px] font-bold text-gray-800 dark:text-gray-100 mb-6 leading-relaxed break-keep">
            {currentQ.question}
          </h2>

          {/* 옵션 카드 (라디오 인디케이터) */}
          <div className={`mb-2 flex-grow ${selected !== null && !showFeedback ? 'has-selection' : ''}`}>
            {currentQ.options.map((opt, i) => {
              let cardClass = 'border-2 border-transparent cursor-pointer select-none transition-all duration-300';
              let radioInner = null;

              if (showFeedback) {
                if (i === correctIdx) {
                  cardClass += isDark ? ' border-emerald-500 bg-emerald-500/20' : ' border-emerald-500 bg-emerald-50';
                } else if (i === selected && !opt.isCorrect) {
                  cardClass += isDark ? ' border-red-500 bg-red-500/20' : ' border-red-500 bg-red-50';
                } else {
                  cardClass += isDark ? ' bg-[#2f2f2f] opacity-50' : ' bg-[#f9fafb] opacity-50';
                }
              } else if (i === selected) {
                cardClass += isDark ? ' border-blue-500 bg-[#1e3a5f] scale-[1.01] shadow-[0_4px_12px_rgba(59,130,246,0.2)] z-10 relative' : ' border-[#007aff] bg-[#eef5ff] scale-[1.01] shadow-[0_4px_12px_rgba(0,122,255,0.15)] z-10 relative';
                radioInner = <div className="w-2.5 h-2.5 md:w-3 md:h-3 bg-blue-500 rounded-full" />;
              } else {
                cardClass += isDark ? ' bg-[#2f2f2f] hover:bg-[#3a3a3a] hover:border-[#4b5563]' : ' bg-[#f9fafb] hover:bg-white hover:shadow-[0_4px_6px_rgba(0,0,0,0.05)] hover:border-[#e5e7eb]';
                // 선택된 항목이 있으면 미선택 항목 dim
                if (selected !== null) {
                  cardClass += ' opacity-40 grayscale-[70%] scale-[0.99] hover:opacity-80 hover:grayscale-[10%] hover:scale-[0.995]';
                }
              }

              return (
                <div key={i} onClick={() => selectOption(i)} className={`p-4 md:p-5 rounded-xl mb-3 md:mb-4 flex items-start active:scale-[0.98] ${cardClass}`}>
                  <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border flex-shrink-0 mt-[2px] mr-4 flex items-center justify-center transition-colors ${i === selected && !showFeedback ? 'border-blue-500' : 'border-gray-400 dark:border-gray-500'}`}>
                    {radioInner}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 text-[15px] md:text-[17px] font-medium leading-relaxed break-keep">{opt.text}</span>
                </div>
              );
            })}
          </div>

          {/* 피드백 메시지 + 정답 확인 버튼 */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 relative pb-2 w-full">
            {showFeedback && (
              <span className={`absolute -top-8 left-1/2 transform -translate-x-1/2 text-base md:text-lg font-black w-full text-center tracking-wide ${selected !== null && currentQ.options[selected]?.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                {selected !== null && currentQ.options[selected]?.isCorrect ? t.correct : (selected === null ? t.timeout : t.wrong)}
              </span>
            )}
            <button
              onClick={() => handleConfirm(false)}
              disabled={selected === null || showFeedback}
              className={`w-full py-4 md:py-5 text-[16px] md:text-[20px] font-bold text-white rounded-xl transition-all duration-300 transform flex justify-center items-center gap-2
                ${selected !== null && !showFeedback
                  ? 'bg-[#007aff] hover:bg-[#0056b3] active:scale-[0.98] shadow-[0_4px_14px_0_rgba(0,122,255,0.4)] hover:shadow-[0_6px_20px_rgba(0,122,255,0.5)]'
                  : 'bg-gray-200 text-gray-400 shadow-none cursor-not-allowed dark:bg-[#2f2f2f] dark:text-gray-500'}`}
            >
              {t.confirmBtn}
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── 렌더링: 리뷰 ──
  if (phase === 'result' && showReview) {
    const reviewAnswers = answers.length > 0 ? answers : [];
    return (
      <PageWrapper>
        <div style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
          <button onClick={() => setShowReview(false)} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-4 font-semibold">
            {t.reviewBack}
          </button>
          <h2 className="text-xl font-black text-gray-800 dark:text-gray-100 mb-6">{t.reviewTitle}</h2>
          {reviewAnswers.map((record, i) => {
            const correctOpt = record.options?.find(o => o.isCorrect);
            const bgClass = record.correct
              ? 'bg-green-50/30 border-green-100 dark:bg-green-900/10 dark:border-green-900/30'
              : 'bg-red-50/30 border-red-100 dark:bg-red-900/10 dark:border-red-900/30';
            return (
              <div key={i} className={`p-4 md:p-6 rounded-xl border mb-5 text-left ${bgClass}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm md:text-base font-black text-gray-400 dark:text-gray-500">0{i + 1}</span>
                    <span className="text-[11px] md:text-[12px] font-bold px-2.5 py-1 rounded-md border bg-white dark:bg-black text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 shadow-sm">Lv.{record.level}</span>
                  </div>
                  <span className={`font-bold text-sm md:text-base ${record.correct ? 'text-green-500' : 'text-red-500'}`}>
                    {record.isTimeout ? t.timeout : record.correct ? t.correct : t.wrong}
                  </span>
                </div>
                <p className="text-[14px] md:text-[16px] font-bold text-gray-800 dark:text-gray-200 mb-4 leading-relaxed break-keep">{record.question}</p>
                {!record.correct && !record.isTimeout && record.selectedIndex !== null && record.options && (
                  <p className="text-red-500 dark:text-red-400 text-sm mb-1">
                    <span className="font-semibold">{t.myChoice}</span> <del>{record.options[record.selectedIndex]?.text}</del>
                  </p>
                )}
                <p className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                  {t.correctAnswer} {correctOpt?.text}
                </p>
              </div>
            );
          })}
        </div>
      </PageWrapper>
    );
  }

  // ── 렌더링: 결과 ──
  if (phase === 'result') {
    const result = savedResult || {
      level: LEVEL_NAMES[finalLevel]?.key,
      levelNum: finalLevel,
      radarScores,
      correctCount: answers.filter(a => a.correct).length,
      totalQuestions: answers.length,
    };
    const levelNum = result.levelNum || finalLevel || 3;
    const levelInfo = LEVEL_NAMES[levelNum] || LEVEL_NAMES[3];
    const scores = result.radarScores || radarScores;
    const iconKey = LEVEL_ICON_MAP[levelNum] || 'intermediate';
    const iconWrapClass = ICON_WRAPPER_CLASSES[levelNum] || ICON_WRAPPER_CLASSES[3];
    const curr = CURRICULUM[levelNum] || CURRICULUM[3];

    const radarData = {
      labels: CATEGORIES_I18N[lang] || CATEGORIES_I18N.ko,
      datasets: [{
        label: lang === 'ko' ? '영역별 정답률(%)' : 'Score by Area (%)',
        data: scores,
        backgroundColor: 'rgba(59, 130, 246, 0.3)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        borderWidth: 2,
      }],
    };

    const radarOptions = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { display: false },
          grid: { color: 'rgba(156, 163, 175, 0.2)' },
          pointLabels: {
            font: { weight: 'bold', size: typeof window !== 'undefined' && window.innerWidth < 640 ? 11 : 13 },
            color: isDark ? '#9ca3af' : '#4b5563',
          },
          angleLines: { color: 'rgba(156, 163, 175, 0.2)' },
        },
      },
      plugins: { legend: { display: false } },
    };

    // 점수 계산 (원본 방식: totalPoints / MAX)
    const correctCount = result.correctCount || 0;
    const totalQ = result.totalQuestions || TOTAL_QUESTIONS;

    return (
      <>
        {/* 이스터에그 오버레이 */}
        {showEasterEgg && (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-4 md:p-8 transition-opacity duration-1000"
            style={{ animation: 'fadeIn 1s ease-out' }}>
            <h1 className="text-white font-black text-[clamp(1.5rem,6vw,3rem)] text-center mb-6 md:mb-8 animate-bounce leading-snug px-2" style={{ textShadow: '0 4px 10px rgba(0,0,0,0.8)' }}>
              {t.easterEggTitle.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br className="sm:hidden" />}{i === 0 && <br className="hidden sm:block" />}</span>)}
            </h1>
            <div className="w-full max-w-4xl flex justify-center items-center shrink min-h-0 relative" style={{ height: 'clamp(250px, 55dvh, 600px)' }}>
              <ZooSvg />
            </div>
            <button onClick={() => setShowEasterEgg(false)} className="mt-8 md:mt-10 px-8 py-4 md:px-12 md:py-5 bg-white text-blue-600 text-base md:text-xl font-bold rounded-full hover:bg-gray-200 transition shadow-[0_0_20px_rgba(255,255,255,0.4)] shrink-0">
              {t.easterEggBtn}
            </button>
          </div>
        )}

        <PageWrapper>
          <div className="text-center flex flex-col h-full" style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
            {/* 레벨 아이콘 */}
            <div className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-[2rem] shadow-sm border mx-auto mb-5 ${iconWrapClass}`}>
              {SVG_ICONS[iconKey]}
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-gray-100 tracking-tight">
              {levelInfo.en}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-[14px] md:text-[16px] mt-3 mb-6 px-2 break-keep">
              {correctCount}/{totalQ} {t.scorePrefix === '종합 점수:' ? '정답' : 'correct'} — {levelInfo[lang] || levelInfo.ko}
            </p>

            {/* 레이더 차트 */}
            <div className="bg-white dark:bg-[#2a2a2a] rounded-xl border border-gray-100 dark:border-gray-700 p-2 mb-6 shadow-inner mx-auto w-full max-w-lg h-56 sm:h-72 relative flex justify-center items-center">
              <Radar data={radarData} options={radarOptions} />
            </div>

            {/* 커리큘럼 추천 */}
            <div className={`rounded-xl p-5 text-left border mb-6 ${curr.wrapClass}`}>
              <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-3 text-base flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                {t.currRecommend}
              </h3>
              <ul className="text-[14px] md:text-[15px] text-gray-600 dark:text-gray-400 space-y-2 pl-1">
                {curr.items.map((item, i) => (
                  <li key={i} className="flex items-start">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-current mr-2.5 shrink-0 mt-1.5 md:mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA */}
            <button onClick={() => navigate(`/signup?level=${levelInfo.key}`)} className="w-full py-4 md:py-5 text-[16px] md:text-[18px] font-bold transition-all duration-300 rounded-xl shadow-sm mb-3 bg-[#1c1c1e] text-white dark:bg-white dark:text-[#1c1c1e] hover:bg-[#2c2c2e] dark:hover:bg-gray-200">
              {t.signupBtn}
            </button>

            <button onClick={() => navigate('/login')} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium transition-colors mb-4">
              {t.loginLink}
            </button>

            {/* 상세 리포트 */}
            {answers.length > 0 && (
              <button onClick={() => setShowReview(true)} className="w-full py-4 md:py-5 text-[16px] md:text-[18px] font-bold text-[#1c1c1e] bg-gray-100 hover:bg-gray-200 dark:bg-white dark:text-[#1c1c1e] dark:hover:bg-gray-200 rounded-xl transition-all duration-300 mt-auto shadow-sm">
                {t.reviewBtn}
              </button>
            )}
          </div>
        </PageWrapper>
      </>
    );
  }

  return null;
}
