import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Shield, Swords, ArrowRight, PartyPopper } from 'lucide-react';
import GuidedCertificate from './GuidedCertificate';

/**
 * 축하 + 분기 선택 (챕터9: 공격 완료, 챕터14: 최종 수료)
 * config: {
 *   type: 'midpoint' | 'final',
 *   summary: [{ emoji, label, description }],
 *   choices?: [{ id, label, description, emoji }]
 * }
 */
export default function CompletionCelebration({ config, isDark, onComplete, onChoiceSelect, userName, techniqueId, chapterMeta, totalChapters }) {
  const { type = 'midpoint', summary = [], choices = [] } = config || {};
  const [showItems, setShowItems] = useState(0);
  const [showCert, setShowCert] = useState(false);

  // 아이템 순차 표시 애니메이션
  useEffect(() => {
    if (showItems < summary.length) {
      const timer = setTimeout(() => setShowItems(s => s + 1), 400);
      return () => clearTimeout(timer);
    }
  }, [showItems, summary.length]);

  const isFinal = type === 'final';

  return (
    <div className="text-center py-4">
      {/* 헤더 */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
        className="mb-6"
      >
        <div className="text-6xl mb-4">{isFinal ? '🏆' : '🎉'}</div>
        <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          {isFinal ? '전 과정을 수료했습니다!' : '공격자 파트를 완료했습니다!'}
        </h2>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {isFinal
            ? '공격과 방어, 양쪽을 모두 체험한 당신은 이제 진정한 보안 전문가입니다.'
            : '여기까지 정말 대단한 여정이었습니다. 소중한 경험을 함께 정리해볼까요?'}
        </p>
      </motion.div>

      {/* 요약 아이템 */}
      <div className="space-y-3 mb-8 max-w-md mx-auto text-left">
        {summary.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={i < showItems ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-3 p-3 rounded-xl ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
          >
            <span className="text-xl flex-shrink-0">{item.emoji}</span>
            <div>
              <div className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.label}</div>
              <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{item.description}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 분기 선택 (midpoint에서만) */}
      {!isFinal && choices.length > 0 && showItems >= summary.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <div className={`text-sm font-semibold mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            다음 단계를 선택하세요
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
            {choices.map(choice => (
              <button
                key={choice.id}
                onClick={() => {
                  onComplete?.();
                  onChoiceSelect?.(choice.id);
                }}
                className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  choice.id === 'continue'
                    ? (isDark ? 'border-red-500/40 bg-red-900/10 hover:bg-red-900/20' : 'border-red-300 bg-red-50 hover:bg-red-100')
                    : (isDark ? 'border-emerald-500/40 bg-emerald-900/10 hover:bg-emerald-900/20' : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100')
                }`}
              >
                <div className="text-2xl mb-2">{choice.emoji}</div>
                <div className={`text-sm font-bold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{choice.label}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{choice.description}</div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 최종 수료 시 버튼 */}
      {isFinal && showItems >= summary.length && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <button
            onClick={() => { onComplete?.(); setShowCert(true); }}
            className={`inline-flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.03] active:scale-[0.97] ${isDark ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-900/30' : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-200'}`}
          >
            <Trophy size={18} /> 수료증 확인하기
          </button>
        </motion.div>
      )}

      {/* 수료증 모달 */}
      <GuidedCertificate
        isOpen={showCert}
        onClose={() => setShowCert(false)}
        userName={userName}
        techniqueId={techniqueId}
        chapterMeta={chapterMeta}
        totalChapters={totalChapters}
        isDark={isDark}
      />
    </div>
  );
}
