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
import { QUESTION_BANK, CATEGORIES, LEVEL_NAMES, LEVEL_COLORS } from '../data/level-test-questions';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

// ── 상수 ──
const TOTAL_QUESTIONS = 7;
const BASE_TIME = 15;
const LONG_Q_BONUS = 3;
const STORAGE_KEY = 'gotroot_level_test_result';

// 레벨→점수 매핑 (레이더 차트용)
const LEVEL_SCORE = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };

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
    return s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
  });
}

// ── 메인 컴포넌트 ──
export default function LevelTest() {
  const navigate = useNavigate();
  const { isLoggedIn, userLevel } = useAuth();

  // 이미 로그인 + 레벨 있는 사용자 → 차단
  useEffect(() => {
    if (isLoggedIn && userLevel) {
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, userLevel, navigate]);

  // 이미 완료한 비로그인 사용자 → 결과 화면 직행
  const savedResult = useMemo(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  const [phase, setPhase] = useState(savedResult ? 'result' : 'intro'); // intro | quiz | result
  const [bank, setBank] = useState(QUESTION_BANK);
  const [currentLevel, setCurrentLevel] = useState(3);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [usedIds, setUsedIds] = useState(new Set());
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(BASE_TIME);
  const [finalLevel, setFinalLevel] = useState(savedResult?.level || null);
  const [radarScores, setRadarScores] = useState(savedResult?.radarScores || []);
  const [isDark, setIsDark] = useState(true);
  const timerRef = useRef(null);

  // Supabase에서 문제 불러오기 (실패 시 정적 데이터 폴백)
  useEffect(() => {
    (async () => {
      try {
        const data = await getQuestions();
        if (data && data.length >= 20) {
          const grouped = {};
          data.forEach(q => {
            const lv = q.level;
            if (!grouped[lv]) grouped[lv] = [];
            grouped[lv].push({
              level: lv,
              category: q.category,
              question: q.question,
              options: q.options,
            });
          });
          if (Object.keys(grouped).length >= 3) setBank(grouped);
        }
      } catch {
        // 폴백: 정적 데이터 사용
      }
    })();
  }, []);

  // 다음 문제 뽑기
  const loadNextQuestion = useCallback(() => {
    const q = pickQuestion(bank, currentLevel, usedIds);
    if (!q) {
      // 해당 레벨 문제 소진 → 인접 레벨 시도
      for (let delta = 1; delta <= 4; delta++) {
        for (const d of [delta, -delta]) {
          const altQ = pickQuestion(bank, currentLevel + d, usedIds);
          if (altQ) {
            setCurrentQ(altQ);
            const bonus = altQ.question.length > 80 ? LONG_Q_BONUS : 0;
            setTimeLeft(BASE_TIME + bonus);
            return;
          }
        }
      }
      finishQuiz();
      return;
    }
    setCurrentQ(q);
    const bonus = q.question.length > 80 ? LONG_Q_BONUS : 0;
    setTimeLeft(BASE_TIME + bonus);
  }, [bank, currentLevel, usedIds]);

  // 타이머
  useEffect(() => {
    if (phase !== 'quiz' || showFeedback || !currentQ) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null); // 시간 초과 = 오답
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
    const q = pickQuestion(bank, 3, new Set());
    if (q) {
      setCurrentQ(q);
      setUsedIds(new Set([q._id]));
      const bonus = q.question.length > 80 ? LONG_Q_BONUS : 0;
      setTimeLeft(BASE_TIME + bonus);
    }
  };

  // 답변 처리
  const handleAnswer = useCallback((optionIdx) => {
    if (showFeedback) return;
    clearInterval(timerRef.current);

    const isCorrect = optionIdx !== null && currentQ?.options[optionIdx]?.isCorrect;
    setSelected(optionIdx);
    setShowFeedback(true);

    const newAnswer = {
      level: currentLevel,
      category: currentQ?.category || '보안기초',
      correct: !!isCorrect,
      question: currentQ?.question,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    // 난이도 조정
    let nextLevel = currentLevel;
    if (isCorrect) nextLevel = Math.min(5, currentLevel + 1);
    else nextLevel = Math.max(1, currentLevel - 1);

    const nextIdx = questionIdx + 1;

    setTimeout(() => {
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
          setTimeLeft(BASE_TIME + bonus);
        } else {
          finishQuiz(updatedAnswers);
        }
      }
    }, 1200);
  }, [showFeedback, currentQ, currentLevel, answers, questionIdx, usedIds, bank]);

  // 퀴즈 완료
  const finishQuiz = (finalAnswers) => {
    const ans = finalAnswers || answers;
    const level = determineFinalLevel(ans);
    const scores = computeRadarScores(ans);
    setFinalLevel(level);
    setRadarScores(scores);
    setPhase('result');

    // sessionStorage에 결과 저장 (signup 연계)
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
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 100, spread: 120, origin: { y: 0.4 } }), 300);
      }, 500);
    }
  };

  // ── 렌더링: 인트로 ──
  if (phase === 'intro') {
    return (
      <div className="min-h-[100dvh] bg-[#0d1b2a] flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          {/* macOS 윈도우 */}
          <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
            {/* 타이틀바 */}
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="flex-1 text-center text-xs font-mono text-slate-400">
                GOTROOT — Level Assessment
              </span>
            </div>

            <div className="bg-[#0f172a] p-6 sm:p-8">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4">🎯</div>
                <h1 className="text-xl font-black text-white tracking-wider mb-2">
                  사이버보안 레벨 테스트
                </h1>
                <p className="text-slate-400 text-sm font-mono">
                  7문제로 당신의 실력을 측정합니다
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  ['⏱️', '문제당 15~25초 제한시간'],
                  ['📊', '적응형 난이도 — 실력에 맞춰 변화'],
                  ['🏆', '5단계 레벨 판정 + 레이더 차트'],
                ].map(([icon, text]) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="text-lg">{icon}</span>
                    <span className="font-mono">{text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={startQuiz}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wider rounded-lg transition-all active:scale-[0.98]"
              >
                테스트 시작하기
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full mt-3 py-2 text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors"
              >
                ← 메인으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 렌더링: 퀴즈 ──
  if (phase === 'quiz' && currentQ) {
    const progress = ((questionIdx) / TOTAL_QUESTIONS) * 100;
    const correctIdx = currentQ.options.findIndex(o => o.isCorrect);

    return (
      <div className="min-h-[100dvh] bg-[#0d1b2a] flex items-center justify-center px-4">
        <div className="w-full max-w-2xl">
          <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
            {/* 타이틀바 */}
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="flex-1 text-center text-xs font-mono text-slate-400">
                Question {questionIdx + 1} / {TOTAL_QUESTIONS}
              </span>
              <span className="text-xs font-mono text-slate-500">
                Lv.{currentLevel}
              </span>
            </div>

            <div className="bg-[#0f172a] p-5 sm:p-8">
              {/* 진행바 + 타이머 */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className={`text-sm font-mono font-bold min-w-[2.5rem] text-right ${
                  timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-slate-400'
                }`}>
                  {timeLeft}s
                </span>
              </div>

              {/* 문제 */}
              <div className="mb-6">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-400 mb-3">
                  {currentQ.category}
                </span>
                <h2 className="text-white text-base sm:text-lg font-bold leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* 선택지 */}
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  let cls = 'border-slate-700 text-slate-300 hover:border-blue-500 hover:bg-blue-500/10';
                  if (showFeedback) {
                    if (i === correctIdx) cls = 'border-green-500 bg-green-500/20 text-green-300';
                    else if (i === selected && !opt.isCorrect) cls = 'border-red-500 bg-red-500/20 text-red-300';
                    else cls = 'border-slate-800 text-slate-600';
                  } else if (i === selected) {
                    cls = 'border-blue-500 bg-blue-500/20 text-blue-300';
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => !showFeedback && handleAnswer(i)}
                      disabled={showFeedback}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all text-sm font-mono ${cls}`}
                    >
                      <span className="font-bold mr-2 text-slate-500">{String.fromCharCode(65 + i)}.</span>
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* 피드백 */}
              {showFeedback && (
                <div className={`mt-4 p-3 rounded-lg text-sm font-mono ${
                  selected !== null && currentQ.options[selected]?.isCorrect
                    ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {selected !== null && currentQ.options[selected]?.isCorrect
                    ? '✅ 정답입니다!'
                    : `❌ 오답 — 정답: ${currentQ.options[correctIdx]?.text}`}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
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
    const levelColor = LEVEL_COLORS[levelNum] || '#a855f7';
    const scores = result.radarScores || radarScores;

    const radarData = {
      labels: CATEGORIES,
      datasets: [{
        label: '역량 분석',
        data: scores,
        backgroundColor: `${levelColor}33`,
        borderColor: levelColor,
        borderWidth: 2,
        pointBackgroundColor: levelColor,
        pointRadius: 4,
      }],
    };

    const radarOptions = {
      responsive: true,
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: { display: false },
          grid: { color: 'rgba(100,116,139,0.2)' },
          pointLabels: { color: '#94a3b8', font: { size: 11 } },
          angleLines: { color: 'rgba(100,116,139,0.15)' },
        },
      },
      plugins: { legend: { display: false } },
    };

    return (
      <div className="min-h-[100dvh] bg-[#0d1b2a] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          <div className="rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
            {/* 타이틀바 */}
            <div className="bg-slate-800 px-4 py-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="flex-1 text-center text-xs font-mono text-slate-400">
                Assessment Complete
              </span>
            </div>

            <div className="bg-[#0f172a] p-6 sm:p-8">
              {/* 레벨 배지 */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-3"
                  style={{ borderColor: levelColor, color: levelColor }}>
                  <span className="text-2xl">
                    {levelNum === 5 ? '⭐' : levelNum === 4 ? '🔴' : levelNum === 3 ? '🔵' : levelNum === 2 ? '🟢' : '🟡'}
                  </span>
                  <span className="font-black text-lg tracking-wider">
                    {levelInfo.en}
                  </span>
                </div>
                <h2 className="text-white text-xl font-bold">
                  당신의 레벨: <span style={{ color: levelColor }}>{levelInfo.ko}</span>
                </h2>
                <p className="text-slate-400 text-sm font-mono mt-1">
                  {result.correctCount || 0}/{result.totalQuestions || TOTAL_QUESTIONS} 정답
                </p>
              </div>

              {/* 레이더 차트 */}
              <div className="mx-auto max-w-[280px] mb-6">
                <Radar data={radarData} options={radarOptions} />
              </div>

              {/* 커리큘럼 추천 */}
              <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700/50">
                <h3 className="text-sm font-bold text-slate-300 mb-2">📋 추천 커리큘럼</h3>
                <p className="text-xs text-slate-400 font-mono leading-relaxed">
                  {levelNum <= 2
                    ? 'IT 기초 학습 과정을 먼저 수강한 후, MITRE ATT&CK 매트릭스 기반 교육을 진행하세요.'
                    : 'MITRE ATT&CK 매트릭스 기반 교육을 바로 시작할 수 있습니다. 실전 시나리오 랩을 활용해보세요.'
                  }
                </p>
              </div>

              {/* CTA 버튼 */}
              <button
                onClick={() => navigate(`/signup?level=${levelInfo.key}`)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm tracking-wider rounded-lg transition-all active:scale-[0.98] mb-3"
              >
                회원가입하고 학습 시작하기
              </button>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-2 text-slate-500 hover:text-slate-300 text-xs font-mono transition-colors"
              >
                이미 계정이 있으신가요? 로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
