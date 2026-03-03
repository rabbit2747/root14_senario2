import { useState, useEffect, useCallback } from 'react';
import { supabase, logAdminAudit } from '../../lib/supabase';
import { maskEmail, maskName } from '../../lib/maskUtils';
import AdminGuideSection from '../../components/admin/AdminGuideSection';
import { WarningAlt, View } from '@carbon/icons-react';

const ROLE_OPTIONS = ['user', 'admin'];

export default function UserManager({ requestVerify }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [revealedIds, setRevealedIds] = useState(new Set());
  const [unmaskedOnceIds] = useState(() => new Set()); // 1회 해제 추적 (새로고침 시 초기화)
  const [showUnmaskDialog, setShowUnmaskDialog] = useState(null); // 경고 다이얼로그 대상 userId

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, approved, role, marketing_consent')
      .order('email');
    if (!error) setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // 민감정보 마스킹 해제 (1회 제한 + 경고 + 감사 로그)
  const handleReveal = useCallback((userId) => {
    // 이미 해제됨 → 아무 동작 안 함 (1회 제한)
    if (unmaskedOnceIds.has(userId)) return;
    // 경고 다이얼로그 표시
    setShowUnmaskDialog(userId);
  }, [unmaskedOnceIds]);

  // 경고 확인 후 실제 해제 실행
  const confirmUnmask = useCallback(async () => {
    const userId = showUnmaskDialog;
    if (!userId) return;
    setShowUnmaskDialog(null);

    // 비밀번호 재검증
    if (requestVerify) {
      const ok = await requestVerify();
      if (!ok) return;
    }

    // 해제 + 1회 제한 등록
    setRevealedIds(prev => new Set(prev).add(userId));
    unmaskedOnceIds.add(userId);

    // 감사 로그 기록
    const user = users.find(u => u.id === userId);
    logAdminAudit('user_data_unmask', `user_${userId}`, {
      target_email: user ? maskEmail(user.email) : 'unknown',
      target_name: user ? (user.name ? maskName(user.name) : '-') : 'unknown',
    });
  }, [showUnmaskDialog, requestVerify, unmaskedOnceIds, users]);

  const toggleApproved = async (id, current) => {
    if (requestVerify) {
      const ok = await requestVerify();
      if (!ok) return;
    }
    setSaving(id);
    await supabase.from('profiles').update({ approved: !current }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, approved: !current } : u));
    logAdminAudit('user_approval_toggle', `user_${id}`, { approved: !current });
    setSaving(null);
  };

  const changeRole = async (id, role) => {
    if (requestVerify) {
      const ok = await requestVerify();
      if (!ok) return;
    }
    setSaving(id);
    await supabase.from('profiles').update({ role }).eq('id', id);
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    logAdminAudit('user_role_change', `user_${id}`, { new_role: role });
    setSaving(null);
  };

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {/* ── 마스킹 해제 경고 다이얼로그 ── */}
      {showUnmaskDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-amber-200 max-w-sm w-full mx-4 overflow-hidden">
            <div className="bg-amber-50 px-5 py-4 border-b border-amber-200">
              <h3 className="text-sm font-black text-amber-800 flex items-center gap-2">
                <WarningAlt size={20} className="inline" /> 개인정보 열람 안내
              </h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                이 사용자의 마스킹을 해제하면:
              </p>
              <ul className="text-xs text-slate-600 space-y-1.5 pl-1">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>
                  <span>이메일/이름 <strong className="text-slate-800">원본</strong>이 표시됩니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>이 행위는 <strong className="text-red-600">감사 로그에 기록</strong>됩니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>새로고침 전까지 <strong className="text-slate-800">다시 마스킹할 수 없습니다</strong></span>
                </li>
              </ul>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => setShowUnmaskDialog(null)}
                className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                취소
              </button>
              <button
                onClick={confirmUnmask}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-colors"
              >
                확인 — 열람하기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-black text-slate-800">
          사용자 관리
          <span className="ml-2 text-sm font-bold text-slate-400">({users.length}명)</span>
        </h2>
        <button onClick={fetchUsers} className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors">
          새로고침
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">이메일</th>
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">이름</th>
              <th className="text-center px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">승인</th>
              <th className="text-center px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">역할</th>
              <th className="text-center px-4 py-3 text-[11px] font-black text-slate-500 uppercase tracking-wider">마케팅</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const revealed = revealedIds.has(u.id);
              const alreadyUnmasked = unmaskedOnceIds.has(u.id);
              return (
                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                  {/* 이메일 (마스킹) */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-600">
                        {revealed ? u.email : maskEmail(u.email)}
                      </span>
                      <button
                        onClick={() => handleReveal(u.id)}
                        disabled={alreadyUnmasked}
                        className={`text-[9px] px-1.5 py-0.5 rounded transition-colors shrink-0 ${
                          alreadyUnmasked
                            ? 'bg-blue-50 text-blue-400 cursor-not-allowed opacity-60'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                        }`}
                        title={alreadyUnmasked ? '이미 열람됨 (새로고침 시 재마스킹)' : '개인정보 원본 열람'}
                      >
                        {alreadyUnmasked ? '🔓' : <View size={16} />}
                      </button>
                    </div>
                  </td>
                  {/* 이름 (마스킹) */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700 font-medium">
                      {revealed ? (u.name || '-') : (u.name ? maskName(u.name) : '-')}
                    </span>
                  </td>
                  {/* 승인 */}
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleApproved(u.id, u.approved)}
                      disabled={saving === u.id}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all border ${u.approved ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'}`}
                    >
                      {u.approved ? '승인됨' : '미승인'}
                    </button>
                  </td>
                  {/* 역할 */}
                  <td className="px-4 py-3 text-center">
                    <select
                      value={u.role || 'user'}
                      onChange={e => changeRole(u.id, e.target.value)}
                      disabled={saving === u.id}
                      className="text-xs font-bold px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
                    >
                      {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  {/* 마케팅 */}
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-bold ${u.marketing_consent ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {u.marketing_consent ? '동의' : '미동의'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <p className="text-center py-8 text-sm text-slate-400">사용자 없음</p>}
      </div>

      <AdminGuideSection
        steps={[
          '가입 신청한 사용자 목록이 표시됩니다',
          '승인 버튼으로 사용자의 로그인 접근을 허용합니다',
          '역할 드롭다운: user(일반) / admin(관리자) 전환',
          '👁 버튼: 개인정보 원본 열람 (⚠️ 감사 로그 기록, 새로고침 전까지 1회만 가능)',
        ]}
        tips={[
          'admin 역할 부여는 신중하게 — 모든 관리 기능에 접근 가능해집니다',
          '마스킹 해제 시 감사 로그(user_data_unmask)가 자동 기록됩니다',
        ]}
      />
    </div>
  );
}
