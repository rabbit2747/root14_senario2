import { useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import useAnnouncements from '../../../hooks/useAnnouncements';
import AdminGuideSection from '../../../components/admin/AdminGuideSection';
import { Bullhorn, Pin, PinFilled, MailAll } from '@carbon/icons-react';

const CATEGORY_OPTIONS = [
  { value: 'general',     label: '일반',     icon: '📄' },
  { value: 'update',      label: '업데이트', icon: '🔄' },
  { value: 'maintenance', label: '점검',     icon: '🔧' },
  { value: 'event',       label: '이벤트',   icon: '🎉' },
  { value: 'important',   label: '중요',     icon: '🚨' },
];

const CATEGORY_STYLE = {
  general:     { bg: 'bg-slate-100', text: 'text-slate-600' },
  update:      { bg: 'bg-blue-50',   text: 'text-blue-600' },
  maintenance: { bg: 'bg-amber-50',  text: 'text-amber-600' },
  event:       { bg: 'bg-purple-50', text: 'text-purple-600' },
  important:   { bg: 'bg-red-50',    text: 'text-red-600' },
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

const emptyForm = { title: '', content: '', category: 'general', is_pinned: false };

export default function AnnouncementManager({ requestVerify }) {
  const { user } = useAuth();
  const {
    announcements, loading, error, setError,
    createAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin,
  } = useAnnouncements(100);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const handleOpenNew = () => {
    setEditId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const handleEdit = (ann) => {
    setEditId(ann.id);
    setForm({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      is_pinned: ann.is_pinned,
    });
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ ...emptyForm });
    setError(null);
  };

  const handleSave = useCallback(async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setError('제목과 내용을 입력해주세요');
      return;
    }
    const ok = await requestVerify();
    if (!ok) return;

    setSaving(true);
    let result;
    if (editId) {
      result = await updateAnnouncement(editId, form);
    } else {
      result = await createAnnouncement(form);
    }
    setSaving(false);

    if (result.success) {
      handleCancel();
    }
  }, [form, editId, requestVerify, user, createAnnouncement, updateAnnouncement, setError]);

  const handleDelete = useCallback(async (id) => {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;
    const ok = await requestVerify();
    if (!ok) return;

    setDeleting(id);
    await deleteAnnouncement(id);
    setDeleting(null);
  }, [requestVerify, deleteAnnouncement]);

  const handleTogglePin = useCallback(async (id, currentPinned) => {
    const ok = await requestVerify();
    if (!ok) return;
    await togglePin(id, currentPinned);
  }, [requestVerify, togglePin]);

  return (
    <div>
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2"><Bullhorn size={20} /> 공지 관리</h2>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500">
            {announcements.length}
          </span>
        </div>
        <button
          onClick={handleOpenNew}
          disabled={showForm}
          className="px-4 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
        >
          + 새 공지 작성
        </button>
      </div>

      {/* 에러 */}
      {error && (
        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 font-bold">✕</button>
        </div>
      )}

      {/* 작성/편집 폼 */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-4">
            {editId ? '공지 수정' : '새 공지 작성'}
          </h3>

          <div className="space-y-4">
            {/* 제목 */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">제목</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="공지사항 제목을 입력하세요"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                autoFocus
              />
            </div>

            {/* 카테고리 + 고정 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">카테고리</label>
                <select
                  value={form.category}
                  onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
                >
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.icon} {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_pinned}
                    onChange={e => setForm(prev => ({ ...prev, is_pinned: e.target.checked }))}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-bold text-slate-600 flex items-center gap-1"><PinFilled size={16} /> 상단 고정</span>
                </label>
              </div>
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">내용</label>
              <textarea
                value={form.content}
                onChange={e => setForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="공지사항 내용을 입력하세요"
                rows={6}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
              >
                {saving ? '저장 중...' : editId ? '수정' : '등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 목록 테이블 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400 bg-white rounded-xl border border-slate-200">
          <MailAll size={32} className="mb-3" />
          <p className="text-sm font-bold">공지사항이 없습니다</p>
          <p className="text-xs mt-1">"새 공지 작성" 버튼을 클릭하여 첫 공지를 등록하세요</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">고정</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">카테고리</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">제목</th>
                <th className="text-left px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">작성일</th>
                <th className="text-right px-4 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {announcements.map(ann => {
                const cat = CATEGORY_STYLE[ann.category] || CATEGORY_STYLE.general;
                const catOpt = CATEGORY_OPTIONS.find(o => o.value === ann.category);
                return (
                  <tr key={ann.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleTogglePin(ann.id, ann.is_pinned)}
                        className={`text-sm transition-opacity ${ann.is_pinned ? 'opacity-100' : 'opacity-20 hover:opacity-60'}`}
                        title={ann.is_pinned ? '고정 해제' : '고정'}
                      >
                        {ann.is_pinned ? <PinFilled size={16} /> : <Pin size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${cat.bg} ${cat.text}`}>
                        {catOpt?.label || ann.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-bold text-slate-700">{ann.title}</span>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[300px]">
                        {ann.content.length > 50 ? ann.content.slice(0, 50) + '...' : ann.content}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-slate-400">{formatDate(ann.created_at)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(ann)}
                          className="text-[11px] font-bold text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          편집
                        </button>
                        <button
                          onClick={() => handleDelete(ann.id)}
                          disabled={deleting === ann.id}
                          className="text-[11px] font-bold text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deleting === ann.id ? '...' : '삭제'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <AdminGuideSection
        steps={[
          '+ 새 공지 작성 버튼으로 공지를 생성합니다',
          '카테고리: 일반(📄), 업데이트(🔄), 점검(🔧), 이벤트(🎉), 중요(🚨)',
          '고정(📌): 활성화하면 공지 목록 최상단에 고정됩니다',
          '기존 공지를 클릭하면 수정 모드로 전환됩니다',
          '공지 내용은 대시보드 메인 화면에 자동 노출됩니다',
        ]}
      />
    </div>
  );
}
