// Vercel Serverless Function — POST /api/level-test/check
// 답안 채점 (서버사이드, 정답 노출 방지)

import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

let _cache = null;
function getLocalQuestions() {
  if (_cache) return _cache;
  try {
    const raw = readFileSync(join(process.cwd(), 'server-data', 'level-test-questions.json'), 'utf-8');
    _cache = JSON.parse(raw);
  } catch { _cache = []; }
  return _cache;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { questionId, answerIndex } = req.body || {};
  if (!questionId || answerIndex === undefined) {
    return res.status(400).json({ error: 'questionId and answerIndex required' });
  }

  try {
    let opts = null;

    // 1차: Supabase
    if (!String(questionId).startsWith('local-')) {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/level_test_questions?select=options&id=eq.${encodeURIComponent(questionId)}&is_active=eq.true`,
        { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` } }
      );
      if (r.ok) {
        const data = await r.json();
        if (Array.isArray(data) && data.length > 0) opts = data[0].options;
      }
    }

    // 2차: 서버 파일 폴백
    if (!opts) {
      const localIdx = String(questionId).startsWith('local-')
        ? parseInt(String(questionId).replace('local-', ''), 10)
        : -1;
      if (localIdx >= 0) {
        const bank = getLocalQuestions();
        if (bank[localIdx]) opts = bank[localIdx].options;
      }
    }

    if (!opts) return res.status(404).json({ error: 'Question not found' });

    const correctIdx = Array.isArray(opts)
      ? opts.findIndex(o => o.isCorrect === true || o.correct === true)
      : -1;

    res.json({ correct: Number(answerIndex) === correctIdx, correctIndex: correctIdx });
  } catch (err) {
    console.error('[level-test] check error:', err.message);
    res.status(500).json({ error: 'Check failed' });
  }
}
