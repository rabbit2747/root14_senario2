import AnnouncementPreview from './AnnouncementPreview';
import FeedbackBoard from './FeedbackBoard';

/**
 * 매트릭스 대시보드 뷰 — 공지사항 + 피드백 2분할 + 매트릭스 Full 보기 버튼
 */
export default function CommunitySection({ onShowMatrix, language }) {
  return (
    <div className="w-full">
      {/* 상단: 매트릭스 Full 보기 버튼 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-lg font-black text-slate-800 tracking-tight">
            {language === 'ko' ? '대시보드' : language === 'ja' ? 'ダッシュボード' : language === 'zh' ? '仪表板' : language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {language === 'ko' ? '최신 공지사항과 커뮤니티 피드백을 확인하세요' : 'Latest announcements and community feedback'}
          </p>
        </div>
        <button
          onClick={onShowMatrix}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0d1b2a] text-white text-[12px] font-bold rounded-xl hover:bg-[#1b2d45] transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          <span className="text-sm">🔳</span>
          {language === 'ko' ? '매트릭스 Full 보기' : language === 'ja' ? 'マトリクス全体表示' : language === 'zh' ? '查看完整矩阵' : language === 'hi' ? 'पूर्ण मैट्रिक्स देखें' : 'View Full Matrix'}
          <span className="text-[10px] opacity-60">→</span>
        </button>
      </div>

      {/* 2분할 그리드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ minHeight: 400 }}>
        {/* 좌측: 공지사항 프리뷰 */}
        <AnnouncementPreview language={language} />

        {/* 우측: 피드백 게시판 */}
        <FeedbackBoard language={language} />
      </div>
    </div>
  );
}
