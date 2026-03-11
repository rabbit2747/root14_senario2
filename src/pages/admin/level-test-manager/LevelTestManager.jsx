import { useState, useEffect, useCallback } from 'react';
import { getAllQuestions, createQuestion, updateQuestion, deleteQuestion, importQuestions } from '../../../api/levelTest';
import { CATEGORIES, LEVEL_NAMES } from '../../../data/level-test-questions';
import { Add, TrashCan, Edit, Download, Upload, View, Checkmark, Close } from '@carbon/icons-react';

const LEVELS = [1, 2, 3, 4, 5];

export default function LevelTestManager({ requestVerify }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState(0); // 0 = 전체
  const [filterCategory, setFilterCategory] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    level: 1, category: CATEGORIES[0], question: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
  });
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 데이터 로드
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllQuestions();
      setQuestions(data);
    } catch (e) {
      setError('문제 목록을 불러오지 못했습니다: ' + e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // 필터링
  const filtered = questions.filter(q => {
    if (!q.is_active) return false;
    if (filterLevel && q.level !== filterLevel) return false;
    if (filterCategory && q.category !== filterCategory) return false;
    return true;
  });

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      level: 1, category: CATEGORIES[0], question: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    });
    setEditingId(null);
    setShowForm(false);
  };

  // 저장
  const handleSave = async () => {
    if (!formData.question.trim()) { setError('문제 내용을 입력해주세요.'); return; }
    if (formData.options.some(o => !o.text.trim())) { setError('모든 선택지를 입력해주세요.'); return; }
    if (!formData.options.some(o => o.isCorrect)) { setError('정답을 선택해주세요.'); return; }

    try {
      if (editingId) {
        await updateQuestion(editingId, {
          level: formData.level,
          category: formData.category,
          question: formData.question,
          options: formData.options,
        });
        setSuccessMsg('문제가 수정되었습니다.');
      } else {
        await createQuestion({
          level: formData.level,
          category: formData.category,
          question: formData.question,
          options: formData.options,
        });
        setSuccessMsg('문제가 추가되었습니다.');
      }
      resetForm();
      loadData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setError('저장 실패: ' + e.message);
    }
  };

  // 수정 시작
  const startEdit = (q) => {
    setFormData({
      level: q.level,
      category: q.category,
      question: q.question,
      options: q.options,
    });
    setEditingId(q.id);
    setShowForm(true);
  };

  // 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('이 문제를 비활성화하시겠습니까?')) return;
    try {
      await deleteQuestion(id);
      setSuccessMsg('문제가 비활성화되었습니다.');
      loadData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      setError('삭제 실패: ' + e.message);
    }
  };

  // JSON Export
  const handleExport = () => {
    const exportData = filtered.map(({ id, created_at, updated_at, is_active, ...rest }) => rest);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `level-test-questions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON Import
  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error('JSON 배열이 필요합니다.');
      const valid = data.filter(q => q.level && q.category && q.question && Array.isArray(q.options));
      if (valid.length === 0) throw new Error('유효한 문제가 없습니다.');

      requestVerify(async () => {
        await importQuestions(valid);
        setSuccessMsg(`${valid.length}개 문제가 등록되었습니다.`);
        loadData();
        setTimeout(() => setSuccessMsg(''), 3000);
      });
    } catch (err) {
      setError('Import 실패: ' + err.message);
    }
    e.target.value = '';
  };

  // 정답 변경
  const setCorrectOption = (idx) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((o, i) => ({ ...o, isCorrect: i === idx })),
    }));
  };

  // 선택지 텍스트 변경
  const setOptionText = (idx, text) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((o, i) => i === idx ? { ...o, text } : o),
    }));
  };

  // 레벨별 통계
  const stats = LEVELS.map(lv => ({
    level: lv,
    count: questions.filter(q => q.level === lv && q.is_active).length,
    name: LEVEL_NAMES[lv]?.ko || `Lv.${lv}`,
  }));

  return (
    <div>
      {/* 헤더 */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-lg font-black text-slate-800">레벨 테스트 문제 관리</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors"
          >
            <Add size={14} /> 문제 추가
          </button>
          <button onClick={handleExport}
            className="flex items-center gap-1 px-3 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition-colors">
            <Download size={14} /> Export
          </button>
          <label className="flex items-center gap-1 px-3 py-2 bg-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-300 transition-colors cursor-pointer">
            <Upload size={14} /> Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* 알림 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-mono flex justify-between">
          {error}
          <button onClick={() => setError('')}><Close size={14} /></button>
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-mono">
          ✅ {successMsg}
        </div>
      )}

      {/* 통계 바 */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {stats.map(s => (
          <button key={s.level}
            onClick={() => setFilterLevel(filterLevel === s.level ? 0 : s.level)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition-colors shrink-0 ${
              filterLevel === s.level ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200'
            }`}>
            Lv.{s.level} {s.name} <span className="text-slate-400">({s.count})</span>
          </button>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterCategory('')}
          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors shrink-0 ${
            !filterCategory ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
          }`}>전체</button>
        {CATEGORIES.map(c => (
          <button key={c}
            onClick={() => setFilterCategory(filterCategory === c ? '' : c)}
            className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors shrink-0 ${
              filterCategory === c ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-200'
            }`}>{c}</button>
        ))}
      </div>

      {/* 문제 추가/수정 폼 */}
      {showForm && (
        <div className="mb-6 p-5 bg-white border-2 border-blue-300 rounded-xl shadow-lg">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            {editingId ? '✏️ 문제 수정' : '➕ 새 문제 추가'}
          </h3>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">레벨</label>
              <select value={formData.level} onChange={e => setFormData({ ...formData, level: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm">
                {LEVELS.map(lv => <option key={lv} value={lv}>Lv.{lv} {LEVEL_NAMES[lv]?.ko}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">카테고리</label>
              <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">문제</label>
            <textarea value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })}
              rows={3} className="w-full px-3 py-2 border border-slate-300 rounded text-sm resize-none" placeholder="문제 내용을 입력하세요" />
          </div>

          <div className="mb-4">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">선택지 (정답 클릭)</label>
            {formData.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setCorrectOption(i)}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    opt.isCorrect ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 text-transparent hover:border-green-400'
                  }`}>
                  <Checkmark size={12} />
                </button>
                <span className="text-xs font-bold text-slate-400 w-5">{String.fromCharCode(65 + i)}.</span>
                <input value={opt.text} onChange={e => setOptionText(i, e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm" placeholder={`선택지 ${i + 1}`} />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500">저장</button>
            <button onClick={resetForm}
              className="px-4 py-2 bg-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-300">취소</button>
          </div>
        </div>
      )}

      {/* 문제 목록 */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-mono text-sm">로딩 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400 font-mono text-sm">
          {questions.length === 0 ? '등록된 문제가 없습니다. JSON Import로 일괄 등록해보세요.' : '필터 조건에 맞는 문제가 없습니다.'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((q) => {
            const correctOpt = q.options?.find(o => o.isCorrect);
            return (
              <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-4 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-slate-100 text-slate-500">
                        Lv.{q.level}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-50 text-blue-600">
                        {q.category}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 font-medium leading-relaxed">{q.question}</p>
                    <p className="text-[10px] text-green-600 font-mono mt-1">✅ {correctOpt?.text}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(q)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(q.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                      <TrashCan size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 하단 통계 */}
      <div className="mt-6 text-center text-xs text-slate-400 font-mono">
        총 {questions.filter(q => q.is_active).length}개 문제 | 표시: {filtered.length}개
      </div>
    </div>
  );
}
