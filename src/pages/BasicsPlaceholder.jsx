import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function BasicsPlaceholder() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login?redirect=/basics', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) return null;

  return (
    <div className="min-h-[100dvh] bg-[#0d1b2a] flex items-center justify-center px-4">
      <Link
        to="/"
        className="fixed top-4 left-4 z-50 flex items-center gap-1 text-slate-500 hover:text-white text-xs font-bold font-mono transition-colors"
      >
        <ArrowLeftIcon className="w-3 h-3" /> Matrix
      </Link>

      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">🔧</div>
        <h1 className="text-2xl font-black text-white tracking-wider mb-4">
          IT 기초 학습 페이지
        </h1>
        <p className="text-slate-400 font-mono text-sm mb-2">
          현재 준비 중입니다.
        </p>
        <p className="text-slate-500 font-mono text-xs mb-8">
          기초 학습을 마치면 MITRE ATT&CK 매트릭스 학습이 가능합니다.
        </p>

        <Link
          to="/"
          className="inline-block px-6 py-3 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white font-bold text-sm tracking-wider transition-all rounded-lg"
        >
          매트릭스로 이동 →
        </Link>
      </div>
    </div>
  );
}
