import { useState, useEffect, useRef } from 'react';

export default function AdminVerifyModal({ showModal, verifying, error, submitPassword, cancelVerify }) {
  const [password, setPassword] = useState('');
  const inputRef = useRef(null);

  // 모달 열릴 때 초기화 + 포커스
  useEffect(() => {
    if (showModal) {
      setPassword('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showModal]);

  // ESC 키 처리
  useEffect(() => {
    if (!showModal) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') cancelVerify();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showModal, cancelVerify]);

  if (!showModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!password.trim() || verifying) return;
    submitPassword(password);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-[90vw] sm:w-80 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 아이콘 + 제목 */}
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-sm font-black text-slate-800">관리자 작업 확인</h3>
          <p className="text-[11px] text-slate-400 mt-1">보안을 위해 비밀번호를 다시 입력해 주세요</p>
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <input
            ref={inputRef}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
            placeholder="비밀번호 입력"
            autoComplete="current-password"
            disabled={verifying}
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <p className="text-xs text-red-500 font-bold text-center bg-red-50 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={cancelVerify}
            disabled={verifying}
            className="flex-1 text-xs font-bold py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={!password.trim() || verifying}
            className="flex-1 text-xs font-bold py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {verifying ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                확인 중...
              </>
            ) : (
              '확인'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
